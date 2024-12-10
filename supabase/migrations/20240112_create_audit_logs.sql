-- Create commission audit logs table
CREATE TABLE IF NOT EXISTS public.commission_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    structure_id UUID,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    previous_master_rate DECIMAL(5,2),
    previous_sub_rate DECIMAL(5,2),
    previous_sub_sub_rate DECIMAL(5,2),
    new_master_rate DECIMAL(5,2),
    new_sub_rate DECIMAL(5,2),
    new_sub_sub_rate DECIMAL(5,2),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_commission_audit_logs_structure_id ON public.commission_audit_logs(structure_id);
CREATE INDEX idx_commission_audit_logs_changed_by ON public.commission_audit_logs(changed_by);
CREATE INDEX idx_commission_audit_logs_changed_at ON public.commission_audit_logs(changed_at);

-- Enable RLS
ALTER TABLE public.commission_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users"
ON public.commission_audit_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.commission_audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON public.commission_audit_logs TO authenticated;

-- Create trigger function to automatically update commission audit logs
CREATE OR REPLACE FUNCTION public.commission_audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND (
        OLD.master_rep_id IS DISTINCT FROM NEW.master_rep_id OR
        OLD.sub_rep_id IS DISTINCT FROM NEW.sub_rep_id OR
        OLD.sub_sub_rep_id IS DISTINCT FROM NEW.sub_sub_rep_id OR
        OLD.commission_structure IS DISTINCT FROM NEW.commission_structure
    ) THEN
        INSERT INTO public.commission_audit_logs (
            structure_id,
            changed_by,
            previous_master_rate,
            previous_sub_rate,
            previous_sub_sub_rate,
            new_master_rate,
            new_sub_rate,
            new_sub_sub_rate,
            reason
        ) VALUES (
            NEW.id,
            auth.uid(),
            (OLD.commission_structure->>'master_rate')::DECIMAL,
            (OLD.commission_structure->>'sub_rate')::DECIMAL,
            (OLD.commission_structure->>'sub_sub_rate')::DECIMAL,
            (NEW.commission_structure->>'master_rate')::DECIMAL,
            (NEW.commission_structure->>'sub_rate')::DECIMAL,
            (NEW.commission_structure->>'sub_sub_rate')::DECIMAL,
            NEW.commission_structure->>'notes'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS commission_audit_trigger ON public.orders;
CREATE TRIGGER commission_audit_trigger
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.commission_audit_trigger_function();
