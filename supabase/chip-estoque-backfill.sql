-- Rodar no Supabase SQL Editor, DEPOIS do chip-estoque-fix-unique.sql
-- Recria a baixa de estoque para todos os pedidos que já têm quantidade enviada
insert into chip_estoque_mov (pedido_id, produto_id, data, tipo, quantidade, observacao)
select
  p.id,
  prod.id,
  coalesce(p.data_envio, p.data_entrada),
  'saida',
  p.qtde_enviada,
  'Envio automático · ' || p.nome_cliente
from chip_pedidos p
join chip_produtos prod on prod.nome = case p.rede
  when 'Tim' then 'Surf Chip'
  when 'Vivo' then 'Telecall Chip'
  when 'Arqia' then 'Arqia Chip'
  when 'Valhalla' then 'Valhalla Chip'
end
where p.qtde_enviada > 0
on conflict (pedido_id) do update set
  quantidade = excluded.quantidade,
  data = excluded.data,
  produto_id = excluded.produto_id;
