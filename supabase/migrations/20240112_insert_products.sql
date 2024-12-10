-- Insert products with cleaned up price values
INSERT INTO public.products (
    name,
    q_code,
    national_asp,
    your_price,
    mue,
    manufacturer,
    default_commission_rate,
    created_at
) VALUES
    ('Dermacyte', 'Q4248', 1107.70, 664.62, 32, 'Products4Doctors', 40.00, NOW()),
    ('Biovance', 'Q4154', 151.13, 90.68, 36, 'Alliqua', 40.00, NOW()),
    ('Helicoll', 'Q4164', 1635.07, 932.00, 200, 'Helicoll', 40.00, NOW()),
    ('IMPAX', 'Q4262', 314.04, 188.42, 300, 'ProCure Health', 40.00, NOW()),
    ('SURGraft FT', 'Q4263', 531.78, 319.07, 240, 'Surgenex', 40.00, NOW()),
    ('Amnio Tri-Core', 'Q4295', 2279.00, 1367.40, 180, 'Stability Biologics', 40.00, NOW()),
    ('Amnio Quad-Core', 'Q4294', 2120.00, 1272.00, 180, 'Stability Biologics', 40.00, NOW()),
    ('Amnio Core Pro', 'Q4298', 2173.00, 1303.80, 180, 'Stability Biologics', 40.00, NOW()),
    ('Amnio Core Pro Plus', 'Q4299', 2491.00, 1494.60, 180, 'Stability Biologics', 40.00, NOW()),
    ('Zenith', 'Q4253', 144.96, 86.98, 300, 'ProCure Health', 40.00, NOW()),
    ('Orion', 'Q4276', 884.67, 530.80, 300, 'Products4Doctors', 40.00, NOW()),
    ('Xcellerate', 'Q4234', 546.82, 328.09, 120, NULL, 40.00, NOW()),
    ('Complete FT', 'Q4271', 1591.40, 954.84, 300, 'Samaritan Biologics', 40.00, NOW()),
    ('Barrera', 'Q4281', 829.65, 497.79, 200, 'Products4Doctors', 40.00, NOW()),
    ('CarePatch', 'Q4236', 484.40, 290.64, 200, NULL, 40.00, NOW()),
    ('Amnio Maxx', 'Q4239', 2464.67, 1478.80, 32, NULL, 40.00, NOW()),
    ('Membrane Wrap Hydro', 'Q4290', 1961.00, 1176.60, 480, NULL, 40.00, NOW()),
    ('Neostim TL', 'Q4265', 2114.70, 1268.82, 180, NULL, 40.00, NOW()),
    ('Neostim SL', 'Q4266', 1542.65, 925.59, 180, NULL, 40.00, NOW()),
    ('Celera Dual Membrane', 'Q4259', 1290.10, 774.06, 49, NULL, 40.00, NOW()),
    ('Complete AA', 'Q4303', 3460.89, 2076.53, 300, 'Samaritan Biologics', 40.00, NOW()),
    ('Collederm', 'Q4193', 2067.00, 1240.20, 180, NULL, 40.00, NOW()),
    ('CorePlex', 'Q4232', 380.00, 285.00, 30, NULL, 40.00, NOW()),
    ('XWrap', 'Q4204', 2989.20, 1793.52, 512, NULL, 40.00, NOW())
ON CONFLICT (q_code) DO UPDATE 
SET 
    name = EXCLUDED.name,
    national_asp = EXCLUDED.national_asp,
    your_price = EXCLUDED.your_price,
    mue = EXCLUDED.mue,
    manufacturer = EXCLUDED.manufacturer,
    updated_at = NOW();
