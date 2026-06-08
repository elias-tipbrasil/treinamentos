import { createAdminClient } from "@/lib/supabase-admin";

export interface DashboardFilters {
  inicio?: string; fim?: string; palestranteId?: string; treinamentoId?: string; isp?: string;
}

export interface DashboardData {
  resumo: { sessoes: number; sessoesAtivas: number; participantes: number; treinamentos: number; notaMedia: number; taxaConclusao: number; };
  porPeriodo: { periodo: string; sessoes: number; participantes: number }[];
  porTreinamento: { nome: string; sessoes: number; participantes: number; notaMedia: number }[];
  porISP: { isp: string; sessoes: number; participantes: number; notaMedia: number }[];
  porPalestrante: { nome: string; sessoes: number; participantes: number; notaMedia: number }[];
  distribuicaoNotas: { faixa: string; qtd: number; cor: string }[];
  topPerguntasErradas: { enunciado: string; modulo: string; treinamento: string; taxaAcerto: number; total: number }[];
  participantes: {
    id: string; nome: string; email: string; isp: string; treinamento: string; pin: string;
    nota: number; acertos: number; total: number; respondeuTudo: boolean;
    respostas: { enunciado: string; modulo: string; tipo: string; valeNota: boolean; resposta: string; correta: boolean | null }[];
  }[];
  filtros: { palestrantes: { id: string; nome: string }[]; treinamentos: { id: string; nome: string }[]; isps: string[]; };
}

