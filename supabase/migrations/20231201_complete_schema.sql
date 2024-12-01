-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  default_credit_terms TEXT DEFAULT 'net 60',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  national_asp DECIMAL(10,2) NOT NULL,
  size TEXT NOT NULL,
  default_commission_rate DECIMAL(5,2) DEFAULT 40.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Modify orders table with additional fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS date_of_service DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS units INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_to_doc DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expected_collection_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('paid', 'partial', 'outstanding'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS msc_commission DECIMAL(10,2);

-- Pricing history table
CREATE TABLE IF NOT EXISTS pricing_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  quarter TEXT NOT NULL,
  national_asp DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  manufacturer_paid DECIMAL(10,2) NOT NULL,
  remaining_balance DECIMAL(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add audit trigger function if not exists
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
      NEW.id,
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
      NEW.id,
      TG_OP,
      row_to_json(NEW),
      NEW.created_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit_log table
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

-- Add triggers for auditing
CREATE TRIGGER orders_audit_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER products_audit_trigger
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER doctors_audit_trigger
  AFTER INSERT OR UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Add RLS policies
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can do everything on doctors"
  ON doctors FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admins can do everything on products"
  ON products FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admins can do everything on pricing_history"
  ON pricing_history FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admins can do everything on payments"
  ON payments FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Read-only policies for reps
CREATE POLICY "Reps can view doctors"
  ON doctors FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'rep'
  ));

CREATE POLICY "Reps can view products"
  ON products FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'rep'
  ));

CREATE POLICY "Reps can view their own orders' payments"
  ON payments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT master_rep_id FROM orders WHERE id = payments.order_id
      UNION
      SELECT sub_rep_id FROM orders WHERE id = payments.order_id
      UNION
      SELECT sub_sub_rep_id FROM orders WHERE id = payments.order_id
    )
  );

-- Functions for auto-calculations
CREATE OR REPLACE FUNCTION calculate_expected_collection_date(service_date DATE, credit_terms TEXT)
RETURNS DATE AS $$
BEGIN
  RETURN service_date + 
    CASE credit_terms
      WHEN 'net 30' THEN 30
      WHEN 'net 45' THEN 45
      WHEN 'net 60' THEN 60
      ELSE 60
    END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_units_from_size(size TEXT)
RETURNS INTEGER AS $$
BEGIN
  -- Example calculation, adjust based on actual requirements
  RETURN CASE
    WHEN size = '2x3' THEN 6
    WHEN size = '4x4' THEN 16
    WHEN size = '6x6' THEN 36
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate values on orders
CREATE OR REPLACE FUNCTION orders_auto_calculate()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate units if size is provided
  IF NEW.size IS NOT NULL THEN
    NEW.units := calculate_units_from_size(NEW.size);
  END IF;

  -- Calculate expected collection date
  IF NEW.date_of_service IS NOT NULL THEN
    NEW.expected_collection_date := calculate_expected_collection_date(
      NEW.date_of_service,
      (SELECT default_credit_terms FROM doctors WHERE id = NEW.doctor_id)
    );
  END IF;

  -- Calculate invoice_to_doc if not manually set
  IF NEW.invoice_to_doc IS NULL AND NEW.units IS NOT NULL THEN
    NEW.invoice_to_doc := (
      SELECT (national_asp * NEW.units * 0.6)
      FROM products
      WHERE id = NEW.product_id
    );
  END IF;

  -- Calculate MSC commission if not manually set
  IF NEW.msc_commission IS NULL AND NEW.invoice_to_doc IS NOT NULL THEN
    NEW.msc_commission := (
      SELECT (NEW.invoice_to_doc * (default_commission_rate / 100))
      FROM products
      WHERE id = NEW.product_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_auto_calculate_trigger
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION orders_auto_calculate(); 