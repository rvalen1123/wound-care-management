-- Add any missing columns to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS doctor_id UUID,
  ADD COLUMN IF NOT EXISTS patient_id UUID,
  ADD COLUMN IF NOT EXISTS date_of_service DATE,
  ADD COLUMN IF NOT EXISTS credit_terms VARCHAR,
  ADD COLUMN IF NOT EXISTS type_of_graph VARCHAR,
  ADD COLUMN IF NOT EXISTS units INTEGER,
  ADD COLUMN IF NOT EXISTS q_code VARCHAR,
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
  ADD COLUMN IF NOT EXISTS doctor_name VARCHAR,
  ADD COLUMN IF NOT EXISTS business_name VARCHAR,
  ADD COLUMN IF NOT EXISTS address VARCHAR,
  ADD COLUMN IF NOT EXISTS phone VARCHAR,
  ADD COLUMN IF NOT EXISTS default_credit_terms VARCHAR;

-- Add any missing columns to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS "Q Code" VARCHAR,
  ADD COLUMN IF NOT EXISTS "National ASP" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "Your Price" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "MUE" INTEGER,
  ADD COLUMN IF NOT EXISTS "Manufacturer" VARCHAR;

-- Add any missing columns to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_id UUID,
  ADD COLUMN IF NOT EXISTS order_id UUID,
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_date DATE,
  ADD COLUMN IF NOT EXISTS remaining_balance DECIMAL(10,2);

-- Add any missing columns to representatives table
ALTER TABLE representatives
  ADD COLUMN IF NOT EXISTS rep_id UUID,
  ADD COLUMN IF NOT EXISTS rep_name VARCHAR,
  ADD COLUMN IF NOT EXISTS commission_formula VARCHAR,
  ADD COLUMN IF NOT EXISTS rep_type VARCHAR;
