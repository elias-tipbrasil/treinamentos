"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUTOS } from "@/lib/kickoff-slides";

interface Props {
  initial?: { id: string; nome_cliente: string; produtos: string[]; observacoes?: string | null };
}

export default function KickoffForm({ initial }: Props) {
  const router = useRouter();
  const [nome, setNome] = useState(initial?.nome_cliente || "");
  const [produtos, setProdutos] = useState<string[]>(initial?.produtos || []);
  const [obs, setObs] = useState(initial?.observacoes || "");
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setProdutos((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!nome.trim() || produtos.length === 0) {
      alert("Informe o nome do cliente e selecione ao menos 1 produto");
      return;
    }
    setSaving(true);
    const payload = { nome_cliente: nome.trim(), produtos, observacoes: obs.trim() || null };
    const res = initial
      ? await fetch(`/api/kickoffs/${initial.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/kickoffs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.erro || "Erro ao salvar");
      setSaving(false);
      return;
    }
    router.push("/painel/kickoff");
    router.refresh();
  };

  return (
    <form onSubmit={salvar} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 space-y-6">
      <div>
        <label className="block font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">
          Nome do cliente / parceiro
        </label>
        <input
          required
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: NetMax Telecom"
          className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]"
        />
      </div>

      <div>
        <label className="block font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-3">
          Produtos contratados
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          {PRODUTOS.map((p) => {
            const selected = produtos.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={`px-5 py-4 rounded-xl border text-left transition-all ${
                  selected
                    ? "bg-[var(--tip-red)]/10 border-[var(--tip-red)]"
                    : "bg-[var(--bg-input)] border-[var(--border-strong)] hover:border-[var(--text-muted)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selected ? "bg-[var(--tip-red)] border-[var(--tip-red)]" : "border-[var(--border-strong)]"
                  }`}>
                    {selected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="text-base font-medium">{p.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">
          Observações (opcional)
        </label>
        <textarea
          rows={3}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Notas internas, não aparecem na apresentação"
          className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)] resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white px-6 py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg"
        >
          {saving ? "Salvando..." : initial ? "Salvar alterações" : "Criar Kickoff"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/painel/kickoff")}
          className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-white px-6 py-3 font-condensed text-sm tracking-[1.3px] uppercase rounded-lg"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
