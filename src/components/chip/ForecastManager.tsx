"use client";
import { useEffect, useState } from "react";

const OPERADORAS = ["Surf", "Telecall", "Arqia", "Valhalla"];
const CORES_OP: Record<string, string> = {
  Surf: "#818cf8",
  Telecall: "#FF1A2E",
  Arqia: "#fbbf24",
  Valhalla: "#ffffff",
};

interface Parametros {
  operadora: string;
  lead_time_meses: number;
  gordura_seguranca: number;
  custo_unitario: number;
  pct_entrega: number;
  pct_60d: number;
}
interface Linha {
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
interface FluxoLinha {
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

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const num = (v: number) => v.toLocaleString("pt-BR");

export default function ForecastManager() {
  const [operadora, setOperadora] = useState("Surf");
  const [ano, setAno] = useState(new Date().getFullYear());
  const [parametros, setParametros] = useState<Parametros | null>(null);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [fluxoCaixa, setFluxoCaixa] = useState<FluxoLinha[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (op: string, a: number) => {
    setLoading(true);
    const r = await fetch(`/api/chip/forecast?operadora=${op}&ano=${a}`);
    const j = await r.json().catch(() => null);
    if (j) {
      setParametros(j.parametros);
      setLinhas(j.linhas || []);
      setFluxoCaixa(j.fluxoCaixa || []);
    }
    setLoading(false);
  };
  useEffect(() => { load(operadora, ano); }, [operadora, ano]);

  const salvarParametro = async (campo: keyof Parametros, valor: number) => {
    if (!parametros) return;
    setParametros({ ...parametros, [campo]: valor });
    await fetch("/api/chip/forecast", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "parametros", operadora, [campo]: valor }),
    });
    load(operadora, ano);
  };

