import { createAdminClient } from "@/lib/supabase-admin";

export interface ChipProduto {
  id: string;
  nome: string;
  operadora: string;
  tipo: string;
  ordem: number;
}

export async function getChipProdutos(tipos?: string[]): Promise<ChipProduto[]> {
  const supabase = createAdminClient();
  let q = supabase
    .from("chip_produtos")
    .select("id, nome, operadora, tipo, ordem")
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  if (tipos && tipos.length) q = q.in("tipo", tipos);
  const { data } = await q;
  return data || [];
}

export interface EstoqueDashboard {
  ano: number;
  anosDisponiveis: number[];
  operadoraFiltro: string; // "" = todas
  pedidosChip: number;
  pedidosEsim: number;
  entreguesChip: number;
  entreguesEsim: number;
  porOperadora: {
    operadora: string;
    produtos: { id: string; nome: string; tipo: string; estoque: number }[];
    totalEstoque: number;
  }[];
  estoqueTotalGeral: number;
  enviosChipPorMes: EnvioMesOperadora[];
  enviosEsimPorMes: EnvioMesOperadora[];
  enviosChipPorSemana: EnvioSemanaOperadora[];
  enviosEsimPorSemana: EnvioSemanaOperadora[];
  mesSemana: number;
  operadorasChipExibir: string[];
  operadorasEsimExibir: string[];
}

export interface EnvioMesOperadora {
  mes: number;
  label: string;
  porOperadora: Record<string, number>;
  total: number;
}

export interface EnvioSemanaOperadora {
  semana: number;
  porOperadora: Record<string, number>;
  total: number;
}

const MESES_LABEL = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const REDE_TO_OPERADORA: Record<string, string> = { Tim: "Surf", Vivo: "Telecall", Arqia: "Arqia", Valhalla: "Valhalla" };
const OPERADORA_TO_REDE: Record<string, string> = { Surf: "Tim", Telecall: "Vivo", Arqia: "Arqia", Valhalla: "Valhalla" };
export const OPERADORAS_CHIP = ["Surf", "Telecall", "Arqia", "Valhalla"];
export const OPERADORAS_ESIM = ["Surf", "Telecall", "Arqia"];

function montarMeses(operadoras: string[]): EnvioMesOperadora[] {
  return MESES_LABEL.map((label, i) => ({
    mes: i + 1,
    label,
    porOperadora: Object.fromEntries(operadoras.map((o) => [o, 0])),
    total: 0,
  }));
}

function montarSemanas(operadoras: string[]): EnvioSemanaOperadora[] {
  return Array.from({ length: 5 }, (_, i) => ({
    semana: i + 1,
    porOperadora: Object.fromEntries(operadoras.map((o) => [o, 0])),
    total: 0,
  }));
}

