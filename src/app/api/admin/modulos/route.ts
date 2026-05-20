import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const { treinamento_id, nome, tipo, ordem } = await req.json();
  const supabase = createAdminClient();
  const { error } = await supabase.from("modulos").insert({ treinamento_id, nome, tipo: tipo || "conhecimento", ordem });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
