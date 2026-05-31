"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KickoffActions({ id }: { id: string }) {
  const router = useRouter();

  const excluir = async () => {
    if (!confirm("Excluir este kickoff?\n\nEsta ação não pode ser desfeita.")) return;
    const res = await fetch(`/api/kickoffs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.erro || "Erro ao excluir");
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/painel/kickoff/${id}/apresentar`}
        target="_blank"
        className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-4 py-2 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg"
      >
        Apresentar →
      </Link>
      <a
        href={`/api/kickoffs/${id}/pdf`}
        target="_blank"
        className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] hover:border-[var(--tip-red)] text-white px-3 py-2 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg"
        title="Exportar PDF"
      >
        PDF
      </a>
      <Link
        href={`/painel/kickoff/${id}`}
        className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] hover:border-white text-white px-3 py-2 font-condensed text-xs tracking-[1.3px] uppercase rounded-lg"
      >
        Editar
      </Link>
      <button
        onClick={excluir}
        title="Excluir kickoff"
        className="text-[var(--text-muted)] hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
