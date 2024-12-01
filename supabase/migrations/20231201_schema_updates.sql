-- Step 1: Add missing columns and convert existing tables to proper types
ALTER TABLE representatives 
  ADD COLUMN IF NOT EXISTS parent_rep_id UUID REFERENCES representatives(rep_id),
  ADD COLUMN IF NOT EXISTS default_commission_rate DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('master', 'sub', 'sub-sub')),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Step 2: Enhance products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ADD COLUMN IF NOT EXISTS manufacturer TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT,
  ADD COLUMN IF NOT EXISTS default_commission_rate DECIMAL(5,2) DEFAULT 40.00,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Step 3: Create pricing history table
CREATE TABLE IF NOT EXISTS pricing_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  quarter TEXT NOT NULL,
  national_asp DECIMAL(10,2) NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Step 4: Enhance orders table with proper relationships
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id),
  ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(doctor_id),
  ADD COLUMN IF NOT EXISTS master_rep_id UUID REFERENCES representatives(rep_id),
  ADD COLUMN IF NOT EXISTS sub_rep_id UUID REFERENCES representatives(rep_id),
  ADD COLUMN IF NOT EXISTS sub_sub_rep_id UUID REFERENCES representatives(rep_id),
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'approved', 'paid', 'partial', 'outstanding')),
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Step 5: Create commission_structures table
CREATE TABLE IF NOT EXISTS commission_structures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(order_id),
  master_rep_id UUID REFERENCES representatives(rep_id),
  sub_rep_id UUID REFERENCES representatives(rep_id),
  sub_sub_rep_id UUID REFERENCES representatives(rep_id),
  master_rep_rate DECIMAL(5,2),
  sub_rep_rate DECIMAL(5,2),
  sub_sub_rep_rate DECIMAL(5,2),
  total_commission DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ,
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_commission_rates 
    CHECK (
      COALESCE(master_rep_rate, 0) + 
      COALESCE(sub_rep_rate, 0) + 
      COALESCE(sub_sub_rep_rate, 0) <= 100
    )
);

-- Step 6: Enhance payment tracking
ALTER TABLE paymentbatches
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'processed', 'failed')),
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('manufacturer', 'commission')),
  ADD COLUMN IF NOT EXISTS recipient_type TEXT CHECK (recipient_type IN ('manufacturer', 'master_rep', 'sub_rep', 'sub_sub_rep')),
  ADD COLUMN IF NOT EXISTS recipient_id UUID,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES auth.users(id);

-- Step 7: Create comprehensive audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 8: Create audit trigger function
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
      CASE 
        WHEN TG_TABLE_NAME = 'orders' THEN NEW.order_id
        WHEN TG_TABLE_NAME = 'representatives' THEN NEW.rep_id
        WHEN TG_TABLE_NAME = 'doctors' THEN NEW.doctor_id
        ELSE NEW.id
      END,
      TG_OP,
      row_to_json(OLD),
      row_to_json(NEW),
      NEW.updated_by
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
      CASE 
        WHEN TG_TABLE_NAME = 'orders' THEN NEW.order_id
        WHEN TG_TABLE_NAME = 'representatives' THEN NEW.rep_id
        WHEN TG_TABLE_NAME = 'doctors' THEN NEW.doctor_id
        ELSE NEW.id
      END,
      TG_OP,
      row_to_json(NEW),
      NEW.created_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Add audit triggers to all relevant tables
CREATE TRIGGER orders_audit_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER representatives_audit_trigger
  AFTER INSERT OR UPDATE ON representatives
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER products_audit_trigger
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER doctors_audit_trigger
  AFTER INSERT OR UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER commission_structures_audit_trigger
  AFTER INSERT OR UPDATE ON commission_structures
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER paymentbatches_audit_trigger
  AFTER INSERT OR UPDATE ON paymentbatches
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Step 10: Add RLS policies
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can do everything"
  ON representatives FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admins can do everything"
  ON products FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admins can do everything"
  ON pricing_history FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admins can do everything"
  ON commission_structures FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Rep policies
CREATE POLICY "Reps can view their own data"
  ON representatives FOR SELECT
  USING (
    auth.uid() = rep_id OR
    auth.uid() = parent_rep_id OR
    auth.uid() IN (
      SELECT rep_id FROM representatives WHERE parent_rep_id = auth.uid()
    )
  );

CREATE POLICY "Reps can view commission structures"
  ON commission_structures FOR SELECT
  USING (
    auth.uid() = master_rep_id OR
    auth.uid() = sub_rep_id OR
    auth.uid() = sub_sub_rep_id
  );

-- Functions for auto-calculations
CREATE OR REPLACE FUNCTION calculate_commission_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate commission amounts based on rates and total commission
  IF NEW.total_commission IS NOT NULL THEN
    IF NEW.master_rep_rate IS NOT NULL THEN
      NEW.master_rep_amount := (NEW.total_commission * NEW.master_rep_rate / 100);
    END IF;
    
    IF NEW.sub_rep_rate IS NOT NULL THEN
      NEW.sub_rep_amount := (NEW.total_commission * NEW.sub_rep_rate / 100);
    END IF;
    
    IF NEW.sub_sub_rep_rate IS NOT NULL THEN
      NEW.sub_sub_rep_amount := (NEW.total_commission * NEW.sub_sub_rep_rate / 100);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER commission_amounts_trigger
  BEFORE INSERT OR UPDATE ON commission_structures
  FOR EACH ROW EXECUTE FUNCTION calculate_commission_amounts();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_doctor_id ON orders(doctor_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_master_rep_id ON orders(master_rep_id);
CREATE INDEX IF NOT EXISTS idx_commission_structures_order_id ON commission_structures(order_id);
CREATE INDEX IF NOT EXISTS idx_paymentbatches_order_id ON paymentbatches(order_id);
CREATE INDEX IF NOT EXISTS idx_pricing_history_product_id ON pricing_history(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON audit_log(record_id); 