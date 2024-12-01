-- Enable RLS on all tables
ALTER TABLE public.representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Admin Policies (Full Access)
CREATE POLICY "Admins have full access to representatives"
    ON public.representatives
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to doctors"
    ON public.doctors
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to products"
    ON public.products
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to orders"
    ON public.orders
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to commission_payments"
    ON public.commission_payments
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to audit_log"
    ON public.audit_log
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Representative Policies
CREATE POLICY "Reps can view their own profile"
    ON public.representatives
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (
        id::text = auth.uid()::text
        OR parent_id::text = auth.uid()::text  -- Allow viewing sub-reps
    );

CREATE POLICY "Reps can view all doctors"
    ON public.doctors
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'rep');

CREATE POLICY "Reps can view all products"
    ON public.products
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'rep');

CREATE POLICY "Reps can view their related orders"
    ON public.orders
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (
        auth.uid()::text IN (
            master_rep_id::text,
            sub_rep_id::text,
            sub_sub_rep_id::text
        )
    );

CREATE POLICY "Reps can create orders"
    ON public.orders
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'role' = 'rep'
        AND (
            auth.uid()::text = master_rep_id::text
            OR auth.uid()::text = sub_rep_id::text
            OR auth.uid()::text = sub_sub_rep_id::text
        )
    );

CREATE POLICY "Reps can view their commission payments"
    ON public.commission_payments
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (
        rep_id::text = auth.uid()::text
    );

-- Doctor Policies
CREATE POLICY "Doctors can view their own profile"
    ON public.doctors
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'doctor'
        AND id::text = (auth.jwt() ->> 'doctor_id')
    );

CREATE POLICY "Doctors can view their own orders"
    ON public.orders
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'doctor'
        AND doctor_id::text = (auth.jwt() ->> 'doctor_id')
    );

-- Audit Log Policies
CREATE POLICY "Users can view audit logs for their own records"
    ON public.audit_log
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (
        CASE
            WHEN auth.jwt() ->> 'role' = 'rep' THEN
                record_id::text = auth.uid()::text
            WHEN auth.jwt() ->> 'role' = 'doctor' THEN
                record_id::text = (auth.jwt() ->> 'doctor_id')
            ELSE false
        END
    );

-- Function to automatically set created_by and updated_by
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.created_by = auth.uid();
    END IF;
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers to set user IDs
CREATE TRIGGER set_representatives_user_id
    BEFORE INSERT OR UPDATE ON public.representatives
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_doctors_user_id
    BEFORE INSERT OR UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_products_user_id
    BEFORE INSERT OR UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_orders_user_id
    BEFORE INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER set_commission_payments_user_id
    BEFORE INSERT OR UPDATE ON public.commission_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_id();
