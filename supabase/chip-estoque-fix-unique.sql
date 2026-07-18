-- Rodar no Supabase SQL Editor
drop index if exists idx_chip_estoque_mov_pedido;

alter table chip_estoque_mov
  add constraint chip_estoque_mov_pedido_id_key unique (pedido_id);
