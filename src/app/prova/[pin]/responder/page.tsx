import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import Responder from "./Responder";

export default async function Page({ params }: { params: Promise<{ pin: string }> }) {
  const { pin } = await params;
  const supabase = createAdminClient();

  const { data: sessao } = await supabase
    .from("sessoes")
    .select("id, pin, status, treinamento_id, treinamento:treinamentos(nome)")
    .eq("pin", pin.toUpperCase()).single();

  if (!sessao) notFound();

  const { data: modulos } = await supabase
    .from("modulos")
    .select("id, nome, ordem, tipo, perguntas(id, enunciado, tipo, ordem, alternativas(id, texto, ordem))")
    .eq("treinamento_id", sessao.treinamento_id)
    .order("ordem");

  return <Responder pin={sessao.pin} sessaoId={sessao.id} sessaoStatus={sessao.status} treinamentoNome={(sessao.treinamento as any).nome} modulos={(modulos || []) as any} />;
}
