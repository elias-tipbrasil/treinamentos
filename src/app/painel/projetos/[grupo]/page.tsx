import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import ProjetoTile, { ProjetoTileNovo } from "@/components/projetos/ProjetoTile";

export const dynamic = "force-dynamic";

export default async function GrupoProjetosPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { slug } = await params;

  const supabase = createAdminClient();

  const { data: grupo } = await supabase
    .from("projeto_grupos")
    .select("id, nome, slug, descricao, cor_tema, icone")
    .eq("slug", slug)
    .eq("ativo", true)
    .single();

  if (!grupo) notFound();

  const { data: fluxos } = await supabase
    .from("projeto_fluxogramas")
    .select("id, nome, slug, descricao, tipo, cor_tema")
    .eq("grupo_id", grupo.id)
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  const isAdmin = user.role === "admin";

  return (
    <section className="max-w-7xl mx-auto w-full px-6 py-10">
      <Link
        href="/painel/projetos"
        className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white inline-flex items-center gap-2 mb-6"
      >
        ← Projetos
      </Link>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none uppercase">{grupo.nome}</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-10 ml-5">
        {grupo.descricao || "Fluxogramas operacionais"}
      </p>

      {(!fluxos || fluxos.length === 0) && !isAdmin && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-12 text-center font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">
          Nenhum projeto cadastrado neste grupo ainda
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(fluxos || []).map((f: any) => (
          <ProjetoTile
            key={f.id}
            href={`/painel/projetos/${grupo.slug}/${f.slug}`}
            eyebrow={f.tipo === "pdf" ? "PDF" : "Fluxograma"}
            titulo={f.nome}
            metaItems={[f.descricao || ""].filter(Boolean)}
            cor={f.cor_tema || grupo.cor_tema}
            icone={grupo.icone}
          />
        ))}
        {isAdmin && (
          <ProjetoTileNovo
            href={`/admin/projetos/grupo/${grupo.id}`}
            label="Gerenciar projetos"
          />
        )}
      </div>
    </section>
  );
}
