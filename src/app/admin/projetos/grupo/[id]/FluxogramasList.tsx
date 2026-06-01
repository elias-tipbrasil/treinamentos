"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FluxogramasList({ fluxos }: { fluxos: any[] }) {
  const router = useRouter();

  const excluir = async (id: string, nome: string) => {
    if (!confirm(`Excluir o fluxograma "${nome}"?`)) return;
    const res = await fetch(`/api/admin/projetos/fluxogramas/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.erro || "Erro ao excluir");
      return;
    }
    router.refresh();
  };

  if (fluxos.length === 0) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">
        Nenhum fluxograma cadastrado neste grupo
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="divide-y divide-[var(--border)]">
        {fluxos.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--bg-surface-2)] transition-colors">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="font-display text-sm text-white">{f.nome}</span>
                <span className="text-[9px] tracking-[1.5px] uppercase text-[var(--text-muted)] bg-[var(--bg-surface-2)] border border-[var(--border)] px-1.5 py-0.5 rounded">
                  {f.tipo}
                </span>
                {!f.ativo && (
                  <span className="text-[9px] tracking-[1.5px] uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    Oculto
                  </span>
                )}
              </div>
              <div className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">
                /{f.slug}
              </div>
            </div>

            <Link
              href={`/admin/projetos/fluxograma/${f.id}`}
              className="text-[10px] tracking-[1.5px] uppercase text-[var(--tip-red)] hover:text-white px-2 py-1"
            >
              Editar
            </Link>

            <button
              onClick={() => excluir(f.id, f.nome)}
              className="text-[var(--text-muted)] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
