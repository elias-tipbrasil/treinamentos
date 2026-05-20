import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import Resultado from "./Resultado";

export default async function Page({ params }: { params: Promise<{ pin: string }> }) {
  const { pin } = await params;
  const supabase = createAdminClient();
  const { data: sessao } = await supabase
    .from("sessoes").select("id, pin, treinamento:treinamentos(nome)")
    .eq("pin", pin.toUpperCase()).single();
  if (!sessao) notFound();
  return <Resultado pin={sessao.pin} sessaoId={sessao.id} treinamento={(sessao.treinamento as any).nome} />;
}
