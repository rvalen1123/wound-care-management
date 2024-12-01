-- Update the existing user's password
UPDATE auth.users
SET 
  encrypted_password = crypt('testpassword123', gen_salt('bf')),
  updated_at = NOW(),
  last_sign_in_at = NULL,
  raw_user_meta_data = jsonb_build_object('role', 'admin'),
  raw_app_meta_data = jsonb_build_object(
    'provider', 'email',
    'providers', ARRAY['email']
  ),
  email_confirmed_at = NOW()
WHERE email = 'test@mscwoundcare.com';

-- Update the profile if needed
UPDATE public.profiles
SET 
  role = 'admin',
  status = 'active',
  updated_at = NOW()
WHERE email = 'test@mscwoundcare.com';
