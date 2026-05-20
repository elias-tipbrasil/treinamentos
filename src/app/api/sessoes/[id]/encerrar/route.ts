import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: sessao } = await supabase.from("sessoes").select("palestrante_id").eq("id", id).single();
  if (!sessao || sessao.palestrante_id !== user.id) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  await supabase.from("sessoes").update({ status: "encerrada", encerrada_em: new Date().toISOString() }).eq("id", id);
  await supabase.from("modulos_liberados").update({ fechado_em: new Date().toISOString() }).eq("sessao_id", id).is("fechado_em", null);
  return NextResponse.json({ ok: true });
}
