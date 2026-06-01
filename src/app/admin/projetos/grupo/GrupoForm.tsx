"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMAS_OPTIONS, ICONES_OPTIONS, getTema, ICONES } from "@/lib/projeto-temas";

interface Props {
  initial?: {
    id: string;
    nome: string;
    slug: string;
    descricao: string | null;
    cor_tema: string;
    icone: string;
    ordem: number;
    ativo: boolean;
  };
}

export default function GrupoForm({ initial }: Props) {
  const router = useRouter();
  const [nome, setNome] = useState(initial?.nome || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [descricao, setDescricao] = useState(initial?.descricao || "");
  const [cor, setCor] = useState(initial?.cor_tema || "vermelho");
  const [icone, setIcone] = useState(initial?.icone || "grid");
  const [ordem, setOrdem] = useState(initial?.ordem ?? 99);
  const [ativo, setAtivo] = useState(initial?.ativo ?? true);
  const [saving, setSaving] = useState(false);

  const onNomeChange = (v: string) => {
    setNome(v);
    if (!initial) {
      setSlug(slugify(v));
    }
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!nome.trim() || !slug.trim()) { alert("Nome e slug são obrigatórios"); return; }
    setSaving(true);
    const payload = { nome: nome.trim(), slug: slug.trim(), descricao: descricao.trim() || null, cor_tema: cor, icone, ordem, ativo };
    const res = initial
      ? await fetch(`/api/admin/projetos/grupos/${initial.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/projetos/grupos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.erro || "Erro ao salvar");
      setSaving(false);
      return;
    }
    if (!initial) {
      router.push("/admin/projetos");
    } else {
      router.refresh();
      setSaving(false);
    }
  };

  const tema = getTema(cor);
  const iconePath = ICONES[icone] || ICONES.grid;

  return (
    <form onSubmit={salvar} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
      {/* Preview tile */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] mb-2"
        style={{ aspectRatio: "16/9", background: tema.gradient }}
      >
        <div className="pointer-events-none absolute top-1/2 right-[-30px] -translate-y-1/2 opacity-20">
          <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            {iconePath.split(/\s+(?=[MmLlHhVvCcSsQqTtAaZz])/).map((d, i) => <path key={i} d={d} />)}
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <div className="text-[10px] tracking-[0.3em] uppercase text-white/60 mb-1">Grupo</div>
          <h3 className="font-display text-2xl">{nome || "Nome do grupo"}</h3>
        </div>
      </div>

      <Field label="Nome">
        <input required value={nome} onChange={(e) => onNomeChange(e.target.value)} className="input" placeholder="MVNO" />
      </Field>
      <Field label="Slug (URL)">
        <input required value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className="input" placeholder="mvno" />
      </Field>
      <Field label="Descrição">
        <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input" placeholder="Operação móvel sobre Vivo e TIM..." />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Cor do tile">
          <select value={cor} onChange={(e) => setCor(e.target.value)} className="input">
            {TEMAS_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Ícone">
          <select value={icone} onChange={(e) => setIcone(e.target.value)} className="input">
            {ICONES_OPTIONS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Ordem (menor = primeiro)">
          <input type="number" value={ordem} onChange={(e) => setOrdem(parseInt(e.target.value) || 0)} className="input" />
        </Field>
        <Field label="Status">
          <select value={ativo ? "1" : "0"} onChange={(e) => setAtivo(e.target.value === "1")} className="input">
            <option value="1">Ativo</option>
            <option value="0">Oculto</option>
          </select>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white px-6 py-2.5 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg">
          {saving ? "Salvando..." : initial ? "Salvar" : "Criar grupo"}
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-strong);
          color: white;
          padding: 9px 12px;
          border-radius: 8px;
          outline: none;
          font-size: 13px;
        }
        .input:focus { border-color: var(--tip-red); }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
