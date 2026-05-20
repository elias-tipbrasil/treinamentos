import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const { participante_id, pergunta_id, tipo, valor } = await req.json();
  if (!participante_id || !pergunta_id) return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });

  const supabase = createAdminClient();

  // valida que módulo da pergunta está aberto e sessão ativa
  const { data: pergunta } = await supabase.from("perguntas").select("modulo_id").eq("id", pergunta_id).single();
  if (!pergunta) return NextResponse.json({ erro: "Pergunta inválida" }, { status: 400 });

  const { data: participante } = await supabase.from("participantes").select("sessao_id").eq("id", participante_id).single();
  if (!participante) return NextResponse.json({ erro: "Participante inválido" }, { status: 400 });

  const { data: sessao } = await supabase.from("sessoes").select("status").eq("id", participante.sessao_id).single();
  if (!sessao || sessao.status !== "ativa") return NextResponse.json({ erro: "Sessão encerrada" }, { status: 400 });

  const { data: lib } = await supabase.from("modulos_liberados")
    .select("liberado_em, fechado_em").eq("sessao_id", participante.sessao_id).eq("modulo_id", pergunta.modulo_id).maybeSingle();
  if (!lib || lib.fechado_em) return NextResponse.json({ erro: "Módulo fechado" }, { status: 400 });

  const payload: any = { participante_id, pergunta_id };
  if (tipo === "multipla_escolha") payload.alternativa_id = valor;
  else if (tipo === "escala") payload.valor_escala = valor;
  else if (tipo === "texto_longo") payload.texto_resposta = valor;

  const { error } = await supabase.from("respostas").upsert(payload, { onConflict: "participante_id,pergunta_id" });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
