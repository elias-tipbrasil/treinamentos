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
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] px-8 py-4 flex items-center justify-between bg-[var(--bg-surface-2)]">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-tight">
            <span className="text-[var(--tip-red)]">TIP</span> BRASIL
          </span>
          <span className="font-condensed text-[11px] tracking-[3px] uppercase text-[var(--text-muted)] border-l-2 border-[var(--tip-red)] pl-3">
            Nova Sessão
          </span>
        </div>
        <a href="/painel" className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white">← Voltar</a>
      </header>

      <section className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
          <h1 className="font-display text-4xl tracking-tight leading-none">NOVA SESSÃO</h1>
        </div>
        <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">Preencha os dados do treinamento</p>

        <NovaSessaoForm treinamentos={treinamentos || []} />
      </section>
    </main>
  );
}
