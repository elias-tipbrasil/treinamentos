import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import CertificadoView from "./CertificadoView";

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const supabase = createAdminClient();
  const { data: cert } = await supabase.from("certificados")
    .select("nome_completo, treinamento_nome").eq("codigo", codigo).single();
  if (!cert) return { title: "Certificado · TIP Brasil" };
  return {
    title: `Certificado de ${cert.nome_completo} · ${cert.treinamento_nome}`,
    description: `Certificado de conclusão do treinamento ${cert.treinamento_nome} pela TIP Brasil`,
  };
}

export default async function Page({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const supabase = createAdminClient();
  const { data: cert } = await supabase.from("certificados")
    .select("*").eq("codigo", codigo).single();
  if (!cert) notFound();
  return <CertificadoView cert={cert as any} />;
}
