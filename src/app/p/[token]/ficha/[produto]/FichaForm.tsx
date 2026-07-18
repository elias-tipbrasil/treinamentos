"use client";
import { useState } from "react";
import type { FichaSchema } from "@/lib/fichas";

type Outra = { produto: string; label: string; respostas: Record<string, any> };

export default function FichaForm({ token, produto, label, schema, inicial, outras, concluida }: {
  token: string; produto: string; label: string; schema: FichaSchema;
  inicial: Record<string, any> | null; outras: Outra[]; concluida: boolean;
}) {
  const [v, setV] = useState<Record<string, any>>(inicial || {});
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"form" | "concluida">(concluida ? "concluida" : "form");

  const set = (id: string, val: any) => setV((s) => ({ ...s, [id]: val }));

  const todosIds = schema.secoes.flatMap((s) => s.campos.map((c) => c.id));
  const copiarDe = (o: Outra) => {
    setV((cur) => {
      const novo = { ...cur };
      todosIds.forEach((id) => {
        if (id === "declaracao") return;
        if (o.respostas[id] !== undefined && o.respostas[id] !== "") novo[id] = o.respostas[id];
      });
      return novo;
    });
  };

  const enviar = async () => {
    for (const sec of schema.secoes)
      for (const c of sec.campos)
        if (c.obrigatorio && (c.tipo === "checkbox" ? !v[c.id] : !String(v[c.id] ?? "").trim())) {
          alert(`Preencha: ${c.tipo === "checkbox" ? "a confirmação" : c.label}`);
          return;
        }
    setSaving(true);
    const res = await fetch(`/api/p/${token}/ficha`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ produto, respostas: v }) });
    setSaving(false);
    if (res.ok) setView("concluida");
    else alert("Erro ao enviar. Tente novamente.");
  };

  const inputType: Record<string, string> = { texto: "text", numero: "number", email: "email", telefone: "tel", data: "date", cep: "text", uf: "text" };

  if (view === "concluida") return (
    <Shell label={label}>
      <div className="fk-done">
        <div className="fk-check">✓</div>
        <h2>Ficha concluída</h2>
        <p>Recebemos seus dados. Você pode alterar quando precisar.</p>
        <button className="fk-alter" onClick={() => setView("form")}>Alterar respostas</button>
      </div>
    </Shell>
  );

  return (
    <Shell label={label}>
      <p className="fk-eyebrow">Pós Kickoff · Ficha</p>
      <h1>{schema.titulo}</h1>
      {schema.subtitulo && <p className="fk-sub">{schema.subtitulo}</p>}

      {outras.length > 0 && (
        <div className="fk-copy">
          <span>Copiar dados de:</span>
          {outras.map((o) => <button key={o.produto} onClick={() => copiarDe(o)}>{o.label}</button>)}
        </div>
      )}

      {schema.secoes.map((sec, si) => (
        <div className="fk-sec" key={si}>
          <div className="fk-sec-h"><span className="fk-dot" /><h2>{sec.titulo}</h2></div>
          {sec.campos.map((c) => (
            <div className="fk-field" key={c.id}>
              {c.tipo === "checkbox" ? (
                <label className="fk-declare">
                  <input type="checkbox" checked={!!v[c.id]} onChange={(e) => set(c.id, e.target.checked)} />
                  <span>{c.label}</span>
                </label>
              ) : (
                <>
                  <label>{c.label}{c.obrigatorio && <span className="fk-req">*</span>}</label>
                  {c.tipo === "texto_longo"
                    ? <textarea value={v[c.id] || ""} onChange={(e) => set(c.id, e.target.value)} />
                    : <input type={inputType[c.tipo] || "text"} maxLength={c.maxLength}
                        inputMode={c.tipo === "cep" || c.tipo === "numero" ? "numeric" : undefined}
                        value={v[c.id] || ""} onChange={(e) => set(c.id, e.target.value)} />}
                  {c.hint && <div className="fk-hint">{c.hint}</div>}
                  {c.lgpd && <div className="fk-lgpd">{c.lgpd}</div>}
                </>
              )}
            </div>
          ))}
        </div>
      ))}

      <button className="fk-submit" onClick={enviar} disabled={saving}>{saving ? "Enviando..." : concluida ? "Salvar alterações" : "Enviar ficha"}</button>
    </Shell>
  );
}

