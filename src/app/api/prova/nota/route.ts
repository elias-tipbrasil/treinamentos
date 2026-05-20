import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const participante = url.searchParams.get("participante");
  const sessao = url.searchParams.get("sessao");
  if (!participante || !sessao) return NextResponse.json({ erro: "Parâmetros faltando" }, { status: 400 });

  const supabase = createAdminClient();

  // valida vínculo
  const { data: p } = await supabase.from("participantes").select("sessao_id").eq("id", participante).single();
  if (!p || p.sessao_id !== sessao) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  // perguntas com vale_nota=true do treinamento da sessão
  const { data: sess } = await supabase.from("sessoes").select("treinamento_id").eq("id", sessao).single();
  if (!sess) return NextResponse.json({ erro: "Sessão inválida" }, { status: 400 });

  const { data: modulos } = await supabase.from("modulos").select("id").eq("treinamento_id", sess.treinamento_id);
  const moduloIds = modulos?.map((m) => m.id) || [];

  const { data: perguntas } = await supabase.from("perguntas")
    .select("id, alternativas(id, correta)")
    .in("modulo_id", moduloIds).eq("vale_nota", true);

  const total = perguntas?.length || 0;

  const { data: respostas } = await supabase.from("respostas")
    .select("pergunta_id, alternativa_id").eq("participante_id", participante);

  const respMap = new Map(respostas?.map((r) => [r.pergunta_id, r.alternativa_id]) || []);

  let acertos = 0;
  perguntas?.forEach((p: any) => {
    const altResp = respMap.get(p.id);
    const altCorreta = p.alternativas.find((a: any) => a.correta)?.id;
    if (altResp && altResp === altCorreta) acertos++;
  });

  const pct = total > 0 ? (acertos / total) * 100 : 0;
  return NextResponse.json({ acertos, total, pct });
}
