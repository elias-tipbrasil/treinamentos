import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import EntrarForm from "./EntrarForm";

export default async function Page({ params }: { params: Promise<{ pin: string }> }) {
  const { pin } = await params;
  const supabase = createAdminClient();
  const { data: sessao } = await supabase
    .from("sessoes")
    .select("id, pin, parceiro_isp, status, treinamento:treinamentos(nome)")
    .eq("pin", pin.toUpperCase()).single();

  if (!sessao) notFound();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] px-8 py-4 flex items-center justify-between bg-[var(--bg-surface-2)]">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-tight">
            <span className="text-[var(--tip-red)]">TIP</span> BRASIL
          </span>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
            <h1 className="font-display text-3xl tracking-tight leading-none">
              {(sessao.treinamento as any)?.nome}
            </h1>
          </div>
          <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
            {sessao.parceiro_isp} · PIN {sessao.pin}
          </p>

          {sessao.status === "encerrada" ? (
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 text-center">
              <p className="font-condensed text-base tracking-[2px] uppercase text-[var(--text-muted)]">Esta sessão já foi encerrada.</p>
            </div>
          ) : (
            <EntrarForm sessaoId={sessao.id} pin={sessao.pin} />
          )}
        </div>
      </section>
    </main>
  );
}
