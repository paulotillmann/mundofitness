-- Migration: Create historico and crediarios tables
-- Description: Creates the tables for history and installments (crediarios), sets up foreign keys, unique constraints, RLS policies, and API grants.

-- 1. Create public.historico table
CREATE TABLE IF NOT EXISTS public.historico (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    bubble_id text NULL,
    descricao text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT historico_pkey PRIMARY KEY (id),
    CONSTRAINT historico_descricao_key UNIQUE (descricao),
    CONSTRAINT historico_bubble_id_key UNIQUE (bubble_id)
);

-- Enable RLS for historico
ALTER TABLE public.historico ENABLE ROW LEVEL SECURITY;

-- Create policy for public general access on historico
CREATE POLICY "Permitir acesso público geral para historico" ON public.historico
    AS PERMISSIVE FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- Grant API access to default Supabase roles for historico
GRANT ALL ON TABLE public.historico TO anon, authenticated, service_role;

-- 2. Create public.crediarios table
CREATE TABLE IF NOT EXISTS public.crediarios (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    bubble_id text NULL,
    cliente_id uuid NULL,
    data_pagamento timestamp with time zone NULL,
    data_vencimento timestamp with time zone NULL,
    forma_pagamento text NULL, -- dinheiro, PIX, cartão, cartão BB, cartão Santander, Cartão Nubank, Cartão Sicoob
    historico_id uuid NULL,
    parcelas text NULL,
    tipo_pagamento text NULL, -- A vista, Crediário
    valor_pagar numeric NULL,
    valor_pago numeric NULL,
    valor_taxa_cartao numeric NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT crediarios_pkey PRIMARY KEY (id),
    CONSTRAINT crediarios_bubble_id_key UNIQUE (bubble_id),
    CONSTRAINT crediarios_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE,
    CONSTRAINT crediarios_historico_id_fkey FOREIGN KEY (historico_id) REFERENCES public.historico(id) ON DELETE SET NULL,
    CONSTRAINT crediarios_forma_pagamento_check CHECK (forma_pagamento IN ('dinheiro', 'PIX', 'cartão', 'cartão BB', 'cartão Santander', 'Cartão Nubank', 'Cartão Sicoob')),
    CONSTRAINT crediarios_tipo_pagamento_check CHECK (tipo_pagamento IN ('A vista', 'Crediário'))
);

-- Enable RLS for crediarios
ALTER TABLE public.crediarios ENABLE ROW LEVEL SECURITY;

-- Create policy for public general access on crediarios
CREATE POLICY "Permitir acesso público geral para crediarios" ON public.crediarios
    AS PERMISSIVE FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- Grant API access to default Supabase roles for crediarios
GRANT ALL ON TABLE public.crediarios TO anon, authenticated, service_role;
