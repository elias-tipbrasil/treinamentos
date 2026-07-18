-- Rodar no Supabase SQL Editor
create table if not exists chip_esim_pedidos (
  id uuid primary key default gen_random_uuid(),
  operadora text not null,             -- Surf | Telecall | Arqia
  data_entrada date,
  nome_parceiro text not null,
  cod_easy text,
  qtde_contratada int not null default 0,
  qtde_enviada int not null default 0,
  data_pedido date,
  status text,                         -- Pronto | Aguard. Parceiro | Em produção
  data_entrega date,
  nome_rede text,
  obs text,
  criado_em timestamptz default now()
);

create index if not exists idx_chip_esim_operadora on chip_esim_pedidos(operadora);
