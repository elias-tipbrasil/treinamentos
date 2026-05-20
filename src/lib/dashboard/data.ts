import { createAdminClient } from "@/lib/supabase-admin";

export interface DashboardFilters {
  inicio?: string;        // ISO date
  fim?: string;           // ISO date
  palestranteId?: string; // só admin usa
  treinamentoId?: string;
  isp?: string;
}

export interface DashboardData {
  resumo: {
    sessoes: number;
    sessoesAtivas: number;
    participantes: number;
    treinamentos: number;
    notaMedia: number;
    taxaConclusao: number; // % de participantes que responderam tudo
  };
  porPeriodo: { periodo: string; sessoes: number; participantes: number }[];
  porTreinamento: { nome: string; sessoes: number; participantes: number; notaMedia: number }[];
  porISP: { isp: string; sessoes: number; participantes: number; notaMedia: number }[];
  porPalestrante: { nome: string; sessoes: number; participantes: number; notaMedia: number }[];
  distribuicaoNotas: { faixa: string; qtd: number; cor: string }[];
  topPerguntasErradas: { enunciado: string; modulo: string; treinamento: string; taxaAcerto: number; total: number }[];
  filtros: {
    palestrantes: { id: string; nome: string }[];
    treinamentos: { id: string; nome: string }[];
    isps: string[];
  };
}

