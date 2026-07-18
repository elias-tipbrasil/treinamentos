"use client";
import { useEffect, useState } from "react";

const usd = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD" });
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function PtaxCalculator() {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [valorUsd, setValorUsd] = useState("0,86");
  const [quantidade, setQuantidade] = useState("");
  const [pctDeposito, setPctDeposito] = useState("50");

  const [ptax, setPtax] = useState<{ dataCotacao: string; cotacaoCompra: number; cotacaoVenda: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const buscarPtax = async (d: string) => {
    setLoading(true);
    setErro("");
    setPtax(null);
    const r = await fetch(`/api/chip/ptax?data=${d}`);
    const j = await r.json().catch(() => ({ erro: "Falha na consulta" }));
    if (r.ok) setPtax(j);
    else setErro(j.erro || "Não foi possível obter a PTAX");
    setLoading(false);
  };

  useEffect(() => { buscarPtax(data); }, []);

  const valorUsdNum = Number(valorUsd.replace(",", ".")) || 0;
  const quantidadeNum = Number(quantidade) || 0;
  const pctNum = Math.min(100, Math.max(0, Number(pctDeposito) || 0)) / 100;

  const valorUnitarioReal = ptax ? valorUsdNum * ptax.cotacaoCompra : 0;
  const valorTotalGeral = valorUnitarioReal * quantidadeNum;
  const depositoParcela1 = valorTotalGeral * pctNum;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="font-display text-base mb-3">Calculadora PTAX</h3>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Data de referência">
            <input
              type="date"
              value={data}
              onChange={(e) => { setData(e.target.value); buscarPtax(e.target.value); }}
              className={inputCls}
            />
          </Field>

          <Field label="Valor do produto (USD)">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valorUsd}
              onChange={(e) => setValorUsd(e.target.value.replace(/[^\d.,]/g, ""))}
              className={inputCls}
            />
          </Field>

          <Field label="Quantidade unitária">
            <input
              type="number"
              min={0}
              placeholder="0"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="% do depósito (parcela 1)">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={pctDeposito}
                onChange={(e) => setPctDeposito(e.target.value)}
                className={inputCls}
              />
              <span className="text-[var(--text-muted)] text-xs">%</span>
            </div>
          </Field>
        </div>

        <div className="mt-3 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface-2)] px-4 py-2.5 flex items-center justify-between">
          {loading && <p className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)]">Consultando Banco Central...</p>}
          {!loading && erro && <p className="text-red-400 text-xs">{erro}</p>}
          {!loading && ptax && (
            <>
              <span className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">
                PTAX compra · {new Date(ptax.dataCotacao + "T00:00:00").toLocaleDateString("pt-BR")}
              </span>
              <span className="flex items-baseline gap-3">
                <span className="font-display text-lg">{ptax.cotacaoCompra.toLocaleString("pt-BR", { minimumFractionDigits: 4 })}</span>
                <span className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">venda {ptax.cotacaoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 4 })}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <ResultCard label="Valor unitário (USD → R$)" value={brl(valorUnitarioReal)} sub={`${usd(valorUsdNum)} × ${ptax ? ptax.cotacaoCompra.toLocaleString("pt-BR", { minimumFractionDigits: 4 }) : "—"}`} />
        <ResultCard label="Valor total" value={brl(valorTotalGeral)} sub={quantidadeNum ? `${quantidadeNum.toLocaleString("pt-BR")} unidades` : "informe a quantidade"} destaque />
        <ResultCard label={`Depósito · parcela 1 (${pctDeposito || 0}%)`} value={brl(depositoParcela1)} destaque cor="#818cf8" />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mb-2">Dados para depósito</div>
          <div className="text-sm font-medium">VALID Soluções S.A</div>
          <div className="text-xs text-[var(--text-muted)] mb-2">CNPJ 33.113.309/0001-47</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div><span className="block text-[var(--text-muted)]">Banco</span><span className="font-medium">Itaú</span></div>
            <div><span className="block text-[var(--text-muted)]">Agência</span><span className="font-medium">0204</span></div>
            <div><span className="block text-[var(--text-muted)]">C. corrente</span><span className="font-medium">54840-8</span></div>
          </div>
        </div>
      </div>

      <p className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)] leading-relaxed px-1">
        Cotação PTAX de fechamento do dia útil anterior à data selecionada, conforme{" "}
        <a href="https://www.bcb.gov.br/estabilidadefinanceira/historicocotacoes" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-[var(--tip-red-bright)]">
          histórico de cotações do Banco Central
        </a>.
      </p>
    </div>
  );
}

const inputCls = "w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--tip-red)] text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)] mb-1">{label}</label>
      {children}
    </div>
  );
}

function ResultCard({ label, value, sub, destaque, cor }: { label: string; value: string; sub?: string; destaque?: boolean; cor?: string }) {
  return (
    <div className={`rounded-xl p-4 border ${destaque ? "border-[var(--tip-red)]/40 bg-[var(--tip-red-glow)]" : "border-[var(--border)] bg-[var(--bg-surface)]"}`}>
      <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mb-1.5">{label}</div>
      <div className="font-display text-xl" style={cor ? { color: cor } : undefined}>{value}</div>
      {sub && <div className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)] mt-1.5">{sub}</div>}
    </div>
  );
}
