-- First, create the user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'test@mscwoundcare.com',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Then create a profile for the user
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
  email,
  'admin',
  'Test Admin',
  now(),
  now(),
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
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
  WHERE id = user_id;
END $$;