export async function buildDashboard(filtros: DashboardFilters, palestranteScopeId?: string): Promise<DashboardData> {
  const supabase = createAdminClient();

  // monta query base de sessoes
  let qSessoes = supabase
    .from("sessoes")
    .select(`
      id, pin, parceiro_isp, data_hora, status, qtd_esperada,
      palestrante_id,
      treinamento_id,
      treinamento:treinamentos(id, nome),
      palestrante:usuarios!sessoes_palestrante_id_fkey(id, nome),
      participantes(
        id,
        respostas(pergunta_id, alternativa_id, valor_escala, texto_resposta)
      )
    `);

  if (palestranteScopeId) qSessoes = qSessoes.eq("palestrante_id", palestranteScopeId);
  else if (filtros.palestranteId) qSessoes = qSessoes.eq("palestrante_id", filtros.palestranteId);
  if (filtros.treinamentoId) qSessoes = qSessoes.eq("treinamento_id", filtros.treinamentoId);
  if (filtros.isp) qSessoes = qSessoes.ilike("parceiro_isp", `%${filtros.isp}%`);
  if (filtros.inicio) qSessoes = qSessoes.gte("data_hora", filtros.inicio);
  if (filtros.fim) qSessoes = qSessoes.lte("data_hora", filtros.fim + "T23:59:59");

  const { data: sessoes } = await qSessoes;

  // mapas de gabarito por pergunta
  const treinamentoIds = Array.from(new Set((sessoes || []).map((s: any) => s.treinamento_id)));
  const { data: perguntasAll } = await supabase
    .from("perguntas")
    .select("id, enunciado, vale_nota, modulo:modulos!inner(nome, treinamento_id, treinamento:treinamentos(nome)), alternativas(id, correta)")
    .in("modulo.treinamento_id", treinamentoIds.length ? treinamentoIds : ["00000000-0000-0000-0000-000000000000"]);

  const gabarito: Record<string, string> = {};
  const pergMeta: Record<string, { vale_nota: boolean; enunciado: string; modulo: string; treinamento: string }> = {};
  (perguntasAll || []).forEach((p: any) => {
    const c = p.alternativas?.find((a: any) => a.correta);
    if (c) gabarito[p.id] = c.id;
    pergMeta[p.id] = {
      vale_nota: p.vale_nota,
      enunciado: p.enunciado,
      modulo: p.modulo?.nome || "—",
      treinamento: p.modulo?.treinamento?.nome || "—",
    };
  });

  // Calcula nota de cada participante
  type PInfo = { sessao: any; nota: number; respondeuTudo: boolean; total: number };
  const participantesProcessed: PInfo[] = [];

  (sessoes || []).forEach((s: any) => {
    s.participantes.forEach((p: any) => {
      const respMap = new Map<string, any>(p.respostas.map((r: any) => [r.pergunta_id, r]));
      let acertos = 0, totalVN = 0, respondidasVN = 0;
      Object.keys(pergMeta).forEach((perguntaId) => {
        const meta = pergMeta[perguntaId];
        if (!meta.vale_nota) return;
        // filtra só perguntas do treinamento da sessão
        // (já filtramos pelo IN, mas pode misturar treinamentos diferentes)
        if (meta.treinamento !== s.treinamento?.nome) return;
        totalVN++;
        const r = respMap.get(perguntaId);
        if (r && r.alternativa_id) {
          respondidasVN++;
          if (r.alternativa_id === gabarito[perguntaId]) acertos++;
        }
      });
      const nota = totalVN > 0 ? (acertos / totalVN) * 100 : 0;
      participantesProcessed.push({
        sessao: s,
        nota,
        respondeuTudo: totalVN > 0 && respondidasVN === totalVN,
        total: totalVN,
      });
    });
  });

  // === RESUMO ===
  const totalParticipantes = participantesProcessed.length;
  const notaMedia = totalParticipantes
    ? participantesProcessed.reduce((s, p) => s + p.nota, 0) / totalParticipantes
    : 0;
  const concluidos = participantesProcessed.filter((p) => p.respondeuTudo).length;
  const taxaConclusao = totalParticipantes ? (concluidos / totalParticipantes) * 100 : 0;

  const resumo = {
    sessoes: (sessoes || []).length,
    sessoesAtivas: (sessoes || []).filter((s: any) => s.status === "ativa").length,
    participantes: totalParticipantes,
    treinamentos: treinamentoIds.length,
    notaMedia,
    taxaConclusao,
  };

  // === POR PERÍODO (últimas semanas) ===
  const porPeriodoMap: Record<string, { sessoes: number; participantes: number }> = {};
  (sessoes || []).forEach((s: any) => {
    const d = new Date(s.data_hora);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!porPeriodoMap[key]) porPeriodoMap[key] = { sessoes: 0, participantes: 0 };
    porPeriodoMap[key].sessoes++;
    porPeriodoMap[key].participantes += s.participantes.length;
  });
  const porPeriodo = Object.entries(porPeriodoMap)
    .map(([periodo, v]) => ({ periodo, ...v }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));

  // === POR TREINAMENTO ===
  const trMap: Record<string, { nome: string; sessoes: number; participantes: number; somaNota: number; numNotas: number }> = {};
  (sessoes || []).forEach((s: any) => {
    const nome = s.treinamento?.nome || "—";
    if (!trMap[nome]) trMap[nome] = { nome, sessoes: 0, participantes: 0, somaNota: 0, numNotas: 0 };
    trMap[nome].sessoes++;
    trMap[nome].participantes += s.participantes.length;
  });
  participantesProcessed.forEach((p) => {
    const nome = p.sessao.treinamento?.nome || "—";
    if (trMap[nome] && p.total > 0) {
      trMap[nome].somaNota += p.nota;
      trMap[nome].numNotas++;
    }
  });
  const porTreinamento = Object.values(trMap).map((t) => ({
    nome: t.nome,
    sessoes: t.sessoes,
    participantes: t.participantes,
    notaMedia: t.numNotas ? t.somaNota / t.numNotas : 0,
  })).sort((a, b) => b.participantes - a.participantes);

  // === POR ISP ===
  const ispMap: Record<string, { isp: string; sessoes: number; participantes: number; somaNota: number; numNotas: number }> = {};
  (sessoes || []).forEach((s: any) => {
    const isp = s.parceiro_isp || "—";
    if (!ispMap[isp]) ispMap[isp] = { isp, sessoes: 0, participantes: 0, somaNota: 0, numNotas: 0 };
    ispMap[isp].sessoes++;
    ispMap[isp].participantes += s.participantes.length;
  });
  participantesProcessed.forEach((p) => {
    const isp = p.sessao.parceiro_isp || "—";
    if (ispMap[isp] && p.total > 0) {
      ispMap[isp].somaNota += p.nota;
      ispMap[isp].numNotas++;
    }
  });
  const porISP = Object.values(ispMap).map((i) => ({
    isp: i.isp,
    sessoes: i.sessoes,
    participantes: i.participantes,
    notaMedia: i.numNotas ? i.somaNota / i.numNotas : 0,
  })).sort((a, b) => b.participantes - a.participantes).slice(0, 10);

  // === POR PALESTRANTE (só admin) ===
  const palMap: Record<string, { nome: string; sessoes: number; participantes: number; somaNota: number; numNotas: number }> = {};
  (sessoes || []).forEach((s: any) => {
    const nome = s.palestrante?.nome || "—";
    if (!palMap[nome]) palMap[nome] = { nome, sessoes: 0, participantes: 0, somaNota: 0, numNotas: 0 };
    palMap[nome].sessoes++;
    palMap[nome].participantes += s.participantes.length;
  });
  participantesProcessed.forEach((p) => {
    const nome = p.sessao.palestrante?.nome || "—";
    if (palMap[nome] && p.total > 0) {
      palMap[nome].somaNota += p.nota;
      palMap[nome].numNotas++;
    }
  });
  const porPalestrante = Object.values(palMap).map((p) => ({
    nome: p.nome,
    sessoes: p.sessoes,
    participantes: p.participantes,
    notaMedia: p.numNotas ? p.somaNota / p.numNotas : 0,
  })).sort((a, b) => b.participantes - a.participantes);

  // === DISTRIBUIÇÃO DE NOTAS ===
  const faixas = [
    { faixa: "0-20%", min: 0, max: 20, cor: "#EF4444" },
    { faixa: "21-40%", min: 21, max: 40, cor: "#F97316" },
    { faixa: "41-60%", min: 41, max: 60, cor: "#F59E0B" },
    { faixa: "61-80%", min: 61, max: 80, cor: "#84CC16" },
    { faixa: "81-100%", min: 81, max: 100, cor: "#22C55E" },
  ];
  const distribuicaoNotas = faixas.map((f) => ({
    faixa: f.faixa,
    cor: f.cor,
    qtd: participantesProcessed.filter((p) => p.total > 0 && p.nota >= f.min && p.nota <= f.max).length,
  }));

  // === TOP PERGUNTAS MAIS ERRADAS ===
  const pergStats: Record<string, { acertos: number; total: number }> = {};
  participantesProcessed.forEach((p) => {
    const sess = p.sessao;
    const respMap = new Map<string, any>(sess.participantes.find((x: any) => x.respostas)?.respostas?.map((r: any) => [r.pergunta_id, r]) || []);
  });
  // Refaz com loop direto, mais simples:
  Object.keys(pergStats).forEach((k) => delete pergStats[k]);
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
  const topPerguntasErradas = Object.entries(pergStats)
    .filter(([, s]) => s.total >= 1)
    .map(([id, s]) => ({
      enunciado: pergMeta[id]?.enunciado || "",
      modulo: pergMeta[id]?.modulo || "",
      treinamento: pergMeta[id]?.treinamento || "",
      taxaAcerto: (s.acertos / s.total) * 100,
      total: s.total,
    }))
    .sort((a, b) => a.taxaAcerto - b.taxaAcerto)
    .slice(0, 5);

  // === Listas para filtros ===
  const { data: palestrantesList } = await supabase
    .from("usuarios").select("id, nome").eq("ativo", true).order("nome");
  const { data: treinamentosList } = await supabase
    .from("treinamentos").select("id, nome").eq("ativo", true).order("nome");
  const ispsSet = new Set<string>();
  (sessoes || []).forEach((s: any) => s.parceiro_isp && ispsSet.add(s.parceiro_isp));

  return {
    resumo, porPeriodo, porTreinamento, porISP, porPalestrante,
    distribuicaoNotas, topPerguntasErradas,
    filtros: {
      palestrantes: (palestrantesList || []) as any,
      treinamentos: (treinamentosList || []) as any,
      isps: Array.from(ispsSet).sort(),
    },
  };
}
