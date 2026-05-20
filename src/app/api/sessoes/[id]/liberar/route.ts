import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const { modulo_id } = await req.json();

  const supabase = createAdminClient();
  const { data: sessao } = await supabase.from("sessoes").select("palestrante_id, status").eq("id", id).single();
  if (!sessao || sessao.palestrante_id !== user.id) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  if (sessao.status !== "ativa") return NextResponse.json({ erro: "Sessão encerrada" }, { status: 400 });

  const { error } = await supabase.from("modulos_liberados").upsert({ sessao_id: id, modulo_id, fechado_em: null }, { onConflict: "sessao_id,modulo_id" });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
