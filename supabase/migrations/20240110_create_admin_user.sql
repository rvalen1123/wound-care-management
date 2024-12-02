-- Create test admin user
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  aud,
  role
) VALUES (
  'test@mscwound.com',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  jsonb_build_object('role', 'admin'),
  jsonb_build_object('provider', 'email'),
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('testpassword123', gen_salt('bf')),
  raw_user_meta_data = jsonb_build_object('role', 'admin'),
  updated_at = NOW();

-- Create profile for admin user
INSERT INTO profiles (
  user_id,
  email,
  role,
  name,
  status
)
SELECT 
  id,
  email,
  'admin',
  'Test Admin',
  'active'
FROM auth.users
WHERE email = 'test@mscwound.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  name = 'Test Admin',
  status = 'active',
  updated_at = NOW();

-- Insert some test data
INSERT INTO representatives (name, email) VALUES
