import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import NovaSessaoForm from "./NovaSessaoForm";

export default async function NovaSessao() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = createAdminClient();
  const { data: treinamentos } = await supabase
    .from("treinamentos").select("id, nome").eq("ativo", true).order("nome");

  return (
    <section className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">NOVA SESSÃO</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">Preencha os dados do treinamento</p>

      <NovaSessaoForm treinamentos={treinamentos || []} />
    </section>
  );
}
