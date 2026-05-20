import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const update: any = {};
  if (typeof body.ativo === "boolean") update.ativo = body.ativo;
  if (body.senha) update.senha_hash = await bcrypt.hash(body.senha, 10);
  const supabase = createAdminClient();
  const { error } = await supabase.from("usuarios").update(update).eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
