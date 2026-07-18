-- Controle de Chip · TIP Brasil
-- Rodar no Supabase SQL Editor

create table if not exists chip_produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  operadora text not null,        -- Telecall | Surf | Arqia
  tipo text not null default 'chip', -- chip | esim
  ativo boolean default true,
  ordem int default 0
);

create table if not exists chip_producao (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid references chip_produtos(id) on delete cascade,
  data date not null default current_date,
  quantidade int not null,
  observacao text,
  criado_em timestamptz default now()
);

create table if not exists chip_estoque_mov (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid references chip_produtos(id) on delete cascade,
  data date not null default current_date,
  tipo text not null check (tipo in ('entrada','saida')),
  quantidade int not null,
  observacao text,
  criado_em timestamptz default now()
);

create index if not exists idx_chip_producao_data on chip_producao(data);
create index if not exists idx_chip_producao_produto on chip_producao(produto_id);
create index if not exists idx_chip_estoque_mov_produto on chip_estoque_mov(produto_id);

insert into chip_produtos (nome, operadora, tipo, ordem) values
  ('Telecall Chip', 'Telecall', 'chip', 1),
  ('Telecall E-sim (Mobile)', 'Telecall', 'esim', 2),
  ('Telecall Chip Valhalla', 'Telecall', 'chip', 3),
  ('Surf Chip', 'Surf', 'chip', 4),
  ('Surf E-sim (Tá)', 'Surf', 'esim', 5),
  ('Surf Chip (Tá)', 'Surf', 'chip', 6),
  ('Surf Valhalla Chip (Tá)', 'Surf', 'chip', 7),
  ('Arqia Chip', 'Arqia', 'chip', 8),
  ('Arqia Chip (Mobile)', 'Arqia', 'chip', 9),
  ('Arqia E-sim (Mobile)', 'Arqia', 'esim', 10)
on conflict (nome) do nothing;
