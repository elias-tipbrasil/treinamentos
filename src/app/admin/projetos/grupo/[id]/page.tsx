import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import GrupoForm from "../GrupoForm";
import FluxogramasList from "./FluxogramasList";

export const dynamic = "force-dynamic";

export default async function EditarGrupoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: grupo } = await supabase
    .from("projeto_grupos")
    .select("*")
    .eq("id", id)
    .single();

  if (!grupo) notFound();

  const { data: fluxos } = await supabase
    .from("projeto_fluxogramas")
    .select("id, nome, slug, tipo, ordem, ativo")
    .eq("grupo_id", id)
    .order("ordem", { ascending: true });

  return (
    <section className="max-w-5xl mx-auto w-full px-6 py-10">
      <Link
        href="/admin/projetos"
        className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white inline-flex items-center gap-2 mb-6"
      >
        ← Grupos
      </Link>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none uppercase">{grupo.nome}</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-10 ml-5">
        Editar grupo · /{grupo.slug}
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-condensed text-xs tracking-[2.5px] uppercase text-[var(--text-muted)] mb-3">Dados do grupo</h2>
          <GrupoForm initial={grupo as any} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-condensed text-xs tracking-[2.5px] uppercase text-[var(--text-muted)]">Fluxogramas ({fluxos?.length || 0})</h2>
            <Link
              href={`/admin/projetos/fluxograma/novo?grupo=${grupo.id}`}
              className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-4 py-1.5 font-condensed text-[11px] font-bold tracking-[1.3px] uppercase rounded-lg"
            >
              + Novo
            </Link>
          </div>
          <FluxogramasList fluxos={(fluxos as any) || []} />
        </div>
      </div>
    </section>
  );
}
