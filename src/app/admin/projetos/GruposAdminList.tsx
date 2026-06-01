"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GruposAdminList({ grupos }: { grupos: any[] }) {
  const router = useRouter();

  const excluir = async (id: string, nome: string) => {
    if (!confirm(`Excluir o grupo "${nome}"?\n\nTodos os fluxogramas dentro serão excluídos também.`)) return;
    const res = await fetch(`/api/admin/projetos/grupos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.erro || "Erro ao excluir");
      return;
    }
    router.refresh();
  };

  if (grupos.length === 0) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-12 text-center font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">
        Nenhum grupo cadastrado. Clique em "Novo grupo" para começar.
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="divide-y divide-[var(--border)]">
        {grupos.map((g) => {
          const count = g.projeto_fluxogramas?.[0]?.count || 0;
          return (
            <div key={g.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--bg-surface-2)] transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="font-display text-lg text-white">{g.nome}</span>
                  <span className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)] bg-[var(--bg-surface-2)] border border-[var(--border)] px-2 py-0.5 rounded">
                    {g.cor_tema} · {g.icone}
                  </span>
                  {!g.ativo && (
                    <span className="text-[10px] tracking-[1.5px] uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                      Oculto
                    </span>
                  )}
                </div>
                <div className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)]">
                  /{g.slug} · {count} {count === 1 ? "projeto" : "projetos"}
                </div>
              </div>

              <Link
                href={`/admin/projetos/grupo/${g.id}`}
                className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-4 py-2 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg"
              >
                Gerenciar →
              </Link>

              <button
                onClick={() => excluir(g.id, g.nome)}
                title="Excluir grupo"
                className="text-[var(--text-muted)] hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
