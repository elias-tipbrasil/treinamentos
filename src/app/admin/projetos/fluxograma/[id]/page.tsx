import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import FluxogramaForm from "../FluxogramaForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditarFluxoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: fluxo } = await supabase
    .from("projeto_fluxogramas")
    .select("*, grupo:projeto_grupos(id, nome)")
    .eq("id", id)
    .single();

  if (!fluxo) notFound();

  return (
    <section className="max-w-3xl mx-auto w-full px-6 py-10">
      <Link href={`/admin/projetos/grupo/${fluxo.grupo_id}`} className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white inline-flex items-center gap-2 mb-6">
        ← {(fluxo.grupo as any)?.nome}
      </Link>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none uppercase">{fluxo.nome}</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
        Editar fluxograma · /{fluxo.slug}
      </p>

      <FluxogramaForm grupoId={fluxo.grupo_id} initial={fluxo as any} />
    </section>
  );
}
