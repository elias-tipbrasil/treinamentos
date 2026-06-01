import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import FluxogramaForm from "../FluxogramaForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NovoFluxoPage({ searchParams }: { searchParams: Promise<{ grupo?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  if (!sp.grupo) notFound();

  const supabase = createAdminClient();
  const { data: grupo } = await supabase
    .from("projeto_grupos")
    .select("id, nome, slug")
    .eq("id", sp.grupo)
    .single();
  if (!grupo) notFound();

  return (
    <section className="max-w-3xl mx-auto w-full px-6 py-10">
      <Link href={`/admin/projetos/grupo/${grupo.id}`} className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white inline-flex items-center gap-2 mb-6">
        ← {grupo.nome}
      </Link>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">NOVO FLUXOGRAMA</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
        Grupo: {grupo.nome}
      </p>

      <FluxogramaForm grupoId={grupo.id} />
    </section>
  );
}
