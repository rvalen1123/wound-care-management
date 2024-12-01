-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add RLS policies
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

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
