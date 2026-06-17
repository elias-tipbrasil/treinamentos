import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const { id } = await params;
  const { executivo_id, entrou, nota, comentario } = await req.json();
  if (!executivo_id || !entrou) return NextResponse.json({ erro: "Executivo e presença são obrigatórios" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("kickoffs").update({
    executivo_id,
    avaliacao_entrou: entrou,
    avaliacao_nota: entrou === "sim" ? nota : null,
    avaliacao_comentario: comentario || null,
    encerrado_em: new Date().toISOString(),
  }).eq("id", id).or(user.role === "admin" ? "palestrante_id.not.is.null" : "palestrante_id.eq." + user.id);

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
