-- First, drop existing constraints if they exist
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_doctor;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_product;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_order;

-- First, let's check for any invalid references that would violate the foreign keys
DO $$ 
BEGIN 
  -- Check orders.doctor_id references
  IF EXISTS (
    SELECT 1 FROM orders o
    LEFT JOIN doctors d ON o.doctor_id = d.doctor_id
    WHERE o.doctor_id IS NOT NULL AND d.doctor_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid doctor_id references found in orders table';
  END IF;

  -- Check orders.Q Code references
  IF EXISTS (
    SELECT 1 FROM orders o
    LEFT JOIN products p ON o."Q Code" = p."Product"
    WHERE o."Q Code" IS NOT NULL AND p."Product" IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid Q Code references found in orders table';
  END IF;

  -- Check payments.order_id references
  IF EXISTS (
    SELECT 1 FROM payments p
    LEFT JOIN orders o ON p.order_id = o.order_id
    WHERE p.order_id IS NOT NULL AND o.order_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid order_id references found in payments table';
  END IF;
END $$;

-- If we get here, it means all existing data is valid, so we can add the foreign keys
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_doctor 
  FOREIGN KEY (doctor_id) 
  REFERENCES doctors(doctor_id) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE;

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_product 
  FOREIGN KEY ("Q Code") 
  REFERENCES products("Product") 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE;

ALTER TABLE payments
  ADD CONSTRAINT fk_payments_order 
  FOREIGN KEY (order_id) 
  REFERENCES orders(order_id) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_orders_doctor_id;
DROP INDEX IF EXISTS idx_orders_q_code;
DROP INDEX IF EXISTS idx_payments_order_id;

-- Add indexes to improve join performance
CREATE INDEX IF NOT EXISTS idx_orders_doctor_id ON orders(doctor_id);
CREATE INDEX IF NOT EXISTS idx_orders_q_code ON orders("Q Code");
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Add a comment explaining the constraints
COMMENT ON CONSTRAINT fk_orders_doctor ON orders IS 'Ensures each order references a valid doctor';
COMMENT ON CONSTRAINT fk_orders_product ON orders IS 'Ensures each order references a valid product';
COMMENT ON CONSTRAINT fk_payments_order ON payments IS 'Ensures each payment references a valid order';
