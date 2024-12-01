-- Create test user with admin role
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',  -- default instance_id
  gen_random_uuid(),                        -- random uuid for id
  'authenticated',                          -- default aud
  'authenticated',                          -- default role
  'test@mscwoundcare.com',                 -- email
  crypt('testpassword123', gen_salt('bf')), -- encrypted password
  now(),                                    -- email confirmed
  '{"provider": "email"}'::jsonb,           -- app metadata
  '{"role": "admin"}'::jsonb,               -- user metadata
  now(),                                    -- created_at
  now()                                     -- updated_at
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
