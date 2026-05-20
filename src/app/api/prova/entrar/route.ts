import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const { sessao_id, nome, email } = await req.json();
  if (!sessao_id || !nome || !email) return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: sessao } = await supabase.from("sessoes").select("status").eq("id", sessao_id).single();
  if (!sessao || sessao.status !== "ativa") return NextResponse.json({ erro: "Sessão indisponível" }, { status: 400 });

  // se já entrou com o mesmo e-mail, retorna o mesmo participante
  const emailNorm = email.toLowerCase().trim();
  const { data: existente } = await supabase.from("participantes")
    .select("id").eq("sessao_id", sessao_id).eq("email", emailNorm).maybeSingle();
  if (existente) return NextResponse.json({ participante_id: existente.id });

  const { data, error } = await supabase.from("participantes")
    .insert({ sessao_id, nome: nome.trim(), email: emailNorm })
    .select("id").single();
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ participante_id: data.id });
}
