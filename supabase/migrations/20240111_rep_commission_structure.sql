-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create reps table with flat structure
CREATE TABLE IF NOT EXISTS reps (
    rep_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    status VARCHAR DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rep relationships junction table
CREATE TABLE IF NOT EXISTS rep_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_rep_id UUID REFERENCES reps(rep_id) ON DELETE CASCADE,
    child_rep_id UUID REFERENCES reps(rep_id) ON DELETE CASCADE,
    commission_split DECIMAL(5,2) NOT NULL, -- percentage that parent gets from child's commission
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR DEFAULT 'pending', -- pending, active, inactive
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_active_relationship UNIQUE(parent_rep_id, child_rep_id),
    CONSTRAINT no_self_relationship CHECK (parent_rep_id != child_rep_id),
    CONSTRAINT valid_commission_split CHECK (commission_split BETWEEN 0 AND 100)
);

-- Update orders table to use rep_id
ALTER TABLE orders 
DROP COLUMN IF EXISTS master_rep_id,
DROP COLUMN IF EXISTS sub_rep_id,
DROP COLUMN IF EXISTS sub_sub_rep_id;

ALTER TABLE orders
ADD COLUMN rep_id UUID REFERENCES reps(rep_id);

-- Create commission structures table
CREATE TABLE IF NOT EXISTS commission_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
    rep_id UUID REFERENCES reps(rep_id) ON DELETE CASCADE,
    base_commission_amount DECIMAL(10,2) NOT NULL,
    final_commission_amount DECIMAL(10,2), -- Calculated after splits
    status VARCHAR DEFAULT 'pending', -- pending, approved, rejected
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create commission splits table to track actual splits
CREATE TABLE IF NOT EXISTS commission_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commission_structure_id UUID REFERENCES commission_structures(id) ON DELETE CASCADE,
    rep_id UUID REFERENCES reps(rep_id) ON DELETE CASCADE,
    split_percentage DECIMAL(5,2) NOT NULL,
    split_amount DECIMAL(10,2) NOT NULL,
    relationship_id UUID REFERENCES rep_relationships(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_split_percentage CHECK (split_percentage BETWEEN 0 AND 100)
);

-- Create pending commission reviews table
CREATE TABLE IF NOT EXISTS pending_commission_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commission_structure_id UUID REFERENCES commission_structures(id) ON DELETE CASCADE,
    proposed_by UUID REFERENCES reps(rep_id),
    reviewed_by UUID REFERENCES auth.users(id),
    status VARCHAR DEFAULT 'pending', -- pending, approved, rejected
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rep_relationships_parent ON rep_relationships(parent_rep_id);
CREATE INDEX IF NOT EXISTS idx_rep_relationships_child ON rep_relationships(child_rep_id);
CREATE INDEX IF NOT EXISTS idx_commission_structures_order ON commission_structures(order_id);
CREATE INDEX IF NOT EXISTS idx_commission_structures_rep ON commission_structures(rep_id);
CREATE INDEX IF NOT EXISTS idx_commission_splits_structure ON commission_splits(commission_structure_id);
CREATE INDEX IF NOT EXISTS idx_commission_splits_rep ON commission_splits(rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_rep ON orders(rep_id);

-- Enable RLS
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_commission_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Reps table policies
CREATE POLICY "Admins can do everything on reps" ON reps
    FOR ALL TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY "Reps can view all reps" ON reps
    FOR SELECT TO authenticated
    USING (true);

-- Rep relationships policies
CREATE POLICY "Admins can do everything on rep_relationships" ON rep_relationships
    FOR ALL TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY "Reps can view their relationships" ON rep_relationships
    FOR SELECT TO authenticated
    USING (
        parent_rep_id IN (SELECT rep_id FROM reps WHERE email = auth.jwt()->>'email')
        OR 
        child_rep_id IN (SELECT rep_id FROM reps WHERE email = auth.jwt()->>'email')
    );

-- Commission structures policies
CREATE POLICY "Admins can do everything on commission_structures" ON commission_structures
    FOR ALL TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY "Reps can view their commission structures" ON commission_structures
    FOR SELECT TO authenticated
    USING (
        rep_id IN (SELECT rep_id FROM reps WHERE email = auth.jwt()->>'email')
        OR
        rep_id IN (
            SELECT child_rep_id FROM rep_relationships 
            WHERE parent_rep_id IN (
                SELECT rep_id FROM reps WHERE email = auth.jwt()->>'email'
            )
        )
    );

-- Functions for commission calculations
CREATE OR REPLACE FUNCTION calculate_commission_splits()
RETURNS TRIGGER AS $$
DECLARE
    v_parent_rep_id UUID;
    v_commission_split DECIMAL;
    v_remaining_amount DECIMAL;
BEGIN
    -- Start with the full commission amount
    v_remaining_amount := NEW.base_commission_amount;
    
    -- Insert split for the original rep
    INSERT INTO commission_splits (
        commission_structure_id,
        rep_id,
        split_percentage,
        split_amount
    ) VALUES (
        NEW.id,
        NEW.rep_id,
        100,
        v_remaining_amount
    );

    -- Recursively calculate splits for parent reps
    WITH RECURSIVE rep_hierarchy AS (
        -- Base case: direct parent
        SELECT 
            rr.parent_rep_id,
            rr.child_rep_id,
            rr.commission_split,
            1 as level
        FROM rep_relationships rr
        WHERE rr.child_rep_id = NEW.rep_id
        AND rr.status = 'active'
        
        UNION ALL
        
        -- Recursive case: parent's parent
        SELECT 
            rr.parent_rep_id,
            rr.child_rep_id,
            rr.commission_split,
            rh.level + 1
        FROM rep_relationships rr
        JOIN rep_hierarchy rh ON rr.child_rep_id = rh.parent_rep_id
        WHERE rr.status = 'active'
    )
    INSERT INTO commission_splits (
        commission_structure_id,
        rep_id,
        split_percentage,
        split_amount,
        relationship_id
    )
    SELECT 
        NEW.id,
        rh.parent_rep_id,
        rh.commission_split,
        (NEW.base_commission_amount * (rh.commission_split / 100)),
        (SELECT id FROM rep_relationships WHERE parent_rep_id = rh.parent_rep_id AND child_rep_id = rh.child_rep_id)
    FROM rep_hierarchy rh;

    -- Update final commission amount
    NEW.final_commission_amount := v_remaining_amount;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for commission calculations
CREATE TRIGGER calculate_commission_splits_trigger
    AFTER INSERT ON commission_structures
    FOR EACH ROW
    EXECUTE FUNCTION calculate_commission_splits();

-- Add helpful comments
COMMENT ON TABLE reps IS 'All sales representatives with a flat structure';
COMMENT ON TABLE rep_relationships IS 'Hierarchical relationships between reps with commission splits';
COMMENT ON TABLE commission_structures IS 'Commission structures for orders with approval workflow';
COMMENT ON TABLE commission_splits IS 'Actual commission splits calculated based on relationships';
COMMENT ON TABLE pending_commission_reviews IS 'Workflow for reviewing and approving commission structures';
