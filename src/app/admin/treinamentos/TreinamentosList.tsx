"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface T { id: string; nome: string; descricao: string | null; ativo: boolean; modulos: { id: string }[] }

export default function TreinamentosList({ treinamentos }: { treinamentos: T[] }) {
  const router = useRouter();
  const [novoNome, setNovoNome] = useState("");
  const [novaDesc, setNovaDesc] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/treinamentos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNome, descricao: novaDesc }),
    });
    setNovoNome(""); setNovaDesc(""); setShow(false); setLoading(false);
    router.refresh();
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await fetch(`/api/admin/treinamentos/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo }),
    });
    router.refresh();
  };

  const excluir = async (id: string, nome: string) => {
    if (!confirm(`Excluir o treinamento "${nome}"?\n\nIsso apaga TODOS os módulos, perguntas e alternativas dele. As sessões já realizadas e os certificados emitidos NÃO são afetados.\n\nEsta ação não pode ser desfeita.`)) return;
    const res = await fetch(`/api/admin/treinamentos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.erro || "Não foi possível excluir. Verifique se não há sessões usando este treinamento.");
      return;
    }
    router.refresh();
  };

  return (
    <>
      <div className="mb-6">
        {!show ? (
          <button onClick={() => setShow(true)}
            className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-5 py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg">
            + Novo Treinamento
          </button>
        ) : (
          <form onSubmit={criar} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 space-y-3">
            <input required type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Nome do treinamento" autoFocus
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]" />
            <textarea value={novaDesc} onChange={(e) => setNovaDesc(e.target.value)}
              placeholder="Descrição (opcional)" rows={2}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)] resize-none" />
            <div className="flex gap-2">
              <button type="submit" disabled={loading}
                className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white px-5 py-2.5 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg">
                {loading ? "Criando..." : "Criar"}
              </button>
              <button type="button" onClick={() => setShow(false)}
                className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-white px-5 py-2.5 font-condensed text-sm tracking-[1.3px] uppercase rounded-lg">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-3">
        {treinamentos.map((t) => (
          <div key={t.id} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="font-display text-xl mb-1">{t.nome}</div>
              {t.descricao && <p className="text-sm text-[var(--text-muted)] mb-2">{t.descricao}</p>}
              <div className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)]">
                {t.modulos.length} módulo{t.modulos.length !== 1 ? "s" : ""} · {t.ativo ? <span className="text-green-400">Ativo</span> : <span className="text-red-400">Inativo</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => toggleAtivo(t.id, t.ativo)}
                className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)] hover:text-white">
                {t.ativo ? "Desativar" : "Ativar"}
              </button>
              <Link href={`/admin/treinamentos/${t.id}`}
                className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] hover:border-[var(--tip-red)] text-white px-4 py-2 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg">
                Editar →
              </Link>
              <button onClick={() => excluir(t.id, t.nome)} title="Excluir treinamento"
                className="text-[var(--text-muted)] hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
