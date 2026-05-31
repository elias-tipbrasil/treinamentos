import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { getSlidesParaKickoff } from "@/lib/kickoff-slides";
import Apresentacao from "./Apresentacao";

export const dynamic = "force-dynamic";

export default async function ApresentarKickoff({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: k } = await supabase
    .from("kickoffs")
    .select("nome_cliente, produtos")
    .eq("id", id)
    .eq("palestrante_id", user.id)
    .single();

  if (!k) notFound();

  const slides = getSlidesParaKickoff(k.produtos || []);

  return <Apresentacao nomeCliente={k.nome_cliente} slides={slides} kickoffId={id} />;
}
