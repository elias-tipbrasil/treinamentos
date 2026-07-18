-- Rodar no Supabase SQL Editor
alter table chip_forecast_mensal add column if not exists custo_unitario numeric;
alter table chip_forecast_mensal add column if not exists pct_entrega numeric;
