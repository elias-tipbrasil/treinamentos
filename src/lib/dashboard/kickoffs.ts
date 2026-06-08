import { createAdminClient } from "@/lib/supabase-admin";

export interface KickoffDashboardData {
  resumo: { total: number; encerrados: number; noShows: number; avaliados: number; notaMedia: number };
  porExecutivo: { nome: string; kickoffs: number; avaliados: number; noShows: number; notaMedia: number }[];
  lista: { id: string; cliente: string; produtos: string[]; executivo: string; entrou: string | null; nota: number | null; comentario: string | null; data: string; encerrado: boolean }[];
}

export async function buildKickoffDashboard(filtros: { inicio?: string; fim?: string }, scopeId?: string): Promise<KickoffDashboardData> {
  const supabase = createAdminClient();
  let q = supabase.from("kickoffs")
    .select("id, nome_cliente, produtos, criado_em, avaliacao_entrou, avaliacao_nota, avaliacao_comentario, encerrado_em, executivo:executivos(nome)");
  if (scopeId) q = q.eq("palestrante_id", scopeId);
  if (filtros.inicio) q = q.gte("criado_em", filtros.inicio);
  if (filtros.fim) q = q.lte("criado_em", filtros.fim + "T23:59:59");
  q = q.order("criado_em", { ascending: false });
  const { data } = await q;
  const ks: any[] = data || [];

  const encerrados = ks.filter((k) => k.encerrado_em);
  const noShows = encerrados.filter((k) => k.avaliacao_entrou === "no_show");
  const avaliados = encerrados.filter((k) => k.avaliacao_entrou === "sim" && k.avaliacao_nota != null);
  const notaMedia = avaliados.length ? avaliados.reduce((s, k) => s + (k.avaliacao_nota || 0), 0) / avaliados.length : 0;

  const exMap: Record<string, any> = {};
  encerrados.forEach((k) => {
    const nome = k.executivo?.nome || "—";
    if (!exMap[nome]) exMap[nome] = { nome, kickoffs: 0, avaliados: 0, noShows: 0, soma: 0 };
    exMap[nome].kickoffs++;
    if (k.avaliacao_entrou === "no_show") exMap[nome].noShows++;
    else if (k.avaliacao_nota != null) { exMap[nome].avaliados++; exMap[nome].soma += k.avaliacao_nota; }
  });
  const porExecutivo = Object.values(exMap).map((e: any) => ({
    nome: e.nome, kickoffs: e.kickoffs, avaliados: e.avaliados, noShows: e.noShows,
    notaMedia: e.avaliados ? e.soma / e.avaliados : 0,
  })).sort((a, b) => b.notaMedia - a.notaMedia);

  const lista = ks.map((k) => ({
    id: k.id, cliente: k.nome_cliente, produtos: k.produtos || [], executivo: k.executivo?.nome || "—",
    entrou: k.avaliacao_entrou, nota: k.avaliacao_nota, comentario: k.avaliacao_comentario,
    data: k.criado_em, encerrado: !!k.encerrado_em,
  }));

  return { resumo: { total: ks.length, encerrados: encerrados.length, noShows: noShows.length, avaliados: avaliados.length, notaMedia }, porExecutivo, lista };
}
