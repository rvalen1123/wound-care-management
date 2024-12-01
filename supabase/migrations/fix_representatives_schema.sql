-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      changed_by
    ) VALUES (
      TG_TABLE_NAME::TEXT,
      NEW.rep_id,
      TG_OP,
      row_to_json(OLD),
      row_to_json(NEW),
      current_user
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (
      table_name,
      record_id,
      action,
      new_values,
      changed_by
    ) VALUES (
      TG_TABLE_NAME::TEXT,
      NEW.rep_id,
      TG_OP,
      row_to_json(NEW),
      current_user
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing foreign key constraints if they exist
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_rep_id_fkey;

-- Drop existing columns if they exist
ALTER TABLE orders 
  DROP COLUMN IF EXISTS rep_id;

-- Create representatives table if it doesn't exist
CREATE TABLE IF NOT EXISTS representatives (
  rep_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  rep_name VARCHAR NOT NULL,
  commission_formula VARCHAR,
  rep_type VARCHAR CHECK (rep_type IN ('master', 'sub', 'sub-sub')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Add commission-related columns to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS msc_commission_str VARCHAR,
  ADD COLUMN IF NOT EXISTS msc_commission NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS msc_paid_date DATE,
  ADD COLUMN IF NOT EXISTS rep_id INTEGER REFERENCES representatives(rep_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_rep_id ON orders(rep_id);
CREATE INDEX IF NOT EXISTS idx_representatives_rep_type ON representatives(rep_type);

-- Add comments for documentation
COMMENT ON TABLE representatives IS 'Sales representatives information';
COMMENT ON COLUMN representatives.rep_id IS 'Unique identifier for the representative';
COMMENT ON COLUMN representatives.rep_name IS 'Name of the representative';
COMMENT ON COLUMN representatives.commission_formula IS 'Formula used to calculate commission';
COMMENT ON COLUMN representatives.rep_type IS 'Type of representative (master, sub, or sub-sub)';

COMMENT ON COLUMN orders.msc_commission_str IS 'Commission structure string';
COMMENT ON COLUMN orders.msc_commission IS 'Calculated commission amount';
COMMENT ON COLUMN orders.msc_paid_date IS 'Date when commission was paid';
COMMENT ON COLUMN orders.rep_id IS 'Reference to the representative';

-- Add RLS policies
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can do everything on representatives"
  ON representatives FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Reps can only view their own records and related records
CREATE POLICY "Reps can view their own records"
  ON representatives FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'rep_id' = rep_id::text
    )
  );

-- Update the audit trigger for representatives
DROP TRIGGER IF EXISTS representatives_audit_trigger ON representatives;
CREATE TRIGGER representatives_audit_trigger
  AFTER INSERT OR UPDATE ON representatives
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
