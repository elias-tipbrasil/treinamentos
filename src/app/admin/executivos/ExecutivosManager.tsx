"use client";
import { useEffect, useState } from "react";

interface Exec { id: string; nome: string; }

export default function ExecutivosManager() {
  const [execs, setExecs] = useState<Exec[]>([]);
  const [nome, setNome] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const r = await fetch("/api/executivos");
    const j = await r.json().catch(() => ({ executivos: [] }));
    setExecs(j.executivos || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!nome.trim() || saving) return;
    setSaving(true);
    const r = await fetch("/api/executivos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome: nome.trim() }) });
    if (r.ok) { setNome(""); await load(); }
    setSaving(false);
  };
  const remove = async (id: string) => {
    if (!confirm("Remover este executivo?")) return;
    await fetch(`/api/executivos?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
      <div className="flex gap-2 mb-6">
        <input value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Nome do executivo"
          className="flex-1 bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[var(--tip-red)]" />
        <button onClick={add} disabled={saving}
          className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white px-5 py-2.5 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg">Adicionar</button>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {execs.map((e) => (
          <div key={e.id} className="flex items-center justify-between py-3">
            <span className="text-sm">{e.nome}</span>
            <button onClick={() => remove(e.id)} className="text-[var(--text-muted)] hover:text-red-400 text-xs font-condensed tracking-[1.5px] uppercase">Remover</button>
          </div>
        ))}
        {execs.length === 0 && <p className="py-8 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Nenhum executivo cadastrado</p>}
      </div>
    </div>
  );
}
