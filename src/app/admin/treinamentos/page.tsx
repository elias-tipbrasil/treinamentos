import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import TreinamentosList from "./TreinamentosList";

export default async function Page() {
  const supabase = createAdminClient();
  const { data: treinamentos } = await supabase
    .from("treinamentos")
    .select("id, nome, descricao, ativo, modulos(id)")
    .order("nome");

  return (
    <section className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">TREINAMENTOS</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">Cadastre treinamentos, módulos e perguntas</p>

      <TreinamentosList treinamentos={(treinamentos || []) as any} />
    </section>
  );
}
