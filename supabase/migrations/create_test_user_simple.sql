-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the user with admin role
SELECT supabase_auth.create_user(
  uuid_generate_v4(),
  'test@mscwoundcare.com',
  crypt('testpassword123', gen_salt('bf')),
  '{"role": "admin"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  now(),
  now(),
  now(),
  now(),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create profile for the user
INSERT INTO public.profiles (
  user_id,
  email,
  role,
  name,
  created_at,
  updated_at,
  status
)
SELECT 
  id,
  'test@mscwoundcare.com',
  'admin',
  'Test Admin',
  now(),
  now(),
  'active'
FROM auth.users
WHERE email = 'test@mscwoundcare.com';
