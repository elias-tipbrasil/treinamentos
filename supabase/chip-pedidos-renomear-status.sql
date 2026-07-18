-- Rodar no Supabase SQL Editor (renomeia status já existentes nos pedidos de chip)
update chip_pedidos set status_arte = 'Pronto' where status_arte = 'Pronta!';
update chip_pedidos set status_arte = 'Aguard. Parceiro' where status_arte = 'Aguardando cliente enviar';
update chip_pedidos set status_arte = 'Aguard. Aprovação Arte' where status_arte = 'Aguardando arte';
