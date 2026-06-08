import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import KickoffActions from "./KickoffActions";
import { PRODUTOS } from "@/lib/kickoff-slides";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = Object.fromEntries(PRODUTOS.map((p) => [p.id, p.label]));

export default async function KickoffsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = createAdminClient();
  const { data: kickoffs } = await supabase
    .from("kickoffs")
    .select("id, nome_cliente, produtos, criado_em, avaliacao_entrou, avaliacao_nota, encerrado_em")
    .eq("palestrante_id", user.id)
    .order("criado_em", { ascending: false });

  return (
    <section className="max-w-6xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">KICKOFF</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">Apresentações de boas-vindas personalizadas por cliente</p>

      <div className="mb-8 flex justify-end">
        <Link href="/painel/kickoff/novo" className="inline-flex items-center gap-2 bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-5 py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all">+ Novo Kickoff</Link>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {!kickoffs || kickoffs.length === 0 ? (
          <div className="p-12 text-center font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">Nenhum kickoff criado ainda</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {kickoffs.map((k: any) => (
              <div key={k.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--bg-surface-2)] transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="font-display text-xl text-white">{k.nome_cliente}</div>
                    {k.encerrado_em && (
                      <span className={`font-condensed text-[10px] font-bold tracking-[1.5px] uppercase px-2 py-1 rounded-full ${k.avaliacao_entrou === "no_show" ? "bg-yellow-500/15 text-yellow-400" : "bg-green-500/15 text-green-400"}`}>
                        {k.avaliacao_entrou === "no_show" ? "No Show" : `Nota ${k.avaliacao_nota ?? "—"}/5`}
                      </span>
                    )}
                  </div>
                  <div className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)]">
                    {(k.produtos || []).map((p: string) => LABELS[p] || p).join(" · ")} · {new Date(k.criado_em).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <KickoffActions id={k.id} encerrado={!!k.encerrado_em} nota={k.avaliacao_nota} entrou={k.avaliacao_entrou} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
