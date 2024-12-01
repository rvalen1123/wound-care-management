-- Update the calculate_expected_collection_date function to use correct column names
CREATE OR REPLACE FUNCTION public.calculate_expected_collection_date(service_date DATE, credit_terms TEXT)
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

-- Update the calculate_units_from_size function to use graph_size
CREATE OR REPLACE FUNCTION public.calculate_units_from_size(graph_size TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN graph_size = '2x3' THEN 6
    WHEN graph_size = '4x4' THEN 16
    WHEN graph_size = '6x6' THEN 36
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql;

-- Update the orders_auto_calculate trigger function to use correct column names
CREATE OR REPLACE FUNCTION public.orders_auto_calculate()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate units if graph_size is provided
  IF NEW.graph_size IS NOT NULL THEN
    NEW.units := calculate_units_from_size(NEW.graph_size);
  END IF;

  -- Calculate expected collection date
  IF NEW.date_of_service IS NOT NULL THEN
    NEW.expected_collection_date := calculate_expected_collection_date(
      NEW.date_of_service,
      (SELECT default_credit_terms FROM doctors WHERE doctor_id = NEW.doctor_id)
    );
  END IF;

  -- Calculate invoice_to_doc if not manually set
  IF NEW.invoice_to_doc IS NULL AND NEW.units IS NOT NULL THEN
    NEW.invoice_to_doc := (
      SELECT ("National ASP" * NEW.units * 0.6)
      FROM products
      WHERE "Product" = NEW."Q Code"
    );
  END IF;

  -- Calculate MSC commission if not manually set
  IF NEW.msc_commission IS NULL AND NEW.invoice_to_doc IS NOT NULL THEN
    NEW.msc_commission := NEW.invoice_to_doc * 0.4; -- 40% commission rate
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS orders_auto_calculate_trigger ON orders;
CREATE TRIGGER orders_auto_calculate_trigger
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION orders_auto_calculate();

-- Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
DO $$ 
BEGIN
  -- Orders updated_at trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'orders_updated_at_trigger') THEN
    CREATE TRIGGER orders_updated_at_trigger
      BEFORE UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Doctors updated_at trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'doctors_updated_at_trigger') THEN
    CREATE TRIGGER doctors_updated_at_trigger
      BEFORE UPDATE ON doctors
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Products updated_at trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'products_updated_at_trigger') THEN
    CREATE TRIGGER products_updated_at_trigger
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Payments updated_at trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'payments_updated_at_trigger') THEN
    CREATE TRIGGER payments_updated_at_trigger
      BEFORE UPDATE ON payments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
