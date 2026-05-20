import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ erro: "E-mail obrigatório" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Busca todos os participantes com esse e-mail
  const { data: participantes } = await supabase
    .from("participantes")
    .select("id")
    .eq("email", email.toLowerCase().trim());

  if (!participantes || participantes.length === 0) {
    return NextResponse.json({ certificados: [] });
  }

  const ids = participantes.map((p) => p.id);

  // Busca certificados desses participantes
  const { data: certs } = await supabase
    .from("certificados")
    .select("codigo, nome_completo, treinamento_nome, parceiro_isp, data_treinamento, nota_final, total_perguntas, acertos, emitido_em")
    .in("participante_id", ids)
    .order("emitido_em", { ascending: false });

  return NextResponse.json({ certificados: certs || [] });
}
