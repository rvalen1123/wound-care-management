-- Add foreign key relationships for representatives in orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS master_rep_id UUID REFERENCES representatives(id),
  ADD COLUMN IF NOT EXISTS sub_rep_id UUID REFERENCES representatives(id),
  ADD COLUMN IF NOT EXISTS sub_sub_rep_id UUID REFERENCES representatives(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_master_rep_id ON orders(master_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_sub_rep_id ON orders(sub_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_sub_sub_rep_id ON orders(sub_sub_rep_id);

-- Update the data service query to use the correct foreign key names
COMMENT ON COLUMN orders.master_rep_id IS 'Primary sales representative for the order';
COMMENT ON COLUMN orders.sub_rep_id IS 'Secondary sales representative for the order';
COMMENT ON COLUMN orders.sub_sub_rep_id IS 'Tertiary sales representative for the order';
