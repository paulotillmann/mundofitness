-- Migration: Normalizar dados de pagamentos já pagos
-- Description: Atualiza valor_parcela e data_vencimento com os dados de pagamento correspondentes.

UPDATE public.consorcios_pagamentos
SET 
    valor_parcela = COALESCE(valorpago_number, valor_parcela),
    data_vencimento = datapagamento_date,
    updated_at = now()
WHERE 
    datapagamento_date IS NOT NULL;
