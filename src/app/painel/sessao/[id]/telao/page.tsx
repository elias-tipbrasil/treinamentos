import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import Telao from "./Telao";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: sessao } = await supabase
    .from("sessoes")
    .select("id, pin, parceiro_isp, status, treinamento_id, treinamento:treinamentos(nome), palestrante_id")
    .eq("id", id).single();
  if (!sessao || sessao.palestrante_id !== user.id) notFound();

  const { data: modulos } = await supabase
    .from("modulos")
    .select("id, nome, ordem, tipo, perguntas(id)")
    .eq("treinamento_id", sessao.treinamento_id)
    .order("ordem");

  return <Telao sessao={sessao as any} modulos={(modulos || []) as any} />;
}
