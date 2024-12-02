-- First, rename the representatives table to reps for consistency and simplicity
ALTER TABLE representatives RENAME TO reps;

-- Add rep_type to reps table
ALTER TABLE reps 
ADD COLUMN rep_type VARCHAR CHECK (rep_type IN ('master', 'sub', 'sub-sub'));

-- Create junction table for rep hierarchies
CREATE TABLE IF NOT EXISTS rep_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_rep_id UUID REFERENCES reps(id) ON DELETE CASCADE,
    child_rep_id UUID REFERENCES reps(id) ON DELETE CASCADE,
    relationship_type VARCHAR NOT NULL CHECK (relationship_type IN ('master-sub', 'sub-subsub')),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    commission_split DECIMAL(5,2), -- e.g., 60.00 means parent gets 60%, child gets 40%
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_active_relationship UNIQUE(parent_rep_id, child_rep_id, relationship_type),
    CONSTRAINT no_self_relationship CHECK (parent_rep_id != child_rep_id)
);

-- Create junction table for rep-doctor relationships
CREATE TABLE IF NOT EXISTS rep_doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rep_id UUID REFERENCES reps(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_rep_doctor UNIQUE(rep_id, doctor_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rep_relationships_parent ON rep_relationships(parent_rep_id);
CREATE INDEX IF NOT EXISTS idx_rep_relationships_child ON rep_relationships(child_rep_id);
CREATE INDEX IF NOT EXISTS idx_rep_doctors_rep ON rep_doctors(rep_id);
CREATE INDEX IF NOT EXISTS idx_rep_doctors_doctor ON rep_doctors(doctor_id);
CREATE INDEX IF NOT EXISTS idx_rep_doctors_primary ON rep_doctors(doctor_id) WHERE is_primary = true;

-- Update orders table to use single rep_id column
ALTER TABLE orders 
DROP COLUMN master_rep_id,
DROP COLUMN sub_rep_id,
DROP COLUMN sub_sub_rep_id,
ADD COLUMN rep_id UUID REFERENCES reps(id);

-- Enable RLS
ALTER TABLE rep_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_doctors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rep_relationships
CREATE POLICY "Admins can do everything on rep_relationships" 
ON rep_relationships FOR ALL TO authenticated 
USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Reps can view their own relationships" 
ON rep_relationships FOR SELECT TO authenticated 
USING (
    auth.uid() IN (
        SELECT user_id FROM profiles WHERE role = 'rep'
    )
    AND (
        parent_rep_id IN (SELECT id FROM reps WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
        OR 
        child_rep_id IN (SELECT id FROM reps WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
);

-- RLS Policies for rep_doctors
CREATE POLICY "Admins can do everything on rep_doctors" 
ON rep_doctors FOR ALL TO authenticated 
USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Reps can view their own doctor relationships" 
ON rep_doctors FOR SELECT TO authenticated 
USING (
    auth.uid() IN (
        SELECT user_id FROM profiles WHERE role = 'rep'
    )
    AND rep_id IN (
        SELECT id FROM reps WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
);

-- Function to ensure only one primary rep per doctor
CREATE OR REPLACE FUNCTION ensure_single_primary_rep()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary THEN
        UPDATE rep_doctors
        SET is_primary = false
        WHERE doctor_id = NEW.doctor_id
        AND rep_id != NEW.rep_id
        AND is_primary = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for primary rep updates
CREATE TRIGGER ensure_single_primary_rep_trigger
    BEFORE INSERT OR UPDATE ON rep_doctors
    FOR EACH ROW
    WHEN (NEW.is_primary = true)
    EXECUTE FUNCTION ensure_single_primary_rep();

-- Add audit triggers
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rep_relationships_timestamp
    BEFORE UPDATE ON rep_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_rep_doctors_timestamp
    BEFORE UPDATE ON rep_doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add helpful comments
COMMENT ON TABLE reps IS 'All sales representatives';
COMMENT ON TABLE rep_relationships IS 'Hierarchical relationships between reps (master-sub, sub-subsub)';
COMMENT ON TABLE rep_doctors IS 'Relationships between reps and doctors, including primary rep designation';
COMMENT ON COLUMN rep_relationships.commission_split IS 'Percentage of commission that goes to the parent rep';
COMMENT ON COLUMN rep_relationships.relationship_type IS 'Type of relationship: master-sub for master to sub rep, sub-subsub for sub to sub-sub rep';
