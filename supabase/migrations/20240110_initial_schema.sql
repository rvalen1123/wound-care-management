-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'rep', 'doctor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rep_type AS ENUM ('master', 'sub', 'sub-sub');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'approved', 'paid', 'partial', 'outstanding');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.commission_payments CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.representatives CASCADE;

-- Create representatives table
CREATE TABLE public.representatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role rep_type NOT NULL,
    parent_id UUID REFERENCES public.representatives(id),
    default_commission_rate DECIMAL(5,2) DEFAULT 40.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create doctors table
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    business_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    default_credit_terms TEXT DEFAULT 'net 60',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    national_asp DECIMAL(10,2) NOT NULL,
    size TEXT NOT NULL,
    default_commission_rate DECIMAL(5,2) DEFAULT 40.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id),
    date_of_service DATE NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id),
    size TEXT NOT NULL,
    units INTEGER NOT NULL,
    invoice_to_doc DECIMAL(10,2) NOT NULL,
    expected_collection_date DATE,
    status order_status DEFAULT 'pending',
    master_rep_id UUID REFERENCES public.representatives(id),
    sub_rep_id UUID REFERENCES public.representatives(id),
    sub_sub_rep_id UUID REFERENCES public.representatives(id),
    commission_structure JSONB,
    msc_commission DECIMAL(10,2),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create commission_payments table
CREATE TABLE public.commission_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    rep_id UUID NOT NULL REFERENCES public.representatives(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create audit_log table
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS representatives_audit_trigger ON public.representatives;
DROP TRIGGER IF EXISTS doctors_audit_trigger ON public.doctors;
DROP TRIGGER IF EXISTS products_audit_trigger ON public.products;
DROP TRIGGER IF EXISTS orders_audit_trigger ON public.orders;
DROP TRIGGER IF EXISTS commission_payments_audit_trigger ON public.commission_payments;
DROP FUNCTION IF EXISTS public.audit_trigger_function();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            changed_by
        ) VALUES (
            TG_TABLE_NAME::TEXT,
            NEW.id,
            TG_OP,
            row_to_json(OLD),
            row_to_json(NEW),
            NEW.updated_by
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (
            table_name,
            record_id,
            action,
            new_values,
            changed_by
        ) VALUES (
            TG_TABLE_NAME::TEXT,
            NEW.id,
            TG_OP,
            row_to_json(NEW),
            NEW.created_by
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auditing
CREATE TRIGGER representatives_audit_trigger
    AFTER INSERT OR UPDATE ON public.representatives
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER doctors_audit_trigger
    AFTER INSERT OR UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER products_audit_trigger
    AFTER INSERT OR UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER orders_audit_trigger
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER commission_payments_audit_trigger
    AFTER INSERT OR UPDATE ON public.commission_payments
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Create indexes
CREATE INDEX idx_orders_doctor_id ON public.orders(doctor_id);
CREATE INDEX idx_orders_product_id ON public.orders(product_id);
CREATE INDEX idx_orders_master_rep_id ON public.orders(master_rep_id);
CREATE INDEX idx_orders_sub_rep_id ON public.orders(sub_rep_id);
CREATE INDEX idx_orders_sub_sub_rep_id ON public.orders(sub_sub_rep_id);
CREATE INDEX idx_commission_payments_order_id ON public.commission_payments(order_id);
CREATE INDEX idx_commission_payments_rep_id ON public.commission_payments(rep_id);
CREATE INDEX idx_representatives_parent_id ON public.representatives(parent_id);

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