function faixaMes(ano: number, mes: number) {
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const fim = `${ano}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  return { inicio, fim };
}

async function getEnviosChipPorMes(supabase: ReturnType<typeof createAdminClient>, ano: number, operadoras: string[]): Promise<EnvioMesOperadora[]> {
  let q = supabase.from("chip_pedidos").select("data_envio, qtde_enviada, rede")
    .not("data_envio", "is", null).gte("data_envio", `${ano}-01-01`).lte("data_envio", `${ano}-12-31`);
  if (operadoras.length === 1) q = q.eq("rede", OPERADORA_TO_REDE[operadoras[0]]);
  const { data } = await q;

  const meses = montarMeses(operadoras);
  for (const r of data || []) {
    const mesIdx = new Date(r.data_envio + "T00:00:00").getMonth();
    const operadora = REDE_TO_OPERADORA[r.rede];
    if (!operadora || !operadoras.includes(operadora)) continue;
    const qtd = r.qtde_enviada || 0;
    meses[mesIdx].porOperadora[operadora] += qtd;
    meses[mesIdx].total += qtd;
  }
  return meses;
}

// e-sim não tem "qtde enviada" própria na origem — a quantidade contratada é
// considerada entregue na Data de Entrega.
async function getEnviosEsimPorMes(supabase: ReturnType<typeof createAdminClient>, ano: number, operadoras: string[]): Promise<EnvioMesOperadora[]> {
  let q = supabase.from("chip_esim_pedidos").select("data_entrega, qtde_contratada, operadora")
    .not("data_entrega", "is", null).gte("data_entrega", `${ano}-01-01`).lte("data_entrega", `${ano}-12-31`);
  if (operadoras.length === 1) q = q.eq("operadora", operadoras[0]);
  const { data } = await q;

  const meses = montarMeses(operadoras);
  for (const r of data || []) {
    const mesIdx = new Date(r.data_entrega + "T00:00:00").getMonth();
    const operadora = r.operadora;
    if (!operadoras.includes(operadora)) continue;
    const qtd = r.qtde_contratada || 0;
    meses[mesIdx].porOperadora[operadora] += qtd;
    meses[mesIdx].total += qtd;
  }
  return meses;
}

async function getEnviosChipPorSemana(supabase: ReturnType<typeof createAdminClient>, ano: number, mes: number, operadoras: string[]): Promise<EnvioSemanaOperadora[]> {
  const { inicio, fim } = faixaMes(ano, mes);
  let q = supabase.from("chip_pedidos").select("data_envio, qtde_enviada, rede")
    .not("data_envio", "is", null).gte("data_envio", inicio).lte("data_envio", fim);
  if (operadoras.length === 1) q = q.eq("rede", OPERADORA_TO_REDE[operadoras[0]]);
  const { data } = await q;

  const semanas = montarSemanas(operadoras);
  for (const r of data || []) {
    const dia = new Date(r.data_envio + "T00:00:00").getDate();
    const semanaIdx = Math.min(5, Math.ceil(dia / 7)) - 1;
    const operadora = REDE_TO_OPERADORA[r.rede];
    if (!operadora || !operadoras.includes(operadora)) continue;
    const qtd = r.qtde_enviada || 0;
    semanas[semanaIdx].porOperadora[operadora] += qtd;
    semanas[semanaIdx].total += qtd;
  }
  return semanas;
}

async function getEnviosEsimPorSemana(supabase: ReturnType<typeof createAdminClient>, ano: number, mes: number, operadoras: string[]): Promise<EnvioSemanaOperadora[]> {
  const { inicio, fim } = faixaMes(ano, mes);
  let q = supabase.from("chip_esim_pedidos").select("data_entrega, qtde_contratada, operadora")
    .not("data_entrega", "is", null).gte("data_entrega", inicio).lte("data_entrega", fim);
  if (operadoras.length === 1) q = q.eq("operadora", operadoras[0]);
  const { data } = await q;

  const semanas = montarSemanas(operadoras);
  for (const r of data || []) {
    const dia = new Date(r.data_entrega + "T00:00:00").getDate();
    const semanaIdx = Math.min(5, Math.ceil(dia / 7)) - 1;
    const operadora = r.operadora;
    if (!operadoras.includes(operadora)) continue;
    const qtd = r.qtde_contratada || 0;
    semanas[semanaIdx].porOperadora[operadora] += qtd;
    semanas[semanaIdx].total += qtd;
  }
  return semanas;
}

export async function getChipDashboard(ano: number, mesSemana?: number, operadoraFiltro?: string): Promise<EstoqueDashboard> {
  const supabase = createAdminClient();
  const filtro = operadoraFiltro || "";
  const produtos = await getChipProdutos(["chip", "esim"]);

  // Pedidos em {ano}: quantidade contratada, por Data de Entrada
  let qChip = supabase.from("chip_pedidos").select("qtde_contratada, rede")
    .gte("data_entrada", `${ano}-01-01`).lte("data_entrada", `${ano}-12-31`);
  if (filtro) qChip = qChip.eq("rede", OPERADORA_TO_REDE[filtro]);
  const { data: pedidosChipRows } = await qChip;
  const pedidosChip = (pedidosChipRows || []).reduce((s, r: any) => s + (r.qtde_contratada || 0), 0);

  let qEsimPedidos = supabase.from("chip_esim_pedidos").select("qtde_contratada, operadora")
    .gte("data_entrada", `${ano}-01-01`).lte("data_entrada", `${ano}-12-31`);
  if (filtro) qEsimPedidos = qEsimPedidos.eq("operadora", filtro);
  const { data: pedidosEsimRows } = await qEsimPedidos;
  const pedidosEsim = (!filtro || OPERADORAS_ESIM.includes(filtro))
    ? (pedidosEsimRows || []).reduce((s, r: any) => s + (r.qtde_contratada || 0), 0)
    : 0;

  // Entregues em {ano}: chip = enviado (Data de Envio) · e-sim = contratado (Data de Entrega)
  let qChipEnt = supabase.from("chip_pedidos").select("qtde_enviada, rede")
    .not("data_envio", "is", null).gte("data_envio", `${ano}-01-01`).lte("data_envio", `${ano}-12-31`);
  if (filtro) qChipEnt = qChipEnt.eq("rede", OPERADORA_TO_REDE[filtro]);
  const { data: entreguesChipRows } = await qChipEnt;
  const entreguesChip = (entreguesChipRows || []).reduce((s, r: any) => s + (r.qtde_enviada || 0), 0);

  let qEsimEnt = supabase.from("chip_esim_pedidos").select("qtde_contratada, operadora")
    .not("data_entrega", "is", null).gte("data_entrega", `${ano}-01-01`).lte("data_entrega", `${ano}-12-31`);
  if (filtro) qEsimEnt = qEsimEnt.eq("operadora", filtro);
  const { data: entreguesEsimRows } = await qEsimEnt;
  const entreguesEsim = (!filtro || OPERADORAS_ESIM.includes(filtro))
    ? (entreguesEsimRows || []).reduce((s, r: any) => s + (r.qtde_contratada || 0), 0)
    : 0;

  const { data: anosRows } = await supabase.from("chip_pedidos").select("data_entrada");
  const anosSet = new Set<number>((anosRows || []).map((r: any) => new Date(r.data_entrada).getFullYear()));
  anosSet.add(new Date().getFullYear());
  const anosDisponiveis = Array.from(anosSet).sort((a, b) => b - a);

  const { data: entradas } = await supabase.from("chip_estoque_mov").select("produto_id, tipo, quantidade");
  const saldoPorProduto = new Map<string, number>();
  for (const m of entradas || []) {
    const delta = m.tipo === "entrada" ? m.quantidade : -m.quantidade;
    saldoPorProduto.set(m.produto_id, (saldoPorProduto.get(m.produto_id) || 0) + delta);
  }

  const grupos = new Map<string, { operadora: string; produtos: any[]; totalEstoque: number }>();
  for (const p of produtos) {
    if (filtro && p.operadora !== filtro) continue;
    if (!grupos.has(p.operadora)) grupos.set(p.operadora, { operadora: p.operadora, produtos: [], totalEstoque: 0 });
    const estoque = saldoPorProduto.get(p.id) || 0;
    const g = grupos.get(p.operadora)!;
    g.produtos.push({ id: p.id, nome: p.nome, tipo: p.tipo, estoque });
    g.totalEstoque += estoque;
  }

  const porOperadora = Array.from(grupos.values());
  const estoqueTotalGeral = porOperadora.reduce((s, g) => s + g.totalEstoque, 0);

  const operadorasChipExibir = filtro ? [filtro] : OPERADORAS_CHIP;
  const operadorasEsimExibir = filtro ? (OPERADORAS_ESIM.includes(filtro) ? [filtro] : []) : OPERADORAS_ESIM;

  const mesAlvo = mesSemana || new Date().getMonth() + 1;
  const enviosChipPorMes = await getEnviosChipPorMes(supabase, ano, operadorasChipExibir);
  const enviosEsimPorMes = await getEnviosEsimPorMes(supabase, ano, operadorasEsimExibir);
  const enviosChipPorSemana = await getEnviosChipPorSemana(supabase, ano, mesAlvo, operadorasChipExibir);
  const enviosEsimPorSemana = await getEnviosEsimPorSemana(supabase, ano, mesAlvo, operadorasEsimExibir);

  return {
    ano, anosDisponiveis, operadoraFiltro: filtro,
    pedidosChip, pedidosEsim, entreguesChip, entreguesEsim,
    porOperadora, estoqueTotalGeral,
    enviosChipPorMes, enviosEsimPorMes, enviosChipPorSemana, enviosEsimPorSemana,
    mesSemana: mesAlvo, operadorasChipExibir, operadorasEsimExibir,
  };
}
