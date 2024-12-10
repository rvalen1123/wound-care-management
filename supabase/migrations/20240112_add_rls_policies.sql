-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Enable read access for authenticated users"
ON orders FOR SELECT
TO authenticated
USING (true);

-- Create policies for doctors
CREATE POLICY "Enable read access for authenticated users"
ON doctors FOR SELECT
TO authenticated
USING (true);

-- Create policies for reps
CREATE POLICY "Enable read access for authenticated users"
ON reps FOR SELECT
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON doctors TO authenticated;
GRANT SELECT ON reps TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
