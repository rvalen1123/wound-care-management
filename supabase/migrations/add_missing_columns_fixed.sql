-- Add any missing columns to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS order_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ADD COLUMN IF NOT EXISTS doctor_id UUID,
  ADD COLUMN IF NOT EXISTS date_of_service DATE,
  ADD COLUMN IF NOT EXISTS credit_terms VARCHAR,
  ADD COLUMN IF NOT EXISTS type_of_graph VARCHAR,
  ADD COLUMN IF NOT EXISTS units INTEGER,
  ADD COLUMN IF NOT EXISTS "Q Code" VARCHAR,
  ADD COLUMN IF NOT EXISTS invoice_amount_billed DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS invoice_to_doc DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS expected_collection_date DATE,
  ADD COLUMN IF NOT EXISTS manufacturer_paid_date DATE,
  ADD COLUMN IF NOT EXISTS amount_paid_to_manufacturer DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS running_balance_owed DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS manufacturer_payment_status VARCHAR,
  ADD COLUMN IF NOT EXISTS msc_commission_str VARCHAR,
  ADD COLUMN IF NOT EXISTS msc_paid_date DATE,
  ADD COLUMN IF NOT EXISTS msc_commission DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR,
  ADD COLUMN IF NOT EXISTS graph_size VARCHAR;

-- Add any missing columns to doctors table
ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS doctor_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ADD COLUMN IF NOT EXISTS doctor_name VARCHAR,
  ADD COLUMN IF NOT EXISTS business_name VARCHAR,
  ADD COLUMN IF NOT EXISTS address VARCHAR,
  ADD COLUMN IF NOT EXISTS phone VARCHAR,
  ADD COLUMN IF NOT EXISTS default_credit_terms VARCHAR;

-- Add any missing columns to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS "Product" VARCHAR PRIMARY KEY,
  ADD COLUMN IF NOT EXISTS "Q Code" VARCHAR,
  ADD COLUMN IF NOT EXISTS "National ASP" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "Your Price" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "MUE" INTEGER,
  ADD COLUMN IF NOT EXISTS "Manufacturer" VARCHAR;

-- Add any missing columns to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ADD COLUMN IF NOT EXISTS order_id UUID,
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_date DATE,
  ADD COLUMN IF NOT EXISTS remaining_balance DECIMAL(10,2);

-- Add any missing columns to representatives table
ALTER TABLE representatives
  ADD COLUMN IF NOT EXISTS rep_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ADD COLUMN IF NOT EXISTS rep_name VARCHAR,
  ADD COLUMN IF NOT EXISTS commission_formula VARCHAR,
  ADD COLUMN IF NOT EXISTS rep_type VARCHAR;

-- Add timestamps to all tables that don't have them
DO $$ 
BEGIN
  -- Add created_at and updated_at to orders if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'created_at') THEN
    ALTER TABLE orders ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
    ALTER TABLE orders ADD COLUMN updated_at TIMESTAMPTZ;
  END IF;

  -- Add timestamps to doctors
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'created_at') THEN
    ALTER TABLE doctors ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'updated_at') THEN
    ALTER TABLE doctors ADD COLUMN updated_at TIMESTAMPTZ;
  END IF;

  -- Add timestamps to products
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
    ALTER TABLE products ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
    ALTER TABLE products ADD COLUMN updated_at TIMESTAMPTZ;
  END IF;

  -- Add timestamps to payments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'created_at') THEN
    ALTER TABLE payments ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'updated_at') THEN
    ALTER TABLE payments ADD COLUMN updated_at TIMESTAMPTZ;
  END IF;

  -- Add timestamps to representatives
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'representatives' AND column_name = 'created_at') THEN
    ALTER TABLE representatives ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'representatives' AND column_name = 'updated_at') THEN
    ALTER TABLE representatives ADD COLUMN updated_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

  -- Representatives updated_at trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'representatives_updated_at_trigger') THEN
    CREATE TRIGGER representatives_updated_at_trigger
      BEFORE UPDATE ON representatives
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
