"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props { treinamentos: { id: string; nome: string }[] }

export default function NovaSessaoForm({ treinamentos }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    treinamento_id: treinamentos[0]?.id || "",
    parceiro_isp: "",
    data_hora: new Date().toISOString().slice(0, 16),
    qtd_esperada: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErro("");
    const res = await fetch("/api/sessoes/criar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, qtd_esperada: form.qtd_esperada ? Number(form.qtd_esperada) : null }),
    });
    const j = await res.json();
    if (res.ok) router.push(`/painel/sessao/${j.id}`);
    else { setErro(j.erro || "Erro ao criar sessão"); setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
      <Campo label="Treinamento">
        <select required value={form.treinamento_id}
          onChange={(e) => setForm({ ...form, treinamento_id: e.target.value })}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]">
          {treinamentos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      </Campo>

      <Campo label="Parceiro (ISP)">
        <input required type="text" value={form.parceiro_isp}
          onChange={(e) => setForm({ ...form, parceiro_isp: e.target.value })}
          placeholder="Ex: NetMax Telecom"
          className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]" />
      </Campo>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Data e Hora">
          <input required type="datetime-local" value={form.data_hora}
            onChange={(e) => setForm({ ...form, data_hora: e.target.value })}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]" />
        </Campo>
        <Campo label="Qtd Pessoas (opcional)">
          <input type="number" min={1} value={form.qtd_esperada}
            onChange={(e) => setForm({ ...form, qtd_esperada: e.target.value })}
            placeholder="Ex: 25"
            className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]" />
        </Campo>
      </div>

      {erro && <p className="text-red-400 text-sm">{erro}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all">
        {loading ? "Criando..." : "Criar Sessão"}
      </button>
    </form>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">{label}</label>
      {children}
    </div>
  );
}
