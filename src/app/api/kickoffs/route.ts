import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json();
  const { nome_cliente, produtos, observacoes } = body;

  if (!nome_cliente || !produtos?.length) {
    return NextResponse.json({ erro: "Nome do cliente e produtos são obrigatórios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("kickoffs")
    .insert({ palestrante_id: user.id, nome_cliente, produtos, observacoes })
    .select("id")
    .single();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
