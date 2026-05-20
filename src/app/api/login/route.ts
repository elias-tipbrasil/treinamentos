import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase-admin";
import { createSessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, senha } = await req.json();
  if (!email || !senha) return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: user, error } = await supabase
    .from("usuarios")
    .select("id, email, nome, role, senha_hash, ativo")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !user || !user.ativo)
    return NextResponse.json({ erro: "E-mail ou senha inválidos" }, { status: 401 });

  const ok = await bcrypt.compare(senha, user.senha_hash);
  if (!ok) return NextResponse.json({ erro: "E-mail ou senha inválidos" }, { status: 401 });

  const token = await createSessionToken({
    id: user.id, email: user.email, nome: user.nome, role: user.role,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, path: "/",
  });
  return res;
}
