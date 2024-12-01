-- Insert test representatives
INSERT INTO public.representatives (
    id,
    name,
    email,
    role,
    parent_id,
    default_commission_rate,
    created_at
) VALUES
    -- Master Rep
    ('11111111-1111-1111-1111-111111111111', 
     'John Master', 
     'john.master@mscwoundcare.com',
     'master',
     NULL,
     40.00,
     NOW()),
    
    -- Sub Rep (reports to John)
    ('22222222-2222-2222-2222-222222222222',
     'Sarah Sub',
     'sarah.sub@mscwoundcare.com',
     'sub',
     '11111111-1111-1111-1111-111111111111',
     35.00,
     NOW()),
    
    -- Sub-Sub Rep (reports to Sarah)
    ('33333333-3333-3333-3333-333333333333',
     'Tom SubSub',
     'tom.subsub@mscwoundcare.com',
     'sub-sub',
     '22222222-2222-2222-2222-222222222222',
     30.00,
     NOW());

-- Create test doctors
INSERT INTO public.doctors (
    id,
    name,
    business_name,
    email,
    phone,
    address,
    default_credit_terms,
    created_at
) VALUES
    ('44444444-4444-4444-4444-444444444444',
     'Dr. Jane Smith',
     'Smith Wound Care Clinic',
     'dr.smith@example.com',
     '555-0123',
     '123 Medical Center Dr, Suite 100',
     'net 30',
     NOW()),
    
    ('55555555-5555-5555-5555-555555555555',
     'Dr. Robert Johnson',
     'Johnson Medical Group',
     'dr.johnson@example.com',
     '555-0124',
     '456 Hospital Way',
     'net 60',
     NOW());

-- Create test products
INSERT INTO public.products (
    id,
    name,
    manufacturer,
    national_asp,
    size,
    default_commission_rate,
    created_at
) VALUES
    ('66666666-6666-6666-6666-666666666666',
     'WoundHeal Pro',
     'MSC Medical',
     299.99,
     '4x4',
     40.00,
     NOW()),
    
    ('77777777-7777-7777-7777-777777777777',
     'BioRepair Matrix',
     'MSC Medical',
     499.99,
     '6x6',
     35.00,
     NOW());

-- Create test orders
INSERT INTO public.orders (
    id,
    doctor_id,
    date_of_service,
    product_id,
    size,
    units,
    invoice_to_doc,
    status,
    master_rep_id,
    sub_rep_id,
    sub_sub_rep_id,
    commission_structure,
    msc_commission,
    created_at
) VALUES
    ('88888888-8888-8888-8888-888888888888',
     '44444444-4444-4444-4444-444444444444',
     CURRENT_DATE - INTERVAL '7 days',
     '66666666-6666-6666-6666-666666666666',
     '4x4',
     2,
     599.98,
     'pending',
     '11111111-1111-1111-1111-111111111111',
     '22222222-2222-2222-2222-222222222222',
     '33333333-3333-3333-3333-333333333333',
     '{"master": 20, "sub": 10, "sub_sub": 5}'::jsonb,
     239.99,
     NOW()),
    
    ('99999999-9999-9999-9999-999999999999',
     '55555555-5555-5555-5555-555555555555',
     CURRENT_DATE - INTERVAL '3 days',
     '77777777-7777-7777-7777-777777777777',
     '6x6',
     1,
     499.99,
     'approved',
     '11111111-1111-1111-1111-111111111111',
     '22222222-2222-2222-2222-222222222222',
     NULL,
     '{"master": 25, "sub": 15}'::jsonb,
     175.00,
     NOW());

-- Create test commission payments
INSERT INTO public.commission_payments (
    id,
    order_id,
    rep_id,
    amount,
    payment_date,
    created_at
) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     '99999999-9999-9999-9999-999999999999',
     '11111111-1111-1111-1111-111111111111',
     125.00,
     CURRENT_DATE - INTERVAL '1 day',
     NOW()),
    
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     '99999999-9999-9999-9999-999999999999',
     '22222222-2222-2222-2222-222222222222',
     75.00,
     CURRENT_DATE - INTERVAL '1 day',
     NOW());

-- Update or insert test users in auth.users with appropriate roles
INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    created_at
) VALUES
    -- Admin user
    ('00000000-0000-0000-0000-000000000000',
     'admin@mscwoundcare.com',
     jsonb_build_object(
         'role', 'admin',
         'name', 'System Admin'
     ),
     NOW()),
    
    -- Master rep user
    ('11111111-1111-1111-1111-111111111111',
     'john.master@mscwoundcare.com',
     jsonb_build_object(
         'role', 'rep',
         'rep_type', 'master',
         'name', 'John Master'
     ),
     NOW()),
    
    -- Doctor user
    ('44444444-4444-4444-4444-444444444444',
     'dr.smith@example.com',
     jsonb_build_object(
         'role', 'doctor',
         'doctor_id', '44444444-4444-4444-4444-444444444444',
         'name', 'Dr. Jane Smith'
     ),
     NOW())
ON CONFLICT (id) DO UPDATE 
SET 
    email = EXCLUDED.email,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = NOW();
