import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import FluxoViewer from "./FluxoViewer";

export const dynamic = "force-dynamic";

export default async function VisualizarFluxoPage({
  params,
}: {
  params: Promise<{ grupo: string; fluxo: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { grupo: grupoSlug, fluxo: fluxoSlug } = await params;

  const supabase = createAdminClient();

  const { data: grupo } = await supabase
    .from("projeto_grupos")
    .select("id, nome, slug")
    .eq("slug", grupoSlug)
    .single();
  if (!grupo) notFound();

  const { data: fluxo } = await supabase
    .from("projeto_fluxogramas")
    .select("id, nome, descricao, tipo, miro_iframe, pdf_url")
    .eq("grupo_id", grupo.id)
    .eq("slug", fluxoSlug)
    .eq("ativo", true)
    .single();
  if (!fluxo) notFound();

  return (
    <section className="max-w-7xl mx-auto w-full px-6 py-8">
      <Link
        href={`/painel/projetos/${grupo.slug}`}
        className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white inline-flex items-center gap-2 mb-4"
      >
        ← {grupo.nome}
      </Link>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight leading-none uppercase">{fluxo.nome}</h1>
      </div>
      {fluxo.descricao && (
        <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
          {fluxo.descricao}
        </p>
      )}

      <FluxoViewer fluxo={fluxo as any} />
    </section>
  );
}
