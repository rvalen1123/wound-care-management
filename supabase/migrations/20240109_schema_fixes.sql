-- Fix representatives table
CREATE TABLE IF NOT EXISTS representatives (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('master', 'sub', 'sub-sub')),
  parent_rep_id UUID REFERENCES representatives(id),
  default_commission_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Fix orders table references
ALTER TABLE orders 
  DROP COLUMN IF EXISTS master_rep_id,
  DROP COLUMN IF EXISTS sub_rep_id,
  DROP COLUMN IF EXISTS sub_sub_rep_id;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS master_rep_id UUID REFERENCES representatives(id),
  ADD COLUMN IF NOT EXISTS sub_rep_id UUID REFERENCES representatives(id),
  ADD COLUMN IF NOT EXISTS sub_sub_rep_id UUID REFERENCES representatives(id);

-- Create proper payment batches table
CREATE TABLE IF NOT EXISTS payment_batches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processed', 'failed')),
  type TEXT CHECK (type IN ('manufacturer', 'commission')),
  recipient_type TEXT CHECK (recipient_type IN ('manufacturer', 'master_rep', 'sub_rep', 'sub_sub_rep')),
  recipient_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);

-- Fix commission structures table references
DROP TABLE IF EXISTS commission_structures;
CREATE TABLE commission_structures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  master_rep_id UUID REFERENCES representatives(id),
  sub_rep_id UUID REFERENCES representatives(id),
  sub_sub_rep_id UUID REFERENCES representatives(id),
  master_rep_rate DECIMAL(5,2),
  sub_rep_rate DECIMAL(5,2),
  sub_sub_rep_rate DECIMAL(5,2),
  master_rep_amount DECIMAL(10,2),
  sub_rep_amount DECIMAL(10,2),
  sub_sub_rep_amount DECIMAL(10,2),
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

-- Fix duplicate policies by dropping and recreating with unique names
DROP POLICY IF EXISTS "Admins can do everything" ON representatives;
DROP POLICY IF EXISTS "Admins can do everything" ON products;
DROP POLICY IF EXISTS "Admins can do everything" ON pricing_history;
DROP POLICY IF EXISTS "Admins can do everything" ON commission_structures;

CREATE POLICY "Admins can manage representatives"
  ON representatives FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admins can manage pricing_history"
  ON pricing_history FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "Admins can manage commission_structures"
  ON commission_structures FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_representatives_parent_rep_id ON representatives(parent_rep_id);
CREATE INDEX IF NOT EXISTS idx_payment_batches_order_id ON payment_batches(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_batches_recipient_id ON payment_batches(recipient_id);

-- Update commission calculation trigger
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

-- Ensure trigger is properly attached
DROP TRIGGER IF EXISTS commission_amounts_trigger ON commission_structures;
CREATE TRIGGER commission_amounts_trigger
  BEFORE INSERT OR UPDATE ON commission_structures
  FOR EACH ROW EXECUTE FUNCTION calculate_commission_amounts();
