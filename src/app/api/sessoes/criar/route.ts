import { NextResponse } from "next/server";
import { getCurrentUser, gerarPin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { treinamento_id, parceiro_isp, data_hora, qtd_esperada } = body;
  if (!treinamento_id || !parceiro_isp || !data_hora)
    return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });

  const supabase = createAdminClient();

  // tenta gerar PIN único (até 5 tentativas)
  let pin = ""; let inserido: any = null;
  for (let i = 0; i < 5; i++) {
    pin = gerarPin();
    const { data, error } = await supabase
      .from("sessoes")
      .insert({
        pin, palestrante_id: user.id, treinamento_id,
        parceiro_isp, data_hora: new Date(data_hora).toISOString(),
        qtd_esperada, status: "ativa",
      })
      .select("id").single();
    if (!error && data) { inserido = data; break; }
  }
  if (!inserido) return NextResponse.json({ erro: "Falha ao gerar PIN" }, { status: 500 });

  return NextResponse.json({ id: inserido.id, pin });
}
