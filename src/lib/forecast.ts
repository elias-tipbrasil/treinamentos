import { createAdminClient } from "@/lib/supabase-admin";

export const OPERADORAS_FORECAST = ["Surf", "Telecall", "Arqia", "Valhalla"];
const OPERADORA_TO_PRODUTO: Record<string, string> = {
  Surf: "Surf Chip",
  Telecall: "Telecall Chip",
  Arqia: "Arqia Chip",
  Valhalla: "Valhalla Chip",
};
const MESES_NOME = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export interface ForecastParametros {
  operadora: string;
  lead_time_meses: number;
  gordura_seguranca: number;
  custo_unitario: number; // custo padrão, usado como valor inicial de cada mês
  pct_entrega: number;    // % padrão, usado como valor inicial de cada mês
  pct_60d: number;
}

export interface ForecastLinha {
  mes: string;
  label: string;
  historico: boolean;
  consumoProjetado: number;
  estoqueInicial: number | null;
  pedidoSugerido: number | null;
  pedidoReal: number;
  pedidoEhSugerido: boolean;
  chegada: number | null;
  estoqueFinal: number | null;
  custoUnitario: number;
  pctEntrega: number;
}

export interface FluxoCaixaLinha {
  mes: string;
  label: string;
  pedidoTotal: number;
  custoUnitario: number;
  custoTotal: number;
  pctEntrega: number;
  parcelaEntrega: number;
  parcela60d: number;
  desembolsoMes: number;
}

function mesKey(ano: number, mesIdx0: number) {
  return `${ano}-${String(mesIdx0 + 1).padStart(2, "0")}-01`;
}
function addMesesKey(ano: number, mesIdx0: number, n: number) {
  const d = new Date(ano, mesIdx0 + n, 1);
  return mesKey(d.getFullYear(), d.getMonth());
}

async function getEstoqueAtual(supabase: ReturnType<typeof createAdminClient>, operadora: string): Promise<number> {
  const nomeProduto = OPERADORA_TO_PRODUTO[operadora];
  const { data: produto } = await supabase.from("chip_produtos").select("id").eq("nome", nomeProduto).maybeSingle();
  if (!produto) return 0;
  const { data: movs } = await supabase.from("chip_estoque_mov").select("tipo, quantidade").eq("produto_id", produto.id);
  return (movs || []).reduce((s, m: any) => s + (m.tipo === "entrada" ? m.quantidade : -m.quantidade), 0);
}

export async function getForecastParametros(): Promise<ForecastParametros[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("chip_forecast_parametros").select("*").order("operadora");
  return data || [];
}

export async function salvarParametros(operadora: string, campos: Partial<ForecastParametros>) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("chip_forecast_parametros").update(campos).eq("operadora", operadora);
  if (error) console.error("Falha ao salvar parametros forecast:", error.message);
  return error;
}

export async function salvarMensal(
  operadora: string,
  mes: string,
  campos: { consumo_projetado?: number; pedido_real?: number | null; custo_unitario?: number; pct_entrega?: number }
) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("chip_forecast_mensal").upsert({ operadora, mes, ...campos }, { onConflict: "operadora,mes" });
  if (error) console.error("Falha ao salvar mensal forecast:", error.message);
  return error;
}

