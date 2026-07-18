-- Controle de Produção · Chip · TIP Brasil
-- Rodar no Supabase SQL Editor

create table if not exists chip_pedidos (
  id uuid primary key default gen_random_uuid(),
  rede text not null,                  -- Tim | Vivo | Arqia | Valhalla
  data_entrada date not null default current_date,
  arte_aprovada date,
  nome_cliente text not null,
  cod_easy text,
  qtde_contratada int not null default 0,
  qtde_enviada int not null default 0,
  data_envio date,
  status_arte text,                    -- Pronta! | Aguardando cliente enviar | ...
  producao text,                       -- Produção TIP | Grafica Campinas | Grafica SP
  plano text,                          -- FIXO | CONSUMO | ...
  obs text,                            -- FINALIZADO | Inadimplente | Projeto Pausado | ...
  nome_rede text,                      -- apelido do cliente
  link_arte text,
  endereco_entrega text,
  responsavel_contato text,
  criado_em timestamptz default now()
);

create index if not exists idx_chip_pedidos_rede on chip_pedidos(rede);
create index if not exists idx_chip_pedidos_data on chip_pedidos(data_entrada);
