-- Migration: Create consorcios_pagamentos table
-- Description: Creates the table for consortium payments, configures foreign keys, sets up RLS policies and grants API access.

CREATE TABLE IF NOT EXISTS public.consorcios_pagamentos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    bubble_id text NULL,
    consorcio_id uuid NULL,
    grupo_id uuid NULL,
    datapagamento_date timestamp with time zone NULL,
    mesano_text text NULL,
    valorpago_number numeric NULL,
    grupo_text text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT consorcios_pagamentos_pkey PRIMARY KEY (id),
    CONSTRAINT consorcios_pagamentos_bubble_id_key UNIQUE (bubble_id),
    CONSTRAINT consorcios_pagamentos_consorcio_id_fkey FOREIGN KEY (consorcio_id) REFERENCES public.consorcios(id) ON DELETE CASCADE,
    CONSTRAINT consorcios_pagamentos_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.consorcios_pagamentos ENABLE ROW LEVEL SECURITY;

-- Create policy for public general access
CREATE POLICY "Permitir acesso público geral" ON public.consorcios_pagamentos
    AS PERMISSIVE FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- Grant API access to default Supabase roles
GRANT ALL ON TABLE public.consorcios_pagamentos TO anon, authenticated, service_role;
