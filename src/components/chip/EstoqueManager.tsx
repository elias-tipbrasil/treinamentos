"use client";
import { useEffect, useState } from "react";
import type { ChipProduto } from "@/lib/chip";

interface Mov {
  id: string;
  produto_id: string;
  data: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  observacao: string | null;
  chip_produtos: { nome: string; operadora: string } | null;
}
interface Saldo extends ChipProduto { saldo: number }

export default function EstoqueManager({ produtos, grupo = "chip" }: { produtos: ChipProduto[]; grupo?: "chip" | "insumo" }) {
  const [movs, setMovs] = useState<Mov[]>([]);
  const [saldos, setSaldos] = useState<Saldo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [produtoId, setProdutoId] = useState(produtos[0]?.id || "");
  const [tipo, setTipo] = useState<"entrada" | "saida">("saida");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [quantidade, setQuantidade] = useState("");
  const [observacao, setObservacao] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await fetch(`/api/chip/estoque?grupo=${grupo}`);
    const j = await r.json().catch(() => ({ movimentacoes: [], saldos: [] }));
    setMovs(j.movimentacoes || []);
    setSaldos(j.saldos || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!produtoId || !quantidade || saving) return;
    setSaving(true);
    const r = await fetch("/api/chip/estoque", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produto_id: produtoId, data, tipo, quantidade, observacao }),
    });
    if (r.ok) {
      setQuantidade("");
      setObservacao("");
      await load();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Remover esta movimentação?")) return;
    await fetch(`/api/chip/estoque?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 h-fit">
        <h3 className="font-display text-lg mb-5">Lançar movimentação</h3>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTipo("entrada")}
            className={`flex-1 py-2 rounded-lg font-condensed text-xs font-bold tracking-[1.3px] uppercase border ${tipo === "entrada" ? "bg-green-500/15 border-green-500 text-green-400" : "border-[var(--border-strong)] text-[var(--text-muted)]"}`}
          >
            Entrada
          </button>
          <button
            onClick={() => setTipo("saida")}
            className={`flex-1 py-2 rounded-lg font-condensed text-xs font-bold tracking-[1.3px] uppercase border ${tipo === "saida" ? "bg-red-500/15 border-red-500 text-red-400" : "border-[var(--border-strong)] text-[var(--text-muted)]"}`}
          >
            Saída
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Produto">
            <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} className={inputCls}>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>{grupo === "insumo" ? p.nome : `${p.operadora} · ${p.nome}`}</option>
              ))}
            </select>
          </Field>
          <Field label="Data">
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Quantidade">
            <input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="0" className={inputCls} />
          </Field>
          <Field label="Observação (opcional)">
            <input value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex: envio parceiro X" className={inputCls} />
          </Field>
          <button
            onClick={add}
            disabled={saving || !quantidade}
            className="w-full mt-2 bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white px-5 py-2.5 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg"
          >
            Lançar
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)]">
            <span className="font-display text-lg">Saldo atual</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-[var(--border)]">
            {saldos.map((s) => (
              <div key={s.id} className="bg-[var(--bg-surface)] px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm">{s.nome}</div>
                  <div className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">{s.operadora}</div>
                </div>
                <span className={`font-display text-xl ${s.saldo < 0 ? "text-red-400" : ""}`}>{s.saldo.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)]">
            <span className="font-display text-lg">Movimentações recentes</span>
          </div>
          <div className="divide-y divide-[var(--border)] max-h-[420px] overflow-y-auto">
            {loading && <p className="py-8 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Carregando...</p>}
            {!loading && movs.length === 0 && (
              <p className="py-10 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Nenhuma movimentação</p>
            )}
            {movs.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{m.chip_produtos?.nome || "—"}</div>
                  <div className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">
                    {new Date(m.data + "T00:00:00").toLocaleDateString("pt-BR")}
                    {m.observacao ? ` · ${m.observacao}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`font-display text-lg ${m.tipo === "entrada" ? "text-green-400" : "text-red-400"}`}>
                    {m.tipo === "entrada" ? "+" : "−"}{m.quantidade.toLocaleString("pt-BR")}
                  </span>
                  <button onClick={() => remove(m.id)} className="text-[var(--text-muted)] hover:text-red-400 text-xs font-condensed tracking-[1.5px] uppercase">Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3.5 py-2.5 rounded-lg outline-none focus:border-[var(--tip-red)] text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}
