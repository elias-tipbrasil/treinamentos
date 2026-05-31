import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("kickoffs")
    .update({ ...body, atualizado_em: new Date().toISOString() })
    .eq("id", id)
    .eq("palestrante_id", user.id);

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const { id } = await params;

  const supabase = createAdminClient();
  const { error } = await supabase.from("kickoffs").delete().eq("id", id).eq("palestrante_id", user.id);

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
