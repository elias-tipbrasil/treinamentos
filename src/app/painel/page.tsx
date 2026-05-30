import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PainelHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = createAdminClient();
  const { data: sessoes } = await supabase
    .from("sessoes")
    .select("id, pin, parceiro_isp, data_hora, status, treinamento:treinamentos(nome)")
    .eq("palestrante_id", user.id)
    .order("criada_em", { ascending: false })
    .limit(50);

  const sessoesList = (sessoes || []) as any[];
  const ativas = sessoesList.filter((s) => s.status === "ativa").length;
  const total = sessoesList.length;
  const agora = new Date();
  const proximas = sessoesList.filter((s) => new Date(s.data_hora) >= agora || s.status === "ativa");
  const passadas = sessoesList.filter((s) => new Date(s.data_hora) < agora && s.status !== "ativa");

  return (
    <section className="max-w-6xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">SESSÕES</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
        Gerencie suas execuções de treinamento
      </p>

      <div className="mb-8 flex justify-end">
        <Link
          href="/painel/nova-sessao"
          className="inline-flex items-center gap-2 bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-5 py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all"
        >
          + Nova Sessão
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <KpiCard label="Sessões ativas" value={ativas} highlight />
        <KpiCard label="Total no histórico" value={total} />
        <KpiCard label="Treinamentos realizados" value={passadas.length} />
      </div>

      <SessoesBlock titulo="Próximas e em andamento" sessoes={proximas} vazia="Nenhuma sessão programada" />

      {passadas.length > 0 && (
        <div className="mt-8">
          <SessoesBlock titulo="Histórico" sessoes={passadas} vazia="" />
        </div>
      )}
    </section>
  );
}

function KpiCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
      <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">{label}</div>
      <div className={`font-display text-4xl ${highlight ? "text-[var(--tip-red)]" : "text-white"}`}>{value}</div>
    </div>
  );
}

function SessoesBlock({ titulo, sessoes, vazia }: { titulo: string; sessoes: any[]; vazia: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <div className="font-condensed text-xs tracking-[2.5px] uppercase text-[var(--text-muted)]">{titulo}</div>
        <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">
          {sessoes.length} sessão{sessoes.length !== 1 ? "ões" : ""}
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {sessoes.length === 0 ? (
          <div className="p-12 text-center font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">
            {vazia}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {sessoes.map((s) => (
              <Link
                key={s.id}
                href={`/painel/sessao/${s.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--bg-surface-2)] transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-display text-lg tracking-widest text-[var(--tip-red)] bg-[var(--bg-surface-2)] border border-[var(--border)] px-3 py-0.5 rounded">
                      {s.pin}
                    </span>
                    <span className="font-display text-base text-white">{s.treinamento?.nome}</span>
                  </div>
                  <div className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)]">
                    {s.parceiro_isp} ·{" "}
                    {new Date(s.data_hora).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <StatusBadge status={s.status} />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--tip-red)] group-hover:translate-x-0.5 transition-all flex-shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ativa") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-condensed text-[11px] tracking-[1.5px] uppercase text-green-400 bg-green-500/10 border border-green-500/30 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
        Ativa
      </span>
    );
  }
  if (status === "encerrada") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full font-condensed text-[11px] tracking-[1.5px] uppercase text-[var(--text-muted)] bg-[var(--bg-surface-2)] border border-[var(--border)] flex-shrink-0">
        Encerrada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full font-condensed text-[11px] tracking-[1.5px] uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 flex-shrink-0">
      {status}
    </span>
  );
}
