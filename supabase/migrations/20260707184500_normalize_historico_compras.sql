-- Migration: Normalize historico table entries (COM, compras -> COMPRAS)
-- Date: 2026-07-07

DO $$
DECLARE
    v_compras_id uuid;
    v_compras_lower_id uuid;
    v_com_id uuid;
BEGIN
    -- 1. Ensure 'COMPRAS' exists and get its ID
    INSERT INTO public.historico (descricao)
    VALUES ('COMPRAS')
    ON CONFLICT (descricao) DO UPDATE SET descricao = EXCLUDED.descricao
    RETURNING id INTO v_compras_id;

    -- 2. Retrieve IDs for 'compras' and 'COM' if they exist
    SELECT id INTO v_compras_lower_id FROM public.historico WHERE descricao = 'compras';
    SELECT id INTO v_com_id FROM public.historico WHERE descricao = 'COM';

    -- 3. Update all referencing records in public.crediarios to point to 'COMPRAS'
    IF v_compras_lower_id IS NOT NULL THEN
        UPDATE public.crediarios
        SET historico_id = v_compras_id
        WHERE historico_id = v_compras_lower_id;
    END IF;

    IF v_com_id IS NOT NULL THEN
        UPDATE public.crediarios
        SET historico_id = v_compras_id
        WHERE historico_id = v_com_id;
    END IF;

    -- 4. Delete old duplicate entries from public.historico
    DELETE FROM public.historico
    WHERE id IN (v_compras_lower_id, v_com_id);
END $$;
