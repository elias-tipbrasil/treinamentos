import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: Request, { params }: { params: Promise<{ sessaoId: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const { sessaoId } = await params;
  const url = new URL(req.url);
  const formato = url.searchParams.get("formato") || "csv";

  const supabase = createAdminClient();
  const { data: sessao } = await supabase
    .from("sessoes")
    .select("pin, parceiro_isp, data_hora, treinamento_id, treinamento:treinamentos(nome)")
    .eq("id", sessaoId).single();
  if (!sessao) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });

  const { data: modulos } = await supabase
    .from("modulos")
    .select("id, nome, ordem, perguntas(id, enunciado, tipo, ordem, vale_nota, alternativas(id, texto, correta))")
    .eq("treinamento_id", sessao.treinamento_id).order("ordem");

  const { data: participantes } = await supabase
    .from("participantes")
    .select("id, nome, email, entrou_em, respostas(pergunta_id, alternativa_id, valor_escala, texto_resposta)")
    .eq("sessao_id", sessaoId).order("nome");

  const allPergs = (modulos || []).flatMap((m: any) => m.perguntas.map((p: any) => ({ ...p, modulo: m.nome }))).sort((a: any, b: any) => a.modulo.localeCompare(b.modulo) || a.ordem - b.ordem);
  const correctMap: Record<string, string> = {};
  const altMap: Record<string, Record<string, string>> = {};
  allPergs.forEach((p: any) => {
    altMap[p.id] = {};
    p.alternativas?.forEach((a: any) => {
      altMap[p.id][a.id] = a.texto;
      if (a.correta) correctMap[p.id] = a.id;
    });
  });

  // Cabeçalhos: dados do participante + 1 coluna por pergunta + Nota
  const cabRespostas = allPergs.map((p: any) => `[${p.modulo}] ${p.enunciado.slice(0, 80)}`);
  const rows: string[][] = [];
  rows.push(["Nome", "E-mail", "Entrou em", ...cabRespostas, "Acertos", "Total", "Nota %"]);

  const pergsVN = allPergs.filter((p: any) => p.vale_nota);

  (participantes || []).forEach((p: any) => {
    const respMap = new Map(p.respostas.map((r: any) => [r.pergunta_id, r]));
    let acertos = 0;
    const cols: string[] = [];
    allPergs.forEach((perg: any) => {
      const r: any = respMap.get(perg.id);
      if (!r) { cols.push(""); return; }
      if (perg.tipo === "multipla_escolha") {
        const texto = altMap[perg.id]?.[r.alternativa_id] || "";
        const ok = r.alternativa_id === correctMap[perg.id];
        cols.push(perg.vale_nota ? `${texto} ${ok ? "✓" : "✗"}` : texto);
        if (perg.vale_nota && ok) acertos++;
      } else if (perg.tipo === "escala") {
        cols.push(String(r.valor_escala ?? ""));
      } else {
        cols.push(r.texto_resposta || "");
      }
    });
    const pct = pergsVN.length ? (acertos / pergsVN.length) * 100 : 0;
    rows.push([
      p.nome, p.email, new Date(p.entrou_em).toLocaleString("pt-BR"),
      ...cols,
      String(acertos), String(pergsVN.length), pct.toFixed(1).replace(".", ","),
    ]);
  });

  if (formato === "excel") {
    // gera HTML interpretado como Excel (.xls)
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"></head>
<body><table>${rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
    return new NextResponse(html, {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename="relatorio_${sessao.pin}.xls"`,
      },
    });
  }

  // CSV (com BOM para Excel ler UTF-8)
  const csv = "\uFEFF" + rows.map((r) => r.map(csvCell).join(";")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio_${sessao.pin}.csv"`,
    },
  });
}

function csvCell(v: string) {
  const s = String(v ?? "");
  if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function escapeHtml(s: string) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
