import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ erro: "Sem permissão" }, { status: 403 }); }
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ erro: "Arquivo não enviado" }, { status: 400 });
  if (file.type !== "application/pdf") return NextResponse.json({ erro: "Apenas PDF" }, { status: 400 });

  const supabase = createAdminClient();
  const ext = "pdf";
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("projeto-pdfs")
    .upload(fileName, buffer, { contentType: "application/pdf", upsert: false });

  if (upErr) return NextResponse.json({ erro: upErr.message }, { status: 500 });

  const { data } = supabase.storage.from("projeto-pdfs").getPublicUrl(fileName);
  return NextResponse.json({ url: data.publicUrl });
}
