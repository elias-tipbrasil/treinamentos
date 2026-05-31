import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import KickoffActions from "./KickoffActions";

export const dynamic = "force-dynamic";

export default async function KickoffsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = createAdminClient();
  const { data: kickoffs } = await supabase
    .from("kickoffs")
    .select("id, nome_cliente, produtos, criado_em")
    .eq("palestrante_id", user.id)
    .order("criado_em", { ascending: false });

  return (
    <section className="max-w-6xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">KICKOFF</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
        Apresentações de boas-vindas personalizadas por cliente
      </p>

      <div className="mb-8 flex justify-end">
        <Link
          href="/painel/kickoff/novo"
          className="inline-flex items-center gap-2 bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-5 py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all"
        >
          + Novo Kickoff
        </Link>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {!kickoffs || kickoffs.length === 0 ? (
          <div className="p-12 text-center font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">
            Nenhum kickoff criado ainda
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {kickoffs.map((k: any) => (
              <div key={k.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[var(--bg-surface-2)] transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="font-display text-xl text-white mb-1">{k.nome_cliente}</div>
                  <div className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)]">
                    {(k.produtos || []).map((p: string) => p === "mvno2" ? "MVNO #2" : p === "telefonia_fixa" ? "Telefonia Fixa" : p).join(" · ")} ·{" "}
                    {new Date(k.criado_em).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <KickoffActions id={k.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
