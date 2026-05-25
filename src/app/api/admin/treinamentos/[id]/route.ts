import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();
  const { error } = await supabase.from("treinamentos").update(body).eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const { id } = await params;
  const supabase = createAdminClient();

  // Bloqueia exclusão se houver sessões usando este treinamento
  const { count } = await supabase
    .from("sessoes")
    .select("*", { count: "exact", head: true })
    .eq("treinamento_id", id);

  if (count && count > 0) {
    return NextResponse.json({
      erro: `Não é possível excluir: existem ${count} sessão(ões) usando este treinamento. Para preservar o histórico e os certificados, treinamentos já aplicados não podem ser apagados. Você pode desativá-lo em vez de excluir.`,
    }, { status: 409 });
  }

  const { error } = await supabase.from("treinamentos").delete().eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
