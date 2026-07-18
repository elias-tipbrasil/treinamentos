import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { produto, respostas } = await req.json();
  if (!produto || !respostas) return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: k } = await supabase.from("kickoffs").select("id").eq("token_publico", token).single();
  if (!k) return NextResponse.json({ erro: "Link inválido" }, { status: 404 });

  const { error } = await supabase.from("fichas").upsert(
    { kickoff_id: k.id, produto, respostas },
    { onConflict: "kickoff_id,produto" }
  );
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
