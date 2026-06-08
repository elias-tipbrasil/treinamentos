import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("executivos").select("id, nome").eq("ativo", true).order("nome");
  return NextResponse.json({ executivos: data || [] });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const { nome } = await req.json();
  if (!nome?.trim()) return NextResponse.json({ erro: "Nome obrigatório" }, { status: 400 });
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("executivos").insert({ nome: nome.trim() }).select("id").single();
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ erro: "id" }, { status: 400 });
  const supabase = createAdminClient();
  await supabase.from("executivos").update({ ativo: false }).eq("id", id);
  return NextResponse.json({ ok: true });
}
