-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create representatives table
CREATE TABLE IF NOT EXISTS representatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  doctor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  email VARCHAR,
  business_name VARCHAR,
  address VARCHAR,
  phone VARCHAR,
  default_credit_terms VARCHAR DEFAULT 'net 30',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  "Product" VARCHAR PRIMARY KEY,
  "Q Code" VARCHAR UNIQUE,
  "National ASP" DECIMAL(10,2),
  "Your Price" DECIMAL(10,2),
  "MUE" INTEGER,
  "Manufacturer" VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table with proper foreign keys
CREATE TABLE IF NOT EXISTS orders (
  order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(doctor_id),
  "Q Code" VARCHAR REFERENCES products("Q Code"),
  date_of_service DATE,
  credit_terms VARCHAR,
  graph_size VARCHAR,
  units INTEGER,
  invoice_amount_billed DECIMAL(10,2),
  invoice_to_doc DECIMAL(10,2),
  expected_collection_date DATE,
  manufacturer_paid_date DATE,
  amount_paid_to_manufacturer DECIMAL(10,2),
  running_balance_owed DECIMAL(10,2),
  manufacturer_payment_status VARCHAR,
  msc_commission_str VARCHAR,
  msc_paid_date DATE,
  msc_commission DECIMAL(10,2),
  payment_status VARCHAR,
  master_rep_id UUID REFERENCES representatives(id),
  sub_rep_id UUID REFERENCES representatives(id),
  sub_sub_rep_id UUID REFERENCES representatives(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_doctor_id ON orders(doctor_id);
CREATE INDEX IF NOT EXISTS idx_orders_q_code ON orders("Q Code");
CREATE INDEX IF NOT EXISTS idx_orders_master_rep_id ON orders(master_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_sub_rep_id ON orders(sub_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_sub_sub_rep_id ON orders(sub_sub_rep_id);

-- Create commission_structures table
CREATE TABLE IF NOT EXISTS commission_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(order_id),
  master_rep_id UUID REFERENCES representatives(id),
  sub_rep_id UUID REFERENCES representatives(id),
  sub_sub_rep_id UUID REFERENCES representatives(id),
  total_commission DECIMAL(10,2),
  master_rep_commission DECIMAL(10,2),
  sub_rep_commission DECIMAL(10,2),
  sub_sub_rep_commission DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(order_id),
  amount_paid DECIMAL(10,2),
  payment_date DATE,
  remaining_balance DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'user',
  name VARCHAR,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

CREATE OR REPLACE FUNCTION calculate_units_from_size(graph_size TEXT)
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

-- Trigger for auto-calculations on orders
CREATE OR REPLACE FUNCTION orders_auto_calculate()
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
      COALESCE(NEW.credit_terms, 
        (SELECT default_credit_terms FROM doctors WHERE doctor_id = NEW.doctor_id)
      )
    );
  END IF;

  -- Calculate invoice_to_doc if not manually set
  IF NEW.invoice_to_doc IS NULL AND NEW.units IS NOT NULL THEN
    NEW.invoice_to_doc := (
      SELECT ("National ASP" * NEW.units * 0.6)
      FROM products
      WHERE "Q Code" = NEW."Q Code"
    );
  END IF;

  -- Calculate MSC commission if not manually set
  IF NEW.msc_commission IS NULL AND NEW.invoice_to_doc IS NOT NULL THEN
    NEW.msc_commission := NEW.invoice_to_doc * 0.4; -- 40% commission rate
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-calculations
DROP TRIGGER IF EXISTS orders_auto_calculate_trigger ON orders;
CREATE TRIGGER orders_auto_calculate_trigger
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION orders_auto_calculate();

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can do everything" ON doctors FOR ALL TO authenticated USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "Admins can do everything" ON products FOR ALL TO authenticated USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "Admins can do everything" ON orders FOR ALL TO authenticated USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "Admins can do everything" ON payments FOR ALL TO authenticated USING (
  auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "Admins can do everything" ON commission_structures FOR ALL TO authenticated USING (
