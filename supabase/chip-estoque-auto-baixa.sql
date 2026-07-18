-- Rodar no Supabase SQL Editor

-- Garante que existe um produto de estoque para Valhalla Chip
insert into chip_produtos (nome, operadora, tipo, ordem)
values ('Valhalla Chip', 'Valhalla', 'chip', 11)
on conflict (nome) do nothing;

-- Liga cada movimentação de estoque a um pedido (para baixa automática 1:1)
alter table chip_estoque_mov add column if not exists pedido_id uuid references chip_pedidos(id) on delete cascade;

create unique index if not exists idx_chip_estoque_mov_pedido
  on chip_estoque_mov(pedido_id)
  where pedido_id is not null;