export async function buildDashboard(filtros: DashboardFilters, palestranteScopeId?: string): Promise<DashboardData> {
  const supabase = createAdminClient();

  let qSessoes = supabase
    .from("sessoes")
    .select(`
      id, pin, parceiro_isp, data_hora, status, qtd_esperada, palestrante_id, treinamento_id,
      treinamento:treinamentos(id, nome),
      palestrante:usuarios!sessoes_palestrante_id_fkey(id, nome),
      participantes(id, nome, email, respostas(pergunta_id, alternativa_id, valor_escala, texto_resposta))
    `);

  if (palestranteScopeId) qSessoes = qSessoes.eq("palestrante_id", palestranteScopeId);
  else if (filtros.palestranteId) qSessoes = qSessoes.eq("palestrante_id", filtros.palestranteId);
  if (filtros.treinamentoId) qSessoes = qSessoes.eq("treinamento_id", filtros.treinamentoId);
  if (filtros.isp) qSessoes = qSessoes.ilike("parceiro_isp", `%${filtros.isp}%`);
  if (filtros.inicio) qSessoes = qSessoes.gte("data_hora", filtros.inicio);
  if (filtros.fim) qSessoes = qSessoes.lte("data_hora", filtros.fim + "T23:59:59");

  const { data: sessoes } = await qSessoes;

  const treinamentoIds = Array.from(new Set((sessoes || []).map((s: any) => s.treinamento_id)));
  const { data: perguntasAll } = await supabase
    .from("perguntas")
    .select("id, enunciado, vale_nota, tipo, ordem, modulo:modulos!inner(nome, ordem, treinamento_id, treinamento:treinamentos(nome)), alternativas(id, texto, correta, ordem)")
    .in("modulo.treinamento_id", treinamentoIds.length ? treinamentoIds : ["00000000-0000-0000-0000-000000000000"]);

  const gabarito: Record<string, string> = {};
  const pergMeta: Record<string, any> = {};
  (perguntasAll || []).forEach((p: any) => {
    const c = p.alternativas?.find((a: any) => a.correta);
    if (c) gabarito[p.id] = c.id;
    const alts: Record<string, string> = {};
    (p.alternativas || []).forEach((a: any) => { alts[a.id] = a.texto; });
    pergMeta[p.id] = {
      vale_nota: p.vale_nota, enunciado: p.enunciado, tipo: p.tipo,
      modulo: p.modulo?.nome || "—", moduloOrdem: p.modulo?.ordem ?? 0, ordem: p.ordem ?? 0,
      treinamento: p.modulo?.treinamento?.nome || "—", alts,
    };
  });

  const participantesProcessed: any[] = [];
  (sessoes || []).forEach((s: any) => {
    s.participantes.forEach((p: any) => {
      const respMap = new Map<string, any>(p.respostas.map((r: any) => [r.pergunta_id, r]));
      let acertos = 0, totalVN = 0, respondidasVN = 0;
      const detalhe: any[] = [];
      const ids = Object.keys(pergMeta)
        .filter((id) => pergMeta[id].treinamento === s.treinamento?.nome)
        .sort((a, b) => (pergMeta[a].moduloOrdem - pergMeta[b].moduloOrdem) || (pergMeta[a].ordem - pergMeta[b].ordem));
      ids.forEach((id) => {
        const meta = pergMeta[id];
        const r = respMap.get(id);
        if (meta.vale_nota) { totalVN++; if (r && r.alternativa_id) { respondidasVN++; if (r.alternativa_id === gabarito[id]) acertos++; } }
        let resposta = ""; let correta: boolean | null = null;
        if (r) {
          if (meta.tipo === "multipla_escolha") { resposta = meta.alts[r.alternativa_id] || "—"; correta = meta.vale_nota ? r.alternativa_id === gabarito[id] : null; }
          else if (meta.tipo === "escala") { resposta = r.valor_escala != null ? `Nota ${r.valor_escala}` : ""; }
          else { resposta = r.texto_resposta || ""; }
        } else if (meta.vale_nota) { correta = false; }
        detalhe.push({ enunciado: meta.enunciado, modulo: meta.modulo, tipo: meta.tipo, valeNota: meta.vale_nota, resposta, correta });
      });
      const nota = totalVN > 0 ? (acertos / totalVN) * 100 : 0;
      participantesProcessed.push({
        sessao: s, id: p.id, nome: p.nome, email: p.email, isp: s.parceiro_isp || "—",
        treinamento: s.treinamento?.nome || "—", pin: s.pin, nota, acertos,
        respondeuTudo: totalVN > 0 && respondidasVN === totalVN, total: totalVN, respostas: detalhe,
      });
    });
  });

  const totalParticipantes = participantesProcessed.length;
  const notaMedia = totalParticipantes ? participantesProcessed.reduce((s, p) => s + p.nota, 0) / totalParticipantes : 0;
  const concluidos = participantesProcessed.filter((p) => p.respondeuTudo).length;
  const taxaConclusao = totalParticipantes ? (concluidos / totalParticipantes) * 100 : 0;

  const resumo = {
    sessoes: (sessoes || []).length,
    sessoesAtivas: (sessoes || []).filter((s: any) => s.status === "ativa").length,
    participantes: totalParticipantes, treinamentos: treinamentoIds.length, notaMedia, taxaConclusao,
  };

  const porPeriodoMap: Record<string, { sessoes: number; participantes: number }> = {};
  (sessoes || []).forEach((s: any) => {
    const d = new Date(s.data_hora);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!porPeriodoMap[key]) porPeriodoMap[key] = { sessoes: 0, participantes: 0 };
    porPeriodoMap[key].sessoes++;
    porPeriodoMap[key].participantes += s.participantes.length;
  });
  const porPeriodo = Object.entries(porPeriodoMap).map(([periodo, v]) => ({ periodo, ...v })).sort((a, b) => a.periodo.localeCompare(b.periodo));

  const trMap: Record<string, any> = {};
  (sessoes || []).forEach((s: any) => {
    const nome = s.treinamento?.nome || "—";
    if (!trMap[nome]) trMap[nome] = { nome, sessoes: 0, participantes: 0, somaNota: 0, numNotas: 0 };
    trMap[nome].sessoes++; trMap[nome].participantes += s.participantes.length;
  });
  participantesProcessed.forEach((p) => { if (trMap[p.treinamento] && p.total > 0) { trMap[p.treinamento].somaNota += p.nota; trMap[p.treinamento].numNotas++; } });
  const porTreinamento = Object.values(trMap).map((t: any) => ({ nome: t.nome, sessoes: t.sessoes, participantes: t.participantes, notaMedia: t.numNotas ? t.somaNota / t.numNotas : 0 })).sort((a, b) => b.participantes - a.participantes);

  const ispMap: Record<string, any> = {};
  (sessoes || []).forEach((s: any) => {
    const isp = s.parceiro_isp || "—";
    if (!ispMap[isp]) ispMap[isp] = { isp, sessoes: 0, participantes: 0, somaNota: 0, numNotas: 0 };
    ispMap[isp].sessoes++; ispMap[isp].participantes += s.participantes.length;
  });
  participantesProcessed.forEach((p) => { if (ispMap[p.isp] && p.total > 0) { ispMap[p.isp].somaNota += p.nota; ispMap[p.isp].numNotas++; } });
  const porISP = Object.values(ispMap).map((i: any) => ({ isp: i.isp, sessoes: i.sessoes, participantes: i.participantes, notaMedia: i.numNotas ? i.somaNota / i.numNotas : 0 })).sort((a, b) => b.participantes - a.participantes).slice(0, 10);

  const palMap: Record<string, any> = {};
  (sessoes || []).forEach((s: any) => {
    const nome = s.palestrante?.nome || "—";
    if (!palMap[nome]) palMap[nome] = { nome, sessoes: 0, participantes: 0, somaNota: 0, numNotas: 0 };
    palMap[nome].sessoes++; palMap[nome].participantes += s.participantes.length;
  });
  participantesProcessed.forEach((p) => { const nome = p.sessao.palestrante?.nome || "—"; if (palMap[nome] && p.total > 0) { palMap[nome].somaNota += p.nota; palMap[nome].numNotas++; } });
  const porPalestrante = Object.values(palMap).map((p: any) => ({ nome: p.nome, sessoes: p.sessoes, participantes: p.participantes, notaMedia: p.numNotas ? p.somaNota / p.numNotas : 0 })).sort((a, b) => b.participantes - a.participantes);

  const faixas = [
    { faixa: "0-20%", min: 0, max: 20, cor: "#EF4444" },
    { faixa: "21-40%", min: 21, max: 40, cor: "#F97316" },
    { faixa: "41-60%", min: 41, max: 60, cor: "#F59E0B" },
    { faixa: "61-80%", min: 61, max: 80, cor: "#84CC16" },
    { faixa: "81-100%", min: 81, max: 100, cor: "#22C55E" },
  ];
  const distribuicaoNotas = faixas.map((f) => ({ faixa: f.faixa, cor: f.cor, qtd: participantesProcessed.filter((p) => p.total > 0 && p.nota >= f.min && p.nota <= f.max).length }));

  const pergStats: Record<string, { acertos: number; total: number }> = {};
  (sessoes || []).forEach((s: any) => {
    s.participantes.forEach((p: any) => {
      p.respostas.forEach((r: any) => {
        const meta = pergMeta[r.pergunta_id];
        if (!meta || !meta.vale_nota || !r.alternativa_id) return;
        if (!pergStats[r.pergunta_id]) pergStats[r.pergunta_id] = { acertos: 0, total: 0 };
        pergStats[r.pergunta_id].total++;
        if (r.alternativa_id === gabarito[r.pergunta_id]) pergStats[r.pergunta_id].acertos++;
      });
    });
  });
  const topPerguntasErradas = Object.entries(pergStats).filter(([, s]) => s.total >= 1).map(([id, s]) => ({
    enunciado: pergMeta[id]?.enunciado || "", modulo: pergMeta[id]?.modulo || "", treinamento: pergMeta[id]?.treinamento || "",
    taxaAcerto: (s.acertos / s.total) * 100, total: s.total,
  })).sort((a, b) => a.taxaAcerto - b.taxaAcerto).slice(0, 5);

  const participantes = participantesProcessed.map((p) => ({
    id: p.id, nome: p.nome, email: p.email, isp: p.isp, treinamento: p.treinamento, pin: p.pin,
    nota: p.nota, acertos: p.acertos, total: p.total, respondeuTudo: p.respondeuTudo, respostas: p.respostas,
  })).sort((a, b) => b.nota - a.nota).slice(0, 500);

  const { data: palestrantesList } = await supabase.from("usuarios").select("id, nome").eq("ativo", true).order("nome");
  const { data: treinamentosList } = await supabase.from("treinamentos").select("id, nome").eq("ativo", true).order("nome");
  const ispsSet = new Set<string>();
  (sessoes || []).forEach((s: any) => s.parceiro_isp && ispsSet.add(s.parceiro_isp));

  return {
    resumo, porPeriodo, porTreinamento, porISP, porPalestrante, distribuicaoNotas, topPerguntasErradas, participantes,
    filtros: { palestrantes: (palestrantesList || []) as any, treinamentos: (treinamentosList || []) as any, isps: Array.from(ispsSet).sort() },
  };
}
