"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Exec { id: string; nome: string; }

export default function KickoffActions({ id, encerrado, nota, entrou }: { id: string; encerrado?: boolean; nota?: number | null; entrou?: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [execs, setExecs] = useState<Exec[]>([]);
  const [execId, setExecId] = useState("");
  const [novo, setNovo] = useState("");
  const [ent, setEnt] = useState<"sim" | "no_show">("sim");
  const [n, setN] = useState(5);
  const [coment, setComent] = useState("");
  const [saving, setSaving] = useState(false);

  const abrir = async () => {
    setOpen(true);
    const r = await fetch("/api/executivos");
    const j = await r.json().catch(() => ({ executivos: [] }));
    setExecs(j.executivos || []);
  };
  const addExec = async () => {
    if (!novo.trim()) return;
    const r = await fetch("/api/executivos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome: novo.trim() }) });
    const j = await r.json().catch(() => ({}));
    if (j.id) { setExecs((e) => [...e, { id: j.id, nome: novo.trim() }]); setExecId(j.id); setNovo(""); }
  };
  const encerrar = async () => {
    if (!execId) { alert("Selecione o executivo"); return; }
    setSaving(true);
    const res = await fetch(`/api/kickoffs/${id}/encerrar`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ executivo_id: execId, entrou: ent, nota: ent === "sim" ? n : null, comentario: coment.trim() || null }),
    });
    if (!res.ok) { const j = await res.json().catch(() => ({})); alert(j.erro || "Erro"); setSaving(false); return; }
    setOpen(false); setSaving(false); router.refresh();
  };
  const excluir = async () => {
    if (!confirm("Excluir este kickoff?\n\nEsta ação não pode ser desfeita.")) return;
    const res = await fetch(`/api/kickoffs/${id}`, { method: "DELETE" });
    if (!res.ok) { const j = await res.json().catch(() => ({})); alert(j.erro || "Erro ao excluir"); return; }
    router.refresh();
  };

  const Lbl = ({ children }: { children: React.ReactNode }) => (
    <label className="block font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mb-2">{children}</label>
  );

  return (
    <div className="flex items-center gap-2">
      <Link href={`/painel/kickoff/${id}/apresentar`} target="_blank"
        className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-4 py-2 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg">Apresentar →</Link>
      <button onClick={abrir}
        className={`px-3 py-2 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg border ${encerrado ? "border-green-500/40 text-green-400 hover:bg-green-500/10" : "border-[var(--border-strong)] text-white hover:border-white"}`}>
        {encerrado ? "Reavaliar" : "Encerrar"}
      </button>
      <Link href={`/painel/kickoff/${id}`} className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] hover:border-white text-white px-3 py-2 font-condensed text-xs tracking-[1.3px] uppercase rounded-lg">Editar</Link>
      <button onClick={excluir} title="Excluir kickoff" className="text-[var(--text-muted)] hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-2xl mb-5">Encerrar Kickoff</h3>

            <div className="mb-4">
              <Lbl>Executivo de contas</Lbl>
              <select value={execId} onChange={(e) => setExecId(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2.5 rounded-lg outline-none focus:border-[var(--tip-red)]">
                <option value="">Selecione...</option>
                {execs.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
              <div className="flex gap-2 mt-2">
                <input value={novo} onChange={(e) => setNovo(e.target.value)} placeholder="+ novo executivo"
                  className="flex-1 bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 text-sm rounded-lg outline-none focus:border-[var(--tip-red)]" />
                <button onClick={addExec} className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-white px-3 py-2 text-xs rounded-lg">Add</button>
              </div>
            </div>

            <div className="mb-4">
              <Lbl>Entrou no Kickoff?</Lbl>
              <div className="flex gap-2">
                {(["sim", "no_show"] as const).map((v) => (
                  <button key={v} onClick={() => setEnt(v)}
                    className={`flex-1 py-2.5 rounded-lg border font-condensed text-xs font-bold tracking-[1px] uppercase ${ent === v ? "bg-[var(--tip-red)]/10 border-[var(--tip-red)] text-white" : "border-[var(--border-strong)] text-[var(--text-muted)]"}`}>
                    {v === "sim" ? "Sim" : "No Show"}
                  </button>
                ))}
              </div>
            </div>

            {ent === "sim" && (
              <div className="mb-4">
                <Lbl>Nota da apresentação (0–5)</Lbl>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map((v) => (
                    <button key={v} onClick={() => setN(v)}
                      className={`w-10 h-10 rounded-lg border font-display text-lg ${n === v ? "bg-[var(--tip-red)] border-[var(--tip-red)] text-white" : "border-[var(--border-strong)] text-[var(--text-muted)]"}`}>{v}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <Lbl>Comentário (opcional)</Lbl>
              <textarea rows={3} value={coment} onChange={(e) => setComent(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 text-sm rounded-lg outline-none focus:border-[var(--tip-red)] resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={encerrar} disabled={saving}
                className="flex-1 bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg">
                {saving ? "Salvando..." : "Encerrar Kickoff"}
              </button>
              <button onClick={() => setOpen(false)} className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-white px-5 py-3 font-condensed text-sm tracking-[1.3px] uppercase rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
