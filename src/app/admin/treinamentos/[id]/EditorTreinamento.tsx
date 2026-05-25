"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Alt { id: string; texto: string; correta: boolean; ordem: number }
interface Perg { id: string; enunciado: string; tipo: string; ordem: number; vale_nota: boolean; alternativas: Alt[] }
interface Mod { id: string; nome: string; ordem: number; tipo: string; perguntas: Perg[] }
interface Trein { id: string; nome: string; descricao: string | null }

export default function EditorTreinamento({ treinamento, modulosIniciais }: { treinamento: Trein; modulosIniciais: Mod[] }) {
  const router = useRouter();
  const [modulos] = useState<Mod[]>(modulosIniciais);
  const [novoModulo, setNovoModulo] = useState({ nome: "", tipo: "conhecimento" });
  const [showNovo, setShowNovo] = useState(false);

  const criarModulo = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/modulos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ treinamento_id: treinamento.id, ...novoModulo, ordem: modulos.length + 1 }),
    });
    setNovoModulo({ nome: "", tipo: "conhecimento" }); setShowNovo(false);
    router.refresh();
  };

  const excluirModulo = async (id: string) => {
    if (!confirm("Excluir este módulo e TODAS as perguntas e alternativas dele?\n\nEsta ação não pode ser desfeita.")) return;
    const res = await fetch(`/api/admin/modulos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.erro || "Não foi possível excluir o módulo.");
      return;
    }
    router.refresh();
  };

  return (
    <section className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
      <Link href="/admin/treinamentos" className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white mb-4 inline-block">← Treinamentos</Link>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">{treinamento.nome}</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">{treinamento.descricao || "Sem descrição"}</p>

      <div className="mb-6">
        {!showNovo ? (
          <button onClick={() => setShowNovo(true)}
            className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-5 py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg">
            + Novo Módulo
          </button>
        ) : (
          <form onSubmit={criarModulo} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 space-y-3">
            <input required type="text" value={novoModulo.nome} onChange={(e) => setNovoModulo({ ...novoModulo, nome: e.target.value })}
              placeholder="Nome do módulo" autoFocus
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]" />
            <select value={novoModulo.tipo} onChange={(e) => setNovoModulo({ ...novoModulo, tipo: e.target.value })}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]">
              <option value="conhecimento">Conhecimento (com gabarito)</option>
              <option value="feedback">Feedback (sem gabarito)</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-5 py-2.5 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg">Criar</button>
              <button type="button" onClick={() => setShowNovo(false)} className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-white px-5 py-2.5 font-condensed text-sm tracking-[1.3px] uppercase rounded-lg">Cancelar</button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-4">
        {modulos.map((m) => (
          <ModuloCard key={m.id} modulo={m} onExcluir={() => excluirModulo(m.id)} onChange={() => router.refresh()} />
        ))}
      </div>
    </section>
  );
}

function ModuloCard({ modulo, onExcluir, onChange }: { modulo: Mod; onExcluir: () => void; onChange: () => void }) {
  const [showNovaP, setShowNovaP] = useState(false);
  const [novaP, setNovaP] = useState({
    enunciado: "",
    tipo: modulo.tipo === "feedback" ? "escala" : "multipla_escolha",
    alternativas: ["", "", "", ""],
    correta: 0,
  });

  const salvarP = async (e: React.FormEvent) => {
    e.preventDefault();
    const alts = novaP.tipo === "multipla_escolha"
      ? novaP.alternativas.filter((a) => a.trim()).map((t, i) => ({ texto: t, correta: i === novaP.correta }))
      : [];
    await fetch("/api/admin/perguntas", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modulo_id: modulo.id, enunciado: novaP.enunciado, tipo: novaP.tipo,
        ordem: modulo.perguntas.length + 1, vale_nota: modulo.tipo === "conhecimento",
        alternativas: alts,
      }),
    });
    setNovaP({ enunciado: "", tipo: modulo.tipo === "feedback" ? "escala" : "multipla_escolha", alternativas: ["", "", "", ""], correta: 0 });
    setShowNovaP(false);
    onChange();
  };

  const excluirP = async (id: string) => {
    if (!confirm("Excluir esta pergunta?\n\nEsta ação não pode ser desfeita.")) return;
    const res = await fetch(`/api/admin/perguntas/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.erro || "Não foi possível excluir a pergunta.");
      return;
    }
    onChange();
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">
            Módulo {modulo.ordem} · {modulo.tipo === "feedback" ? "Feedback" : "Conhecimento"}
          </div>
          <div className="font-display text-2xl">{modulo.nome}</div>
          <div className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)] mt-1">{modulo.perguntas.length} pergunta(s)</div>
        </div>
        <button onClick={onExcluir} className="font-condensed text-xs tracking-[1.5px] uppercase text-red-400 hover:text-red-300">Excluir módulo</button>
      </div>

      <div className="space-y-2 mb-4">
        {modulo.perguntas.sort((a, b) => a.ordem - b.ordem).map((p) => (
          <div key={p.id} className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mb-1">
                  {p.ordem}. {p.tipo === "multipla_escolha" ? "Múltipla escolha" : p.tipo === "escala" ? "Escala 1-5" : "Texto longo"}
                </div>
                <div className="text-sm">{p.enunciado}</div>
                {p.tipo === "multipla_escolha" && (
                  <div className="mt-2 space-y-1">
                    {p.alternativas.sort((a, b) => a.ordem - b.ordem).map((a) => (
                      <div key={a.id} className={`text-xs ${a.correta ? "text-green-400" : "text-[var(--text-muted)]"}`}>
                        {a.correta && "✓ "}{a.texto}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => excluirP(p.id)} className="font-condensed text-[10px] tracking-[1.5px] uppercase text-red-400 hover:text-red-300">×</button>
            </div>
          </div>
        ))}
      </div>

      {!showNovaP ? (
        <button onClick={() => setShowNovaP(true)}
          className="w-full bg-[var(--bg-surface-2)] border border-dashed border-[var(--border-strong)] hover:border-[var(--tip-red)] text-[var(--text-muted)] hover:text-white py-3 font-condensed text-xs tracking-[1.5px] uppercase rounded-lg">
          + Adicionar pergunta
        </button>
      ) : (
        <form onSubmit={salvarP} className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-lg p-4 space-y-3">
          <textarea required value={novaP.enunciado} onChange={(e) => setNovaP({ ...novaP, enunciado: e.target.value })}
            placeholder="Enunciado da pergunta" rows={2} autoFocus
            className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 text-sm rounded-lg outline-none focus:border-[var(--tip-red)] resize-none" />

          <select value={novaP.tipo} onChange={(e) => setNovaP({ ...novaP, tipo: e.target.value })}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 text-sm rounded-lg outline-none focus:border-[var(--tip-red)]">
            <option value="multipla_escolha">Múltipla escolha</option>
            <option value="escala">Escala 1-5 (likert)</option>
            <option value="texto_longo">Texto longo</option>
          </select>

          {novaP.tipo === "multipla_escolha" && (
            <div className="space-y-2">
              <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">Alternativas (marque a correta)</div>
              {novaP.alternativas.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" checked={novaP.correta === i} onChange={() => setNovaP({ ...novaP, correta: i })}
                    className="accent-[var(--tip-red)]" />
                  <input type="text" value={a} onChange={(e) => {
                    const arr = [...novaP.alternativas]; arr[i] = e.target.value;
                    setNovaP({ ...novaP, alternativas: arr });
                  }} placeholder={`Alternativa ${i + 1}`}
                    className="flex-1 bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 text-sm rounded-lg outline-none focus:border-[var(--tip-red)]" />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-4 py-2 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg">Salvar</button>
            <button type="button" onClick={() => setShowNovaP(false)} className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-white px-4 py-2 font-condensed text-xs tracking-[1.3px] uppercase rounded-lg">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
