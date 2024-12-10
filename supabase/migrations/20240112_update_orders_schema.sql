-- Drop old columns
ALTER TABLE orders
DROP COLUMN IF EXISTS id,
DROP COLUMN IF EXISTS product_id,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS master_rep_id,
DROP COLUMN IF EXISTS sub_rep_id,
DROP COLUMN IF EXISTS sub_sub_rep_id,
DROP COLUMN IF EXISTS commission_structure,
DROP COLUMN IF EXISTS approved_by,
DROP COLUMN IF EXISTS approved_at,
DROP COLUMN IF EXISTS created_by,
DROP COLUMN IF EXISTS updated_by;

-- Add new columns
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_id varchar PRIMARY KEY,
ADD COLUMN IF NOT EXISTS q_code varchar,
ADD COLUMN IF NOT EXISTS credit_terms varchar,
ADD COLUMN IF NOT EXISTS invoice_amount_billed numeric,
ADD COLUMN IF NOT EXISTS manufacturer_paid_date date,
ADD COLUMN IF NOT EXISTS amount_paid_to_manufacturer numeric,
ADD COLUMN IF NOT EXISTS running_balance_owed numeric,
ADD COLUMN IF NOT EXISTS manufacturer_payment_status varchar,
ADD COLUMN IF NOT EXISTS msc_commission_str varchar,
ADD COLUMN IF NOT EXISTS msc_paid_date date,
ADD COLUMN IF NOT EXISTS payment_status varchar,
ADD COLUMN IF NOT EXISTS rep_id uuid;
