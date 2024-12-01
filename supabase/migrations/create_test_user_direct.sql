-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a test user with admin role
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_sent_at,
  email_confirmed_at,
  is_super_admin,
  encrypted_password
) VALUES (
  uuid_generate_v4(),
  'test@mscwoundcare.com',
  jsonb_build_object('role', 'admin'),
  now(),
  now(),
  now(),
  now(),
  false,
  crypt('testpassword123', gen_salt('bf'))
);

-- Create a profile for the user
INSERT INTO public.profiles (
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
WHERE email = 'test@mscwoundcare.com';

-- Grant necessary permissions
DO $$
BEGIN
  -- Get the user's ID
  DECLARE user_id uuid;
  SELECT id INTO user_id FROM auth.users WHERE email = 'test@mscwoundcare.com';

  -- Update user's metadata to include admin role
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object('role', 'admin')
  WHERE id = user_id;
END $$;
