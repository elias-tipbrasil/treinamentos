"use client";
import type { KickoffDashboardData } from "@/lib/dashboard/kickoffs";
import { PRODUTOS } from "@/lib/kickoff-slides";

const L: Record<string, string> = Object.fromEntries(PRODUTOS.map((p) => [p.id, p.label]));

export default function KickoffDashboard({ data }: { data?: KickoffDashboardData }) {
  if (!data) return null;
  const { resumo, porExecutivo, lista } = data;
  return (
    <>
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <Kpi label="Kickoffs" value={resumo.total} />
        <Kpi label="Encerrados" value={resumo.encerrados} />
        <Kpi label="Avaliados" value={resumo.avaliados} />
        <Kpi label="No Show" value={resumo.noShows} />
        <Kpi label="Nota média" value={`${resumo.notaMedia.toFixed(1)}/5`} />
      </div>

      <Card title="Nota por executivo">
        <div className="space-y-3">
          {porExecutivo.map((e) => (
            <div key={e.nome} className="flex items-center gap-3 text-sm">
              <span className="w-44 truncate">{e.nome}</span>
              <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-surface-2)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(e.notaMedia / 5) * 100}%`, background: e.notaMedia >= 4 ? "#22c55e" : e.notaMedia >= 3 ? "#eab308" : "#ef4444" }} />
              </div>
              <span className="w-32 text-right text-[var(--text-muted)] text-xs">{e.notaMedia.toFixed(1)}/5 · {e.kickoffs} kick. · {e.noShows} NS</span>
            </div>
          ))}
          {porExecutivo.length === 0 && <p className="py-6 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Nenhum kickoff encerrado</p>}
        </div>
      </Card>

      <Card title="Kickoffs" className="mt-6">
        <div className="divide-y divide-[var(--border)]">
          {lista.map((k) => (
            <div key={k.id} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{k.cliente}</div>
                  <div className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">
                    {(k.produtos || []).map((p) => L[p] || p).join(" · ")} · {new Date(k.data).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {k.encerrado ? (
                    k.entrou === "no_show"
                      ? <span className="font-condensed text-xs font-bold tracking-[1px] uppercase text-yellow-400">No Show</span>
                      : <span className={`font-display text-xl ${(k.nota || 0) >= 4 ? "text-green-400" : (k.nota || 0) >= 3 ? "text-yellow-400" : "text-red-400"}`}>{k.nota}/5</span>
                  ) : <span className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">Em aberto</span>}
                  <div className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">{k.executivo}</div>
                </div>
              </div>
              {k.comentario && <p className="text-xs text-[var(--text-muted)] mt-1 italic">“{k.comentario}”</p>}
            </div>
          ))}
          {lista.length === 0 && <p className="py-8 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Nenhum kickoff</p>}
        </div>
      </Card>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: any }) {
  return <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4"><div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">{label}</div><div className="font-display text-3xl">{value}</div></div>;
}
function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return <div className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 ${className}`}><div className="font-display text-lg mb-4">{title}</div>{children}</div>;
}
