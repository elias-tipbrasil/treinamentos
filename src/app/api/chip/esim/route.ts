import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const operadora = searchParams.get("operadora") || "Surf";
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("chip_esim_pedidos")
    .select("*")
    .eq("operadora", operadora)
    .order("data_entrada", { ascending: false })
    .order("criado_em", { ascending: false });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ pedidos: data || [] });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json();
  if (!body.operadora || !body.nome_parceiro) {
    return NextResponse.json({ erro: "Operadora e parceiro obrigatórios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("chip_esim_pedidos").insert({
    operadora: body.operadora,
    data_entrada: body.data_entrada || new Date().toISOString().slice(0, 10),
    nome_parceiro: body.nome_parceiro,
    cod_easy: body.cod_easy || null,
    qtde_contratada: Number(body.qtde_contratada) || 0,
    qtde_enviada: Number(body.qtde_enviada) || 0,
    data_pedido: body.data_pedido || null,
    status: body.status || null,
    data_entrega: body.data_entrega || null,
    nome_rede: body.nome_rede || null,
    obs: body.obs || null,
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
    "data_entrada", "nome_parceiro", "cod_easy", "qtde_contratada", "qtde_enviada",
    "data_pedido", "status", "data_entrega", "nome_rede", "obs", "operadora",
  ];
  const update: Record<string, any> = {};
  for (const k of permitido) if (k in campos) update[k] = campos[k] === "" ? null : campos[k];

  const supabase = createAdminClient();
  const { error } = await supabase.from("chip_esim_pedidos").update(update).eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ erro: "id" }, { status: 400 });
  const supabase = createAdminClient();
  await supabase.from("chip_esim_pedidos").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
