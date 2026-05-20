import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

function gerarCodigo() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `TIP-${part1}-${part2}`;
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: sessao } = await supabase
    .from("sessoes")
    .select("id, parceiro_isp, data_hora, treinamento_id, palestrante_id, treinamento:treinamentos(nome)")
    .eq("id", id).single();
  if (!sessao || sessao.palestrante_id !== user.id)
    return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  // Pega todas as perguntas com vale_nota=true do treinamento
  const { data: modulos } = await supabase.from("modulos").select("id").eq("treinamento_id", sessao.treinamento_id);
  const moduloIds = modulos?.map((m) => m.id) || [];

  const { data: perguntas } = await supabase
    .from("perguntas")
    .select("id, vale_nota, alternativas(id, correta)")
    .in("modulo_id", moduloIds)
    .eq("vale_nota", true);

  const totalObrigatorias = perguntas?.length || 0;
  const gabarito: Record<string, string> = {};
  perguntas?.forEach((p: any) => {
    const c = p.alternativas?.find((a: any) => a.correta);
    if (c) gabarito[p.id] = c.id;
  });

  // Lista participantes da sessão
  const { data: participantes } = await supabase
    .from("participantes")
    .select("id, nome, respostas(pergunta_id, alternativa_id)")
    .eq("sessao_id", id);

  let emitidos = 0;
  let pulados = 0;
  let jaExistiam = 0;

  for (const p of (participantes || [])) {
    // verifica se respondeu TODAS as obrigatórias
    const respostasMap = new Map((p as any).respostas.map((r: any) => [r.pergunta_id, r.alternativa_id]));
    let acertos = 0;
    let respondidasObrig = 0;
    perguntas?.forEach((perg: any) => {
      const resp = respostasMap.get(perg.id);
      if (resp) {
        respondidasObrig++;
        if (resp === gabarito[perg.id]) acertos++;
      }
    });

    if (respondidasObrig < totalObrigatorias) { pulados++; continue; }

    // verifica se já tem certificado
    const { data: existente } = await supabase
      .from("certificados").select("id").eq("participante_id", p.id).eq("sessao_id", id).maybeSingle();
    if (existente) { jaExistiam++; continue; }

    // gera código único (tenta até 5 vezes)
    let codigo = "";
    for (let i = 0; i < 5; i++) {
      codigo = gerarCodigo();
      const { data: dup } = await supabase.from("certificados").select("id").eq("codigo", codigo).maybeSingle();
      if (!dup) break;
    }

    const nota = totalObrigatorias > 0 ? (acertos / totalObrigatorias) * 100 : 0;

    await supabase.from("certificados").insert({
      participante_id: p.id, sessao_id: id, codigo,
      nome_completo: p.nome,
      treinamento_nome: (sessao.treinamento as any).nome,
      parceiro_isp: sessao.parceiro_isp,
      data_treinamento: new Date(sessao.data_hora).toISOString().slice(0, 10),
      nota_final: nota, total_perguntas: totalObrigatorias, acertos,
    });
    emitidos++;
  }

  return NextResponse.json({
    emitidos, pulados, jaExistiam,
    total: (participantes || []).length,
    totalObrigatorias,
  });
}
