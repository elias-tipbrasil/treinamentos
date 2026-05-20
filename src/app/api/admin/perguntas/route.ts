import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const { modulo_id, enunciado, tipo, ordem, vale_nota, alternativas } = await req.json();
  const supabase = createAdminClient();

  const { data: perg, error } = await supabase
    .from("perguntas")
    .insert({ modulo_id, enunciado, tipo, ordem, vale_nota: vale_nota !== false })
    .select("id").single();
  if (error || !perg) return NextResponse.json({ erro: error?.message || "Erro" }, { status: 500 });

  if (tipo === "multipla_escolha" && alternativas?.length) {
    const alts = alternativas.map((a: any, i: number) => ({
      pergunta_id: perg.id, texto: a.texto, correta: !!a.correta, ordem: i + 1,
    }));
    await supabase.from("alternativas").insert(alts);
  }
  return NextResponse.json({ ok: true, id: perg.id });
}
