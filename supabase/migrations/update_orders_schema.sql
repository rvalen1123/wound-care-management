-- Add manufacturer table
CREATE TABLE manufacturers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  default_doctor_discount DECIMAL(5,2) DEFAULT 40.00, -- Default 40% discount
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add manufacturer_commission_rates table
CREATE TABLE manufacturer_commission_rates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manufacturer_id UUID REFERENCES manufacturers(id),
  user_id UUID REFERENCES users(id),
  commission_rate DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(manufacturer_id, user_id)
);

-- Modify orders table
ALTER TABLE orders
  -- Add manufacturer
  ADD COLUMN manufacturer_id UUID REFERENCES manufacturers(id),
  -- Add doctor discount rate
  ADD COLUMN doctor_discount_rate DECIMAL(5,2),
  -- Make rep-related columns nullable and add commission rates
  ALTER COLUMN rep_id DROP NOT NULL,
  ALTER COLUMN rep_commission_rate SET DEFAULT NULL,
  ADD COLUMN rep_commission_rate DECIMAL(5,2),
  -- Add master rep fields (nullable)
  ADD COLUMN master_rep_commission_rate DECIMAL(5,2),
  -- Add sub rep fields (nullable)
  ADD COLUMN sub_rep_commission_rate DECIMAL(5,2),
  -- Add sub-sub rep fields (nullable)
  ADD COLUMN sub_sub_rep_id UUID REFERENCES users(id),
  ADD COLUMN sub_sub_rep_commission DECIMAL(10,2),
  ADD COLUMN sub_sub_rep_commission_rate DECIMAL(5,2),
  -- Add invoice calculation fields
  ADD COLUMN invoice_billed_medicare DECIMAL(10,2),
  ADD COLUMN invoice_to_doctor DECIMAL(10,2);

-- Add triggers to auto-calculate invoice_to_doctor
CREATE OR REPLACE FUNCTION calculate_doctor_invoice()
RETURNS TRIGGER AS $$
BEGIN
  -- Use doctor_discount_rate if specified, otherwise use manufacturer default
  NEW.doctor_discount_rate := COALESCE(
    NEW.doctor_discount_rate,
    (SELECT default_doctor_discount FROM manufacturers WHERE id = NEW.manufacturer_id)
  );
  
  -- Calculate invoice to doctor (if medicare amount is provided)
  IF NEW.invoice_billed_medicare IS NOT NULL THEN
    NEW.invoice_to_doctor := NEW.invoice_billed_medicare * (1 - (NEW.doctor_discount_rate / 100));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_doctor_invoice
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_doctor_invoice();

-- Add function to get default commission rate for a user and manufacturer
CREATE OR REPLACE FUNCTION get_default_commission_rate(p_user_id UUID, p_manufacturer_id UUID)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  RETURN (
    SELECT commission_rate 
    FROM manufacturer_commission_rates 
    WHERE user_id = p_user_id 
    AND manufacturer_id = p_manufacturer_id
  );
END;
$$ LANGUAGE plpgsql;