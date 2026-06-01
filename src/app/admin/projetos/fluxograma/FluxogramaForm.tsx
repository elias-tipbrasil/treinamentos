"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  grupoId: string;
  initial?: {
    id: string;
    nome: string;
    slug: string;
    descricao: string | null;
    tipo: "miro" | "pdf";
    miro_iframe: string | null;
    pdf_url: string | null;
    ordem: number;
    ativo: boolean;
  };
}

export default function FluxogramaForm({ grupoId, initial }: Props) {
  const router = useRouter();
  const [nome, setNome] = useState(initial?.nome || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [descricao, setDescricao] = useState(initial?.descricao || "");
  const [tipo, setTipo] = useState<"miro" | "pdf">(initial?.tipo || "miro");
  const [miroIframe, setMiroIframe] = useState(initial?.miro_iframe || "");
  const [pdfUrl, setPdfUrl] = useState(initial?.pdf_url || "");
  const [ordem, setOrdem] = useState(initial?.ordem ?? 99);
  const [ativo, setAtivo] = useState(initial?.ativo ?? true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onNomeChange = (v: string) => {
    setNome(v);
    if (!initial) setSlug(slugify(v));
  };

  const uploadPdf = async (file: File) => {
    if (uploading) return;
    if (file.type !== "application/pdf") { alert("Apenas arquivos PDF"); return; }
    if (file.size > 10 * 1024 * 1024) { alert("Máximo 10MB"); return; }
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/projetos/upload-pdf", { method: "POST", body: form });
    setUploading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.erro || "Erro no upload");
      return;
    }
    const { url } = await res.json();
    setPdfUrl(url);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!nome.trim() || !slug.trim()) { alert("Nome e slug são obrigatórios"); return; }
    if (tipo === "miro" && !miroIframe.trim()) { alert("Cole o iframe do Miro"); return; }
    if (tipo === "pdf" && !pdfUrl) { alert("Faça upload do PDF"); return; }

    setSaving(true);
    const payload = {
      grupo_id: grupoId,
      nome: nome.trim(),
      slug: slug.trim(),
      descricao: descricao.trim() || null,
      tipo,
      miro_iframe: tipo === "miro" ? miroIframe.trim() : null,
      pdf_url: tipo === "pdf" ? pdfUrl : null,
      ordem,
      ativo,
    };
    const res = initial
      ? await fetch(`/api/admin/projetos/fluxogramas/${initial.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/projetos/fluxogramas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.erro || "Erro ao salvar");
      setSaving(false);
      return;
    }
    router.push(`/admin/projetos/grupo/${grupoId}`);
  };

  return (
    <form onSubmit={salvar} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
      <Field label="Nome do fluxograma">
        <input required value={nome} onChange={(e) => onNomeChange(e.target.value)} className="input" placeholder="MVNO Vivo · Chip" />
      </Field>
      <Field label="Slug (URL)">
        <input required value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className="input" placeholder="mvno-vivo-chip" />
      </Field>
      <Field label="Descrição">
        <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input" placeholder="Fluxo de ativação · ~80 dias" />
      </Field>

      <Field label="Tipo">
        <div className="flex gap-2">
          {(["miro", "pdf"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTipo(t)}
              className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                tipo === t ? "bg-[var(--tip-red)]/10 border-[var(--tip-red)] text-white" : "bg-[var(--bg-input)] border-[var(--border-strong)] text-[var(--text-muted)]"
              }`}>
              {t === "miro" ? "Iframe do Miro" : "Upload de PDF"}
            </button>
          ))}
        </div>
      </Field>

      {tipo === "miro" && (
        <Field label="Cole o iframe completo do Miro">
          <textarea
            value={miroIframe}
            onChange={(e) => setMiroIframe(e.target.value)}
            className="input"
            rows={4}
            placeholder='<iframe width="768" height="496" src="https://miro.com/app/live-embed/..."></iframe>'
          />
          <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed">
            No Miro: Compartilhar → Inserir → marcar "Frame específico" se quiser travar a vista → Copiar código.
            ⚠️ O board precisa estar como "Qualquer pessoa com o link pode visualizar".
          </p>
        </Field>
      )}

      {tipo === "pdf" && (
        <Field label="PDF do fluxograma">
          {pdfUrl ? (
            <div className="p-3 bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white truncate">PDF carregado</div>
                <a href={pdfUrl} target="_blank" rel="noopener" className="text-xs text-[var(--tip-red-bright)] truncate block">Abrir em nova aba ↗</a>
              </div>
              <button type="button" onClick={() => setPdfUrl("")} className="text-xs text-[var(--text-muted)] hover:text-red-400">Trocar</button>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-[var(--border-strong)] hover:border-[var(--tip-red)] rounded-lg p-6 text-center cursor-pointer transition-colors">
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPdf(e.target.files[0])} />
              <div className="text-sm text-[var(--text-muted)]">
                {uploading ? "Enviando..." : "Clique para enviar PDF (máx 10MB)"}
              </div>
            </label>
          )}
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Ordem">
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
        <button type="submit" disabled={saving || uploading}
          className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white px-6 py-2.5 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg">
          {saving ? "Salvando..." : initial ? "Salvar" : "Criar fluxograma"}
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
          font-family: inherit;
        }
        .input:focus { border-color: var(--tip-red); }
        textarea.input { resize: vertical; font-family: monospace; font-size: 12px; }
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
