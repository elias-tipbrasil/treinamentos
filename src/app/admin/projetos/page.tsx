import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import GruposAdminList from "./GruposAdminList";

export const dynamic = "force-dynamic";

export default async function AdminGruposPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: grupos } = await supabase
    .from("projeto_grupos")
    .select("id, nome, slug, descricao, cor_tema, icone, ordem, ativo, projeto_fluxogramas(count)")
    .order("ordem", { ascending: true });

  return (
    <section className="max-w-6xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">PROJETOS · ADMIN</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
        Gerenciar grupos e fluxogramas
      </p>

      <div className="mb-6 flex justify-end gap-3">
        <Link
          href="/painel/projetos"
          className="inline-flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:border-white text-white px-4 py-2 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg"
        >
          Ver como parceiro →
        </Link>
        <Link
          href="/admin/projetos/grupo/novo"
          className="inline-flex items-center gap-2 bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-5 py-2 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg"
        >
          + Novo grupo
        </Link>
      </div>

      <GruposAdminList grupos={(grupos as any) || []} />
    </section>
  );
}
