import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { getChipProdutos } from "@/lib/chip";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const grupo = searchParams.get("grupo") || "chip"; // "chip" (chip+esim) | "insumo"
  const tipos = grupo === "insumo" ? ["insumo"] : ["chip", "esim"];

  const supabase = createAdminClient();
  const produtos = await getChipProdutos(tipos);
  const idsProdutos = produtos.map((p) => p.id);

  const { data: movs } = await supabase
    .from("chip_estoque_mov")
    .select("id, produto_id, data, tipo, quantidade, observacao, chip_produtos(nome, operadora)")
    .in("produto_id", idsProdutos)
    .order("data", { ascending: false })
    .limit(200);

  const saldoPorProduto = new Map<string, number>();
  const { data: todasMovs } = await supabase.from("chip_estoque_mov").select("produto_id, tipo, quantidade").in("produto_id", idsProdutos);
  for (const m of todasMovs || []) {
    const delta = m.tipo === "entrada" ? m.quantidade : -m.quantidade;
    saldoPorProduto.set(m.produto_id, (saldoPorProduto.get(m.produto_id) || 0) + delta);
  }

  const saldos = produtos.map((p) => ({ ...p, saldo: saldoPorProduto.get(p.id) || 0 }));

  return NextResponse.json({ movimentacoes: movs || [], saldos });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const { produto_id, data, tipo, quantidade, observacao } = await req.json();
  if (!produto_id || !quantidade || !["entrada", "saida"].includes(tipo)) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("chip_estoque_mov").insert({
    produto_id,
    data: data || new Date().toISOString().slice(0, 10),
    tipo,
    quantidade: Number(quantidade),
    observacao: observacao || null,
  });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ erro: "id" }, { status: 400 });
  const supabase = createAdminClient();
  await supabase.from("chip_estoque_mov").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
