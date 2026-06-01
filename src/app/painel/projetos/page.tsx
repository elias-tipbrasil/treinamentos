import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import ProjetoTile, { ProjetoTileNovo } from "@/components/projetos/ProjetoTile";

export const dynamic = "force-dynamic";

export default async function GruposProjetosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = createAdminClient();
  const { data: grupos } = await supabase
    .from("projeto_grupos")
    .select("id, nome, slug, descricao, cor_tema, icone, projeto_fluxogramas(count)")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  const isAdmin = user.role === "admin";

  return (
    <section className="max-w-7xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">PROJETOS</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-10 ml-5">
        Grupos de Projetos · Fluxogramas operacionais
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(grupos || []).map((g: any) => {
          const count = g.projeto_fluxogramas?.[0]?.count || 0;
          return (
            <ProjetoTile
              key={g.id}
              href={`/painel/projetos/${g.slug}`}
              eyebrow="Grupo"
              titulo={g.nome}
              metaItems={[
                `<b>${count}</b> ${count === 1 ? "projeto" : "projetos"}`,
                g.descricao || "",
              ].filter(Boolean)}
              cor={g.cor_tema}
              icone={g.icone}
            />
          );
        })}
        {isAdmin && <ProjetoTileNovo href="/admin/projetos" label="Gerenciar grupos" />}
      </div>
    </section>
  );
}
