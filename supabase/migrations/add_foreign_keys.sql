-- First, let's check for any invalid references that would violate the foreign keys
DO $$ 
BEGIN 
  -- Check orders.doctor_id references
  IF EXISTS (
    SELECT 1 FROM orders o
    LEFT JOIN doctors d ON o.doctor_id = d.id
    WHERE o.doctor_id IS NOT NULL AND d.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid doctor_id references found in orders table';
  END IF;

  -- Check orders.product_id references
  IF EXISTS (
    SELECT 1 FROM orders o
    LEFT JOIN products p ON o.product_id = p.id
    WHERE o.product_id IS NOT NULL AND p.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid product_id references found in orders table';
  END IF;

  -- Check payments.order_id references
  IF EXISTS (
    SELECT 1 FROM payments p
    LEFT JOIN orders o ON p.order_id = o.id
    WHERE p.order_id IS NOT NULL AND o.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid order_id references found in payments table';
  END IF;
END $$;

-- If we get here, it means all existing data is valid, so we can add the foreign keys
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_doctor
    FOREIGN KEY (doctor_id)
    REFERENCES doctors(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

ALTER TABLE payments
  ADD CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- Add indexes to improve join performance
CREATE INDEX IF NOT EXISTS idx_orders_doctor_id ON orders(doctor_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Add a comment explaining the constraints
COMMENT ON CONSTRAINT fk_orders_doctor ON orders IS 'Ensures each order references a valid doctor';
COMMENT ON CONSTRAINT fk_orders_product ON orders IS 'Ensures each order references a valid product';
COMMENT ON CONSTRAINT fk_payments_order ON payments IS 'Ensures each payment references a valid order';
