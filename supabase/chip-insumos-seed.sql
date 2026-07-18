-- Rodar no Supabase SQL Editor
insert into chip_produtos (nome, operadora, tipo, ordem) values
  ('Filme de impressão', 'Insumos', 'insumo', 20),
  ('Ribbon de impressão', 'Insumos', 'insumo', 21),
  ('Kit Limpeza Impressão', 'Insumos', 'insumo', 22),
  ('Caixa envio', 'Insumos', 'insumo', 23),
  ('Saco envio', 'Insumos', 'insumo', 24),
  ('Fita adesiva transparente', 'Insumos', 'insumo', 25)
on conflict (nome) do nothing;
