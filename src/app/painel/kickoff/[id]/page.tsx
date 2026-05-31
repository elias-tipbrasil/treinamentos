import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import KickoffForm from "../KickoffForm";

export const dynamic = "force-dynamic";

export default async function EditarKickoff({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: k } = await supabase
    .from("kickoffs")
    .select("id, nome_cliente, produtos, observacoes")
    .eq("id", id)
    .eq("palestrante_id", user.id)
    .single();

  if (!k) notFound();

  return (
    <section className="max-w-2xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">EDITAR KICKOFF</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
        {k.nome_cliente}
      </p>

      <KickoffForm initial={k as any} />
    </section>
  );
}
