-- Migration: Refactor crediarios table to introduce master table crediarios_clientes
-- Date: 2026-07-07

-- 1. Create public.crediarios_clientes table
CREATE TABLE IF NOT EXISTS public.crediarios_clientes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    cliente_id uuid NOT NULL UNIQUE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT crediarios_clientes_pkey PRIMARY KEY (id),
    CONSTRAINT crediarios_clientes_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE
);

-- Enable RLS for crediarios_clientes
ALTER TABLE public.crediarios_clientes ENABLE ROW LEVEL SECURITY;

-- Create policy for public general access on crediarios_clientes
DROP POLICY IF EXISTS "Permitir acesso público geral para crediarios_clientes" ON public.crediarios_clientes;
CREATE POLICY "Permitir acesso público geral para crediarios_clientes" ON public.crediarios_clientes
    AS PERMISSIVE FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- Grant API access to default Supabase roles for crediarios_clientes
GRANT ALL ON TABLE public.crediarios_clientes TO anon, authenticated, service_role;

-- 2. Populate crediarios_clientes with existing client IDs from crediarios
INSERT INTO public.crediarios_clientes (cliente_id)
SELECT DISTINCT cliente_id
FROM public.crediarios
WHERE cliente_id IS NOT NULL
ON CONFLICT (cliente_id) DO NOTHING;

-- 3. Add crediario_cliente_id column to crediarios
ALTER TABLE public.crediarios ADD COLUMN IF NOT EXISTS crediario_cliente_id uuid NULL;
ALTER TABLE public.crediarios DROP CONSTRAINT IF EXISTS crediarios_crediario_cliente_id_fkey;
ALTER TABLE public.crediarios ADD CONSTRAINT crediarios_crediario_cliente_id_fkey FOREIGN KEY (crediario_cliente_id) REFERENCES public.crediarios_clientes(id) ON DELETE CASCADE;

-- 4. Update crediario_cliente_id based on existing cliente_id
UPDATE public.crediarios c
SET crediario_cliente_id = cc.id
FROM public.crediarios_clientes cc
WHERE c.cliente_id = cc.cliente_id;

-- 5. Drop client_id column from crediarios
ALTER TABLE public.crediarios DROP COLUMN IF EXISTS cliente_id;
