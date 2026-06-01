import { requireAdmin } from "@/lib/require-admin";
import GrupoForm from "../GrupoForm";

export const dynamic = "force-dynamic";

export default async function NovoGrupoPage() {
  await requireAdmin();

  return (
    <section className="max-w-2xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">NOVO GRUPO</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
        Cadastrar novo grupo de projetos
      </p>

      <GrupoForm />
    </section>
  );
}