  const salvarMensal = async (mes: string, campos: Record<string, number | null>) => {
    const r = await fetch("/api/chip/forecast", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "mensal", operadora, mes, ...campos }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({ erro: "Falha ao salvar" }));
      alert(`Não salvou: ${j.erro}`);
    }
    load(operadora, ano);
  };

  const anoAtual = new Date().getFullYear();
  const anosOpcoes = [anoAtual - 1, anoAtual, anoAtual + 1, anoAtual + 2];

  return (
    <div>
      <div className="flex gap-1 mb-6">
        {OPERADORAS.map((o) => (
          <button
            key={o}
            onClick={() => setOperadora(o)}
            className={`px-4 py-2 rounded-full font-condensed text-xs font-bold tracking-[1.3px] uppercase transition-colors ${
              operadora === o ? "bg-[var(--tip-red)] text-white" : "bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      {parametros && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 mb-6">
          <h3 className="font-display text-lg mb-4">Parâmetros · {operadora}</h3>
          <div className="grid sm:grid-cols-2 gap-3 max-w-md">
            <ParamField label="Lead time (meses)" value={parametros.lead_time_meses} onSave={(v) => salvarParametro("lead_time_meses", v)} />
            <ParamField label="Gordura segurança (un.)" value={parametros.gordura_seguranca} onSave={(v) => salvarParametro("gordura_seguranca", v)} />
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-display text-lg" style={{ color: CORES_OP[operadora] }}>Projeção de estoque e pedidos</h3>
          <div className="flex items-center gap-3">
            {loading && <span className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">Carregando...</span>}
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-[var(--bg-input)] border border-[var(--border-strong)] text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-[var(--tip-red)]"
            >
              {anosOpcoes.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-condensed tracking-[1.5px] uppercase text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="text-left px-5 py-2.5 font-normal">Mês</th>
                <th className="text-right px-4 py-2.5 font-normal">Consumo projetado</th>
                <th className="text-right px-4 py-2.5 font-normal">Estoque inicial</th>
                <th className="text-right px-4 py-2.5 font-normal">Pedido sugerido</th>
                <th className="text-right px-4 py-2.5 font-normal text-white">Pedido real</th>
                <th className="text-right px-4 py-2.5 font-normal">Chegada</th>
                <th className="text-right px-5 py-2.5 font-normal">Estoque final</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, i) => (
                <tr key={l.mes} className={`${i % 2 === 1 ? "bg-white/[0.015]" : ""} ${l.historico ? "opacity-50" : ""} border-b border-[var(--border)]/50`}>
                  <td className="px-5 py-2.5 font-medium text-white/90">{l.label}</td>
                  <td className="text-right px-4 py-1">
                    <InlineNumber value={l.consumoProjetado} onSave={(v) => salvarMensal(l.mes, { consumo_projetado: v })} />
                  </td>
                  <td className={`text-right px-4 py-2.5 tabular-nums ${l.estoqueInicial !== null && l.estoqueInicial < 0 ? "text-red-400" : "text-[var(--text-muted)]"}`}>
                    {l.estoqueInicial === null ? "—" : num(l.estoqueInicial)}
                  </td>
                  <td className="text-right px-4 py-2.5 tabular-nums text-[var(--text-muted)]">{l.pedidoSugerido === null ? "—" : num(l.pedidoSugerido)}</td>
                  <td className="text-right px-4 py-1">
                    <div className="flex items-center justify-end gap-1.5">
                      <InlineNumber value={l.pedidoReal} onSave={(v) => salvarMensal(l.mes, { pedido_real: v })} destaque={!l.pedidoEhSugerido} />
                      {!l.pedidoEhSugerido && (
                        <button onClick={() => salvarMensal(l.mes, { pedido_real: null })} title="Usar sugerido" className="text-[var(--text-muted)] hover:text-white text-[10px]">↺</button>
                      )}
                    </div>
                  </td>
                  <td className="text-right px-4 py-2.5 tabular-nums text-green-400/80">{l.chegada ? `+${num(l.chegada)}` : "—"}</td>
                  <td className={`text-right px-5 py-2.5 font-medium tabular-nums ${l.estoqueFinal !== null && l.estoqueFinal < 0 ? "text-red-400" : "text-white"}`}>
                    {l.estoqueFinal === null ? "—" : num(l.estoqueFinal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="font-display text-lg" style={{ color: CORES_OP[operadora] }}>Fluxo de caixa · pagamento editável</h3>
          <p className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)] mt-1">{operadora} · custo e forma de pagamento por mês</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-condensed tracking-[1.5px] uppercase text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="text-left px-5 py-2.5 font-normal">Mês</th>
                <th className="text-right px-4 py-2.5 font-normal">Pedido (un.)</th>
                <th className="text-right px-4 py-2.5 font-normal">Custo/chip (R$)</th>
                <th className="text-right px-4 py-2.5 font-normal">Custo total</th>
                <th className="text-right px-4 py-2.5 font-normal">% na entrega</th>
                <th className="text-right px-4 py-2.5 font-normal">Parcela do mês</th>
                <th className="text-right px-4 py-2.5 font-normal">Parcela de 2m atrás</th>
                <th className="text-right px-5 py-2.5 font-normal text-white">Desembolso</th>
              </tr>
            </thead>
            <tbody>
              {fluxoCaixa.map((l, i) => (
                <tr key={l.mes} className={`${i % 2 === 1 ? "bg-white/[0.015]" : ""} border-b border-[var(--border)]/50`}>
                  <td className="px-5 py-2.5 font-medium text-white/90">{l.label}</td>
                  <td className="text-right px-4 py-2.5 tabular-nums text-[var(--text-muted)]">{num(l.pedidoTotal)}</td>
                  <td className="text-right px-4 py-1">
                    <InlineDecimal value={l.custoUnitario} onSave={(v) => salvarMensal(l.mes, { custo_unitario: v })} />
                  </td>
                  <td className="text-right px-4 py-2.5 tabular-nums text-[var(--text-muted)]">{brl(l.custoTotal)}</td>
                  <td className="text-right px-4 py-1">
                    <InlinePercent value={l.pctEntrega} onSave={(v) => salvarMensal(l.mes, { pct_entrega: v })} />
                  </td>
                  <td className="text-right px-4 py-2.5 tabular-nums text-[var(--text-muted)]">{l.parcelaEntrega ? brl(l.parcelaEntrega) : "—"}</td>
                  <td className="text-right px-4 py-2.5 tabular-nums text-[var(--text-muted)]">{l.parcela60d ? brl(l.parcela60d) : "—"}</td>
                  <td className="text-right px-5 py-2.5 font-display text-base">{brl(l.desembolsoMes)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--border-strong)] bg-[var(--bg-surface-2)]">
                <td className="px-5 py-3 font-display text-sm">Total período</td>
                <td className="text-right px-4 py-3 font-display text-sm tabular-nums">{num(fluxoCaixa.reduce((s, l) => s + l.pedidoTotal, 0))}</td>
                <td colSpan={2} className="text-right px-4 py-3 font-display text-sm tabular-nums">{brl(fluxoCaixa.reduce((s, l) => s + l.custoTotal, 0))}</td>
                <td colSpan={2}></td>
                <td className="text-right px-4 py-3"></td>
                <td className="text-right px-5 py-3 font-display text-base">{brl(fluxoCaixa.reduce((s, l) => s + l.desembolsoMes, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function ParamField({ label, value, onSave }: { label: string; value: number; onSave: (v: number) => void }) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  return (
    <div>
      <label className="block font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)] mb-1.5">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={v}
        onChange={(e) => setV(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={() => { const n = Number(v) || 0; if (n !== value) onSave(n); }}
        className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--tip-red)] text-sm"
      />
    </div>
  );
}

/* Campo numérico inline — mostra formatado (milhar) parado, vira edição em texto puro no foco */
function InlineNumber({ value, onSave, destaque }: { value: number; onSave: (v: number) => void; destaque?: boolean }) {
  const [editando, setEditando] = useState(false);
  const [v, setV] = useState(String(value));
  useEffect(() => { if (!editando) setV(String(value)); }, [value, editando]);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={editando ? v : value.toLocaleString("pt-BR")}
      onFocus={() => { setEditando(true); setV(String(value)); }}
      onChange={(e) => setV(e.target.value.replace(/[^\d]/g, ""))}
      onBlur={() => {
        setEditando(false);
        const n = Number(v) || 0;
        if (n !== value) onSave(n);
      }}
      className={`w-24 text-right bg-transparent border border-transparent hover:border-[var(--border-strong)] focus:border-[var(--tip-red)] rounded-md px-2 py-1.5 outline-none text-sm tabular-nums ${destaque ? "text-white font-medium" : "text-white/80"}`}
    />
  );
}

function InlineDecimal({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [editando, setEditando] = useState(false);
  const [v, setV] = useState(String(value));
  useEffect(() => { if (!editando) setV(String(value)); }, [value, editando]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={editando ? v : value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      onFocus={() => { setEditando(true); setV(String(value)); }}
      onChange={(e) => setV(e.target.value.replace(/[^\d.,]/g, ""))}
      onBlur={() => {
        setEditando(false);
        const n = Number(v.replace(",", ".")) || 0;
        if (n !== value) onSave(n);
      }}
      className="w-20 text-right bg-transparent border border-transparent hover:border-[var(--border-strong)] focus:border-[var(--tip-red)] rounded-md px-2 py-1.5 outline-none text-sm tabular-nums text-white/80"
    />
  );
}

function InlinePercent({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const pct = Math.round(value * 100);
  const [editando, setEditando] = useState(false);
  const [v, setV] = useState(String(pct));
  useEffect(() => { if (!editando) setV(String(pct)); }, [pct, editando]);

  return (
    <div className="flex items-center justify-end gap-1">
      <input
        type="text"
        inputMode="numeric"
        value={v}
        onFocus={() => setEditando(true)}
        onChange={(e) => setV(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={() => {
          setEditando(false);
          const n = Math.min(100, Math.max(0, Number(v) || 0));
          if (n !== pct) onSave(n / 100);
        }}
        className="w-12 text-right bg-transparent border border-transparent hover:border-[var(--border-strong)] focus:border-[var(--tip-red)] rounded-md px-2 py-1.5 outline-none text-sm tabular-nums text-white/80"
      />
      <span className="text-[var(--text-muted)] text-xs">%</span>
    </div>
  );
}
