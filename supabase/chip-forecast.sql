-- Rodar no Supabase SQL Editor

create table if not exists chip_forecast_parametros (
  operadora text primary key,
  lead_time_meses int not null default 2,
  gordura_seguranca int not null default 0,
  custo_unitario numeric not null default 0,
  pct_entrega numeric not null default 0.5,   -- parcela paga no pedido/entrega
  pct_60d numeric not null default 0.5        -- parcela paga em 60 dias
);

insert into chip_forecast_parametros (operadora, lead_time_meses, gordura_seguranca, custo_unitario, pct_entrega, pct_60d) values
  ('Surf', 2, 5000, 4.58, 0.5, 0.5),
  ('Telecall', 2, 5000, 4.58, 0.5, 0.5),
  ('Arqia', 2, 5000, 0, 0.5, 0.5),
  ('Valhalla', 2, 5000, 4.58, 0.5, 0.5)
on conflict (operadora) do nothing;

create table if not exists chip_forecast_mensal (
  operadora text not null,
  mes date not null,               -- sempre dia 1 do mês
  consumo_projetado int not null default 0,
  pedido_real int,                 -- null = ainda usa o valor sugerido calculado
  primary key (operadora, mes)
);
