import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import { FICHAS } from "@/lib/fichas";
import { LABELS } from "@/lib/pos-kickoff";
import FichaForm from "./FichaForm";

export const dynamic = "force-dynamic";

export default async function FichaPage({ params }: { params: Promise<{ token: string; produto: string }> }) {
  const { token, produto } = await params;
  const schema = FICHAS[produto];
  if (!schema) notFound();

  const supabase = createAdminClient();
  const { data: k } = await supabase
    .from("kickoffs")
    .select("id, fichas(produto, respostas)")
    .eq("token_publico", token)
    .single();
  if (!k) notFound();

  const fichas: any[] = (k as any).fichas || [];
  const existente = fichas.find((f) => f.produto === produto)?.respostas || null;
  const outras = fichas
    .filter((f) => f.produto !== produto && f.respostas)
    .map((f) => ({ produto: f.produto, label: LABELS[f.produto] || f.produto, respostas: f.respostas }));

  return (
    <FichaForm
      token={token}
      produto={produto}
      label={LABELS[produto] || produto}
      schema={schema}
      inicial={existente}
      outras={outras}
      concluida={!!existente}
    />
  );
}