function Shell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "auto", zIndex: 50, background: "#000" }}>
      <style>{CSS}</style>
      <div className="fk-top"><div className="fk-brand"><b>TIP</b> BRASIL</div><div className="fk-cli">Ficha · {label}</div></div>
      <div className="fk-wrap">{children}</div>
    </div>
  );
}

const CSS = `
  .fk-top{padding:20px 24px;border-bottom:.5px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:space-between;font-family:-apple-system,"Inter",system-ui,sans-serif;color:#fff}
  .fk-brand{font-weight:700;letter-spacing:-.02em;font-size:15px}.fk-brand b{color:#FF1A2E}
  .fk-cli{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.55)}
  .fk-wrap{max-width:720px;margin:0 auto;padding:56px 24px 96px;font-family:-apple-system,"Inter",system-ui,sans-serif;color:#fff}
  .fk-eyebrow{font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:#FF1A2E;font-weight:600;margin-bottom:16px}
  .fk-wrap h1{font-size:clamp(32px,5vw,50px);line-height:.95;font-weight:800;letter-spacing:-.04em}
  .fk-sub{margin-top:16px;font-size:16px;color:rgba(255,255,255,.55);max-width:48ch}
  .fk-copy{margin-top:28px;background:#0c0c0c;border:.5px solid rgba(255,255,255,.1);border-radius:16px;padding:16px 18px;display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  .fk-copy span{font-size:13px;color:rgba(255,255,255,.55)}
  .fk-copy button{background:#1a1a1a;border:.5px solid rgba(255,255,255,.16);color:#fff;font:inherit;font-size:12.5px;padding:8px 14px;border-radius:100px;cursor:pointer}
  .fk-copy button:hover{border-color:#E60012}
  .fk-sec{margin-top:28px;background:#0c0c0c;border:.5px solid rgba(255,255,255,.1);border-radius:22px;padding:28px}
  .fk-sec-h{display:flex;align-items:center;gap:10px;margin-bottom:20px}
  .fk-dot{width:8px;height:8px;border-radius:50%;background:#FF1A2E}
  .fk-sec-h h2{font-size:17px;font-weight:600;letter-spacing:-.02em}
  .fk-field{margin-bottom:18px}.fk-field:last-child{margin-bottom:0}
  .fk-field label{display:block;font-size:13px;font-weight:600;margin-bottom:8px}
  .fk-req{color:#FF1A2E;margin-left:3px}
  .fk-field input,.fk-field textarea{width:100%;background:#111;border:.5px solid rgba(255,255,255,.16);color:#fff;font:inherit;font-size:15px;padding:13px 15px;border-radius:12px;outline:none}
  .fk-field input:focus,.fk-field textarea:focus{border-color:#E60012}
  .fk-field textarea{min-height:90px;resize:vertical}
  .fk-hint{font-size:12px;color:rgba(255,255,255,.38);margin-top:7px;line-height:1.5}
  .fk-lgpd{font-size:11.5px;color:rgba(255,255,255,.38);margin-top:8px;line-height:1.6;border-left:2px solid rgba(255,255,255,.16);padding-left:12px}
  .fk-declare{display:flex;gap:14px;align-items:flex-start;cursor:pointer}
  .fk-declare input{width:22px;height:22px;flex-shrink:0;margin-top:2px;accent-color:#E60012}
  .fk-declare span{font-size:13.5px;color:rgba(255,255,255,.55);line-height:1.6}
  .fk-submit{margin-top:30px;width:100%;background:#E60012;color:#fff;border:0;cursor:pointer;font:inherit;font-weight:600;font-size:16px;padding:17px;border-radius:100px}
  .fk-submit:hover{background:#FF1A2E}.fk-submit:disabled{opacity:.5}
  .fk-done{text-align:center;padding:80px 0}
  .fk-check{width:64px;height:64px;border-radius:50%;background:#22c55e;color:#000;font-size:32px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
  .fk-done h2{font-size:32px;font-weight:800;letter-spacing:-.03em}
  .fk-done p{margin-top:12px;color:rgba(255,255,255,.55);max-width:40ch;margin:12px auto 0}
  .fk-alter{margin-top:28px;background:transparent;color:#fff;border:.5px solid rgba(255,255,255,.25);font:inherit;font-weight:600;font-size:15px;padding:13px 28px;border-radius:100px;cursor:pointer}
  .fk-alter:hover{border-color:#fff}
`;