export async function getForecastOperadora(operadora: string, ano: number): Promise<{ parametros: ForecastParametros; linhas: ForecastLinha[] }> {
  const supabase = createAdminClient();

  const { data: paramRow } = await supabase.from("chip_forecast_parametros").select("*").eq("operadora", operadora).maybeSingle();
  const parametros: ForecastParametros = paramRow || {
    operadora, lead_time_meses: 2, gordura_seguranca: 0, custo_unitario: 0, pct_entrega: 0.5, pct_60d: 0.5,
  };

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtualIdx = hoje.getMonth();

  const desde = addMesesKey(ano, 0, -parametros.lead_time_meses);
  const ate = mesKey(ano, 11);

  const { data: mensalRows } = await supabase
    .from("chip_forecast_mensal")
    .select("mes, consumo_projetado, pedido_real, custo_unitario, pct_entrega")
    .eq("operadora", operadora)
    .gte("mes", desde)
    .lte("mes", ate);

  const mensalPorMes = new Map<string, { consumo_projetado: number; pedido_real: number | null; custo_unitario: number | null; pct_entrega: number | null }>();
  for (const r of mensalRows || []) mensalPorMes.set(r.mes, r as any);

  const estoqueAtualReal = await getEstoqueAtual(supabase, operadora);

  const linhas: ForecastLinha[] = [];
  const pedidoRealPorMes = new Map<string, number>();
  const estoqueFinalPorMes = new Map<string, number>();

  for (let i = 0; i < 12; i++) {
    const key = mesKey(ano, i);
    const registro = mensalPorMes.get(key);
    const consumoProjetado = registro?.consumo_projetado || 0;
    const custoUnitario = registro?.custo_unitario ?? parametros.custo_unitario;
    const pctEntrega = registro?.pct_entrega ?? parametros.pct_entrega;

    const ehHistorico = ano < anoAtual || (ano === anoAtual && i < mesAtualIdx);
    const ehAncora = ano === anoAtual && i === mesAtualIdx;

    if (ehHistorico) {
      const pedidoEhSugerido = registro?.pedido_real == null;
      linhas.push({
        mes: key, label: MESES_NOME[i], historico: true,
        consumoProjetado, estoqueInicial: null, pedidoSugerido: null,
        pedidoReal: registro?.pedido_real ?? 0, pedidoEhSugerido,
        chegada: null, estoqueFinal: null, custoUnitario, pctEntrega,
      });
      continue;
    }

    const estoqueInicial = ehAncora
      ? estoqueAtualReal
      : (estoqueFinalPorMes.get(addMesesKey(ano, i, -1)) ?? 0);

    const dataOrigemKey = addMesesKey(ano, i, -parametros.lead_time_meses);
    const registroOrigem = mensalPorMes.get(dataOrigemKey);
    const chegada = pedidoRealPorMes.get(dataOrigemKey) ?? registroOrigem?.pedido_real ?? 0;

    const estoqueFinal = estoqueInicial + chegada - consumoProjetado;
    const pedidoSugerido = Math.max(0, consumoProjetado + parametros.gordura_seguranca - estoqueFinal);
    const pedidoEhSugerido = registro?.pedido_real == null;
    const pedidoReal = pedidoEhSugerido ? pedidoSugerido : (registro!.pedido_real as number);

    pedidoRealPorMes.set(key, pedidoReal);
    estoqueFinalPorMes.set(key, estoqueFinal);

    linhas.push({
      mes: key, label: MESES_NOME[i], historico: false,
      consumoProjetado, estoqueInicial, pedidoSugerido, pedidoReal, pedidoEhSugerido,
      chegada, estoqueFinal, custoUnitario, pctEntrega,
    });
  }

  return { parametros, linhas };
}

export async function getFluxoCaixa(operadora: string, ano: number): Promise<FluxoCaixaLinha[]> {
  const { linhas: ls } = await getForecastOperadora(operadora, ano);

  const linhas: FluxoCaixaLinha[] = ls.map((l) => ({
    mes: l.mes,
    label: l.label,
    pedidoTotal: l.pedidoReal,
    custoUnitario: l.custoUnitario,
    custoTotal: l.pedidoReal * l.custoUnitario,
    pctEntrega: l.pctEntrega,
    parcelaEntrega: 0,
    parcela60d: 0,
    desembolsoMes: 0,
  }));

  for (let i = 0; i < linhas.length; i++) {
    const anterior = linhas[i];
    if (i + 1 < linhas.length) linhas[i + 1].parcelaEntrega += anterior.custoTotal * anterior.pctEntrega;
    if (i + 2 < linhas.length) linhas[i + 2].parcela60d += anterior.custoTotal * (1 - anterior.pctEntrega);
  }
  for (const l of linhas) l.desembolsoMes = l.parcelaEntrega + l.parcela60d;

  return linhas;
}
