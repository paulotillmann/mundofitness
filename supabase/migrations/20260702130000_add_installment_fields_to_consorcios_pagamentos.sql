-- Migration: Add installment fields to consorcios_pagamentos table
-- Description: Adds valor_parcela and data_vencimento columns to support generating installments.

ALTER TABLE public.consorcios_pagamentos 
ADD COLUMN IF NOT EXISTS valor_parcela numeric NULL,
ADD COLUMN IF NOT EXISTS data_vencimento timestamp with time zone NULL;
