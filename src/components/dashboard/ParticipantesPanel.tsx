import type { DashboardData } from "@/lib/dashboard/data";

export default function ParticipantesPanel({ participantes }: { participantes: DashboardData["participantes"] }) {
  if (!participantes?.length) return null;
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 mt-6">
      <div className="mb-4">
        <div className="font-display text-lg">Respostas por participante</div>
        <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">
          {participantes.length} participante(s) no filtro atual
        </div>
      </div>
      <div className="space-y-2">
        {participantes.map((p) => (
          <details key={p.id} className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
            <summary className="cursor-pointer px-4 py-3 flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden">
              <span className="text-sm font-medium min-w-0 truncate">
                {p.nome}
                <span className="text-xs text-[var(--text-muted)]"> · {p.isp} · {p.treinamento}</span>
              </span>
              <span className={`shrink-0 font-condensed font-bold text-sm ${p.nota >= 70 ? "text-green-400" : p.nota >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                {p.nota.toFixed(0)}% · {p.acertos}/{p.total}
              </span>
            </summary>
            <div className="px-4 pb-4 pt-3 border-t border-[var(--border)] space-y-2">
              {p.respostas.map((r, i) => (
                <div key={i} className="text-xs">
                  <p className="text-[var(--text-muted)] mb-0.5">{r.enunciado}</p>
                  <p className={`text-sm ${r.correta === true ? "text-green-400" : r.correta === false ? "text-red-400" : "text-white"}`}>
                    {r.resposta || "— sem resposta"}{r.correta === true ? " ✓" : r.correta === false ? " ✗" : ""}
                  </p>
                </div>
              ))}
              {p.respostas.length === 0 && <p className="text-xs text-[var(--text-muted)]">Sem respostas</p>}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
