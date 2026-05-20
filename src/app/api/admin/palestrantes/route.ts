import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const { nome, email, senha, role } = await req.json();
  if (!nome || !email || !senha) return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });
  if (senha.length < 6) return NextResponse.json({ erro: "Senha mínima 6 caracteres" }, { status: 400 });

  const senha_hash = await bcrypt.hash(senha, 10);
  const supabase = createAdminClient();
  const { error } = await supabase.from("usuarios").insert({
    nome, email: email.toLowerCase().trim(), senha_hash, role: role || "palestrante", ativo: true,
  });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
