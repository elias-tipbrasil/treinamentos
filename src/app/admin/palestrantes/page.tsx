import { createAdminClient } from "@/lib/supabase-admin";
import PalestrantesList from "./PalestrantesList";

export default async function Page() {
  const supabase = createAdminClient();
  const { data: palestrantes } = await supabase
    .from("usuarios")
    .select("id, email, nome, role, ativo, criado_em")
    .order("nome");

  return (
    <section className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">PALESTRANTES</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">Cadastre ou desative palestrantes e admins</p>

      <PalestrantesList usuarios={(palestrantes || []) as any} />
    </section>
  );
}
