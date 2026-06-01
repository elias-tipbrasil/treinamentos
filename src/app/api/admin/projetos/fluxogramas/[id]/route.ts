import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ erro: "Sem permissão" }, { status: 403 }); }
  const { id } = await params;
  const body = await req.json();
  body.atualizado_em = new Date().toISOString();
  const supabase = createAdminClient();
  const { error } = await supabase.from("projeto_fluxogramas").update(body).eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ erro: "Sem permissão" }, { status: 403 }); }
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("projeto_fluxogramas").delete().eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
