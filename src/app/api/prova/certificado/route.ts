import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const participante = url.searchParams.get("participante");
  const sessao = url.searchParams.get("sessao");
  if (!participante || !sessao) return NextResponse.json({ erro: "Parâmetros faltando" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: cert } = await supabase.from("certificados")
    .select("codigo").eq("participante_id", participante).eq("sessao_id", sessao).maybeSingle();
  if (!cert) return NextResponse.json({ codigo: null });
  return NextResponse.json({ codigo: cert.codigo });
}
