-- Rodar no Supabase SQL Editor (depois do seed da TIM)
update chip_pedidos
set cod_easy = regexp_replace(cod_easy, '\.0$', '')
where cod_easy ~ '\.0$';
