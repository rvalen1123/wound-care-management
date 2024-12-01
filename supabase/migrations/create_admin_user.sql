-- Insert directly into auth.users
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  'test@mscwoundcare.com',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  '{"role": "admin"}'
);

-- Create profile for the user
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
