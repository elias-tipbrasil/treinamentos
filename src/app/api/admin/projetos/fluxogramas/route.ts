import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ erro: "Sem permissão" }, { status: 403 }); }
  const body = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projeto_fluxogramas")
    .insert({
      grupo_id: body.grupo_id,
      nome: body.nome,
      slug: body.slug,
      descricao: body.descricao,
      tipo: body.tipo,
      miro_iframe: body.miro_iframe,
      pdf_url: body.pdf_url,
      cor_tema: body.cor_tema,
      ordem: body.ordem ?? 99,
      ativo: body.ativo ?? true,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
