import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

const REDE_PRODUTO: Record<string, string> = {
  Tim: "Surf Chip",
  Vivo: "Telecall Chip",
  Arqia: "Arqia Chip",
  Valhalla: "Valhalla Chip",
};

async function sincronizarEstoque(supabase: ReturnType<typeof createAdminClient>, pedidoId: string) {
  const { data: pedido } = await supabase
    .from("chip_pedidos")
    .select("rede, qtde_enviada, data_envio, data_entrada, nome_cliente")
    .eq("id", pedidoId)
    .single();
  if (!pedido) return;

  if (!pedido.qtde_enviada || pedido.qtde_enviada <= 0) {
    await supabase.from("chip_estoque_mov").delete().eq("pedido_id", pedidoId);
    return;
  }

  const produtoNome = REDE_PRODUTO[pedido.rede];
  if (!produtoNome) return;
  const { data: produto } = await supabase.from("chip_produtos").select("id").eq("nome", produtoNome).maybeSingle();
  if (!produto) return;

  const { error: erroUpsert } = await supabase.from("chip_estoque_mov").upsert(
    {
      pedido_id: pedidoId,
      produto_id: produto.id,
      data: pedido.data_envio || pedido.data_entrada,
      tipo: "saida",
      quantidade: pedido.qtde_enviada,
      observacao: `Envio automático · ${pedido.nome_cliente}`,
    },
    { onConflict: "pedido_id" }
  );
  if (erroUpsert) console.error("Falha ao sincronizar estoque:", erroUpsert.message);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rede = searchParams.get("rede") || "Tim";
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("chip_pedidos")
    .select("*")
    .eq("rede", rede)
    .order("data_entrada", { ascending: false })
    .order("criado_em", { ascending: false });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ pedidos: data || [] });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json();
  if (!body.rede || !body.nome_cliente) {
    return NextResponse.json({ erro: "Rede e cliente obrigatórios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("chip_pedidos").insert({
    rede: body.rede,
    data_entrada: body.data_entrada || new Date().toISOString().slice(0, 10),
    arte_aprovada: body.arte_aprovada || null,
    nome_cliente: body.nome_cliente,
    cod_easy: body.cod_easy || null,
    qtde_contratada: Number(body.qtde_contratada) || 0,
    qtde_enviada: Number(body.qtde_enviada) || 0,
    data_envio: body.data_envio || null,
    status_arte: body.status_arte || null,
    producao: body.producao || null,
    plano: body.plano || null,
    obs: body.obs || null,
    nome_rede: body.nome_rede || null,
    link_arte: body.link_arte || null,
    endereco_entrega: body.endereco_entrega || null,
    responsavel_contato: body.responsavel_contato || null,
  }).select("id").single();
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json();
  const { id, ...campos } = body;
  if (!id) return NextResponse.json({ erro: "id" }, { status: 400 });

  const permitido = [
    "data_entrada", "arte_aprovada", "nome_cliente", "cod_easy", "qtde_contratada",
    "qtde_enviada", "data_envio", "status_arte", "producao", "plano", "obs",
    "nome_rede", "link_arte", "endereco_entrega", "responsavel_contato", "rede",
    "prova_digital_recebida",
  ];
  const update: Record<string, any> = {};
  for (const k of permitido) if (k in campos) update[k] = campos[k] === "" ? null : campos[k];

  const supabase = createAdminClient();
  const { error } = await supabase.from("chip_pedidos").update(update).eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  if ("qtde_enviada" in campos || "data_envio" in campos || "rede" in campos) {
    await sincronizarEstoque(supabase, id);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ erro: "id" }, { status: 400 });
  const supabase = createAdminClient();
  await supabase.from("chip_pedidos").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
