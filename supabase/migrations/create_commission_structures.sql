-- Commission structures table
CREATE TABLE commission_structures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  master_rep_id UUID REFERENCES auth.users(id),
  sub_rep_id UUID REFERENCES auth.users(id),
  sub_sub_rep_id UUID REFERENCES auth.users(id),
  manufacturer_id UUID REFERENCES manufacturers(id),
  
  -- Default commission rates
  master_rep_rate DECIMAL(5,2),
  sub_rep_rate DECIMAL(5,2),
  sub_sub_rep_rate DECIMAL(5,2),
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ,
  
  -- Ensure rates sum to 100%
  CONSTRAINT valid_commission_rates 
    CHECK (
      COALESCE(master_rep_rate, 0) + 
      COALESCE(sub_rep_rate, 0) + 
      COALESCE(sub_sub_rep_rate, 0) <= 100
    )
);

-- Commission structure audit log
CREATE TABLE commission_structure_audit (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  commission_structure_id UUID REFERENCES commission_structures(id),
  order_id UUID REFERENCES orders(id),
  
  -- Previous values
  previous_master_rate DECIMAL(5,2),
  previous_sub_rate DECIMAL(5,2),
  previous_sub_sub_rate DECIMAL(5,2),
  
  -- New values
  new_master_rate DECIMAL(5,2),
  new_sub_rate DECIMAL(5,2),
  new_sub_sub_rate DECIMAL(5,2),
  
  -- Audit info
  changed_by UUID REFERENCES auth.users(id) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);

-- RLS Policies
ALTER TABLE commission_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_structure_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can modify commission structures
CREATE POLICY "Only admins can modify commission structures"
  ON commission_structures
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- View access for relevant reps
CREATE POLICY "Reps can view their commission structures"
  ON commission_structures
  FOR SELECT
  USING (
    auth.uid() IN (master_rep_id, sub_rep_id, sub_sub_rep_id)
  );

-- Function to calculate commission breakdown
CREATE OR REPLACE FUNCTION calculate_commission_breakdown(
  p_total_commission DECIMAL,
  p_master_rate DECIMAL,
  p_sub_rate DECIMAL,
  p_sub_sub_rate DECIMAL
) RETURNS TABLE (
  master_commission DECIMAL,
  sub_commission DECIMAL,
  sub_sub_commission DECIMAL
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND((p_total_commission * (p_master_rate / 100))::DECIMAL, 2),
    ROUND((p_total_commission * (p_sub_rate / 100))::DECIMAL, 2),
    ROUND((p_total_commission * (p_sub_sub_rate / 100))::DECIMAL, 2);
END;
$$;

-- Function to get default commission structure
CREATE OR REPLACE FUNCTION get_default_commission_structure(
  p_master_rep_id UUID,
  p_sub_rep_id UUID,
  p_sub_sub_rep_id UUID,
  p_manufacturer_id UUID
) RETURNS commission_structures
LANGUAGE plpgsql AS $$
BEGIN
  RETURN (
    SELECT *
    FROM commission_structures
    WHERE master_rep_id = p_master_rep_id
    AND COALESCE(sub_rep_id, p_sub_rep_id) IS NOT DISTINCT FROM p_sub_rep_id
    AND COALESCE(sub_sub_rep_id, p_sub_sub_rep_id) IS NOT DISTINCT FROM p_sub_sub_rep_id
    AND manufacturer_id = p_manufacturer_id
    ORDER BY created_at DESC
    LIMIT 1
  );
END;
$$; 