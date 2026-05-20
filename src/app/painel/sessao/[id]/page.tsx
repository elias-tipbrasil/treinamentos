import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import PainelSessao from "./PainelSessao";

export default async function Pagina({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: sessao } = await supabase
    .from("sessoes")
    .select("id, pin, parceiro_isp, data_hora, qtd_esperada, status, treinamento_id, palestrante_id, treinamento:treinamentos(id, nome)")
    .eq("id", id).single();

  if (!sessao || sessao.palestrante_id !== user.id) notFound();

  // módulos do treinamento + perguntas
  const { data: modulos } = await supabase
    .from("modulos")
    .select("id, nome, ordem, tipo, perguntas(id, ordem)")
    .eq("treinamento_id", sessao.treinamento_id)
    .order("ordem");

  const { data: liberados } = await supabase
    .from("modulos_liberados")
    .select("modulo_id, liberado_em, fechado_em")
    .eq("sessao_id", id);

  return <PainelSessao sessao={sessao as any} modulos={(modulos || []) as any} liberadosIniciais={(liberados || []) as any} />;
}
