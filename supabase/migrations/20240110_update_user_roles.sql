-- Update admin user role
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
    'role', 'admin',
    'name', 'System Admin'
),
raw_app_meta_data = jsonb_build_object(
    'role', 'admin',
    'provider', 'email'
)
WHERE email = 'admin@mscwoundcare.com';

-- Update master rep user role
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
    'role', 'rep',
    'rep_type', 'master',
    'name', 'John Master'
),
raw_app_meta_data = jsonb_build_object(
    'role', 'rep',
    'provider', 'email'
)
WHERE email = 'john.master@mscwoundcare.com';

-- Update doctor user role
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
    'role', 'doctor',
    'doctor_id', '44444444-4444-4444-4444-444444444444',
    'name', 'Dr. Jane Smith'
),
raw_app_meta_data = jsonb_build_object(
    'role', 'doctor',
    'provider', 'email'
)
WHERE email = 'dr.smith@example.com';

-- Verify the updates
SELECT 
    email,
    raw_user_meta_data->>'role' as user_role,
    raw_app_meta_data->>'role' as app_role
FROM auth.users
WHERE email IN (
    'admin@mscwoundcare.com',
    'john.master@mscwoundcare.com',
    'dr.smith@example.com'
);
