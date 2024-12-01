-- Set passwords for test users
UPDATE auth.users
SET encrypted_password = crypt('Admin123!', gen_salt('bf')),
    email_confirmed_at = NOW(),
    is_sso_user = FALSE,
    raw_app_meta_data = raw_app_meta_data || jsonb_build_object('provider', 'email'),
    raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
        'provider', 'email',
        'email_verified', true
    )
WHERE email = 'admin@mscwoundcare.com';

UPDATE auth.users
SET encrypted_password = crypt('Master123!', gen_salt('bf')),
    email_confirmed_at = NOW(),
    is_sso_user = FALSE,
    raw_app_meta_data = raw_app_meta_data || jsonb_build_object('provider', 'email'),
    raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
        'provider', 'email',
        'email_verified', true
    )
WHERE email = 'john.master@mscwoundcare.com';

UPDATE auth.users
SET encrypted_password = crypt('Doctor123!', gen_salt('bf')),
    email_confirmed_at = NOW(),
    is_sso_user = FALSE,
    raw_app_meta_data = raw_app_meta_data || jsonb_build_object('provider', 'email'),
    raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
        'provider', 'email',
        'email_verified', true
    )
WHERE email = 'dr.smith@example.com';

-- Delete existing identities for these users if they exist
DELETE FROM auth.identities
WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email IN (
        'admin@mscwoundcare.com',
        'john.master@mscwoundcare.com',
        'dr.smith@example.com'
    )
);

-- Create identities for users (required for email auth)
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(), -- Generate new UUID for identity
    id,
    email, -- Use email as provider_id for email provider
    jsonb_build_object(
        'sub', id::text,
        'email', email,
        'email_verified', true
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
FROM auth.users
WHERE email IN (
    'admin@mscwoundcare.com',
    'john.master@mscwoundcare.com',
    'dr.smith@example.com'
);

-- Store test credentials in a comment for reference
COMMENT ON TABLE auth.users IS $$
Test credentials:
- Admin: admin@mscwoundcare.com / Admin123!
- Master Rep: john.master@mscwoundcare.com / Master123!
- Doctor: dr.smith@example.com / Doctor123!
$$;
