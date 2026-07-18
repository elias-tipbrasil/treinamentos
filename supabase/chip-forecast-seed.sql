-- Rodar no Supabase SQL Editor (depois de chip-forecast.sql)
insert into chip_forecast_mensal (operadora, mes, consumo_projetado) values
  ('Telecall', '2026-07-01', 20000),
  ('Telecall', '2026-08-01', 14000),
  ('Telecall', '2026-09-01', 13000),
  ('Telecall', '2026-10-01', 13000),
  ('Telecall', '2026-11-01', 13000),
  ('Telecall', '2026-12-01', 13000),

  ('Surf', '2026-07-01', 12000),
  ('Surf', '2026-08-01', 6000),
  ('Surf', '2026-09-01', 5000),
  ('Surf', '2026-10-01', 5000),
  ('Surf', '2026-11-01', 5000),
  ('Surf', '2026-12-01', 5000),

  ('Valhalla', '2026-07-01', 7000)
on conflict (operadora, mes) do update set consumo_projetado = excluded.consumo_projetado;
