import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import EditorTreinamento from "./EditorTreinamento";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: treinamento } = await supabase
    .from("treinamentos").select("id, nome, descricao").eq("id", id).single();
  if (!treinamento) notFound();

  const { data: modulos } = await supabase
    .from("modulos")
    .select("id, nome, ordem, tipo, perguntas(id, enunciado, tipo, ordem, vale_nota, alternativas(id, texto, correta, ordem))")
    .eq("treinamento_id", id)
    .order("ordem");

  return <EditorTreinamento treinamento={treinamento as any} modulosIniciais={(modulos || []) as any} />;
}
