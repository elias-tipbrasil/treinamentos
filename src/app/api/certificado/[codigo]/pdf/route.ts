import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

export async function GET(_req: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const supabase = createAdminClient();
  const { data: cert } = await supabase.from("certificados").select("*").eq("codigo", codigo).single();
  if (!cert) return NextResponse.json({ erro: "Certificado não encontrado" }, { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const W = 842, H = 595;
  const cx = W / 2;

  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontIt = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const tipRed = rgb(0.89, 0.024, 0.075);
  const white = rgb(1, 1, 1);
  const muted = rgb(0.54, 0.54, 0.54);
  const dim = rgb(0.69, 0.69, 0.69);
  const surface = rgb(0.08, 0.08, 0.08);

  // Sem characterSpacing — uso espaços para simular tracking quando preciso
  const centerText = (text: string, xCenter: number, yTop: number, size: number, f: any, color: any) => {
    const w = f.widthOfTextAtSize(text, size);
    const x = xCenter - w / 2;
    const y = H - yTop - size * 0.75;
    page.drawText(text, { x, y, size, font: f, color });
  };

  // Simula tracking inserindo espaços entre os caracteres
  const spaced = (text: string) => text.split("").join(" ");

  // FUNDO
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.02, 0.02, 0.02) });
  page.drawRectangle({ x: 22, y: 22, width: W - 44, height: H - 44, color: surface, borderColor: tipRed, borderWidth: 2.5 });
  page.drawRectangle({ x: 37, y: 37, width: W - 74, height: H - 74, borderColor: tipRed, borderWidth: 0.5, opacity: 0 });

  // CANTOS
  const cLen = 45;
  page.drawLine({ start: { x: 52, y: H - 52 }, end: { x: 52, y: H - 52 - cLen }, thickness: 3, color: tipRed });
  page.drawLine({ start: { x: 52, y: H - 52 }, end: { x: 52 + cLen, y: H - 52 }, thickness: 3, color: tipRed });
  page.drawCircle({ x: 52, y: H - 52, size: 4.5, color: tipRed });
  page.drawLine({ start: { x: W - 52, y: H - 52 }, end: { x: W - 52, y: H - 52 - cLen }, thickness: 3, color: tipRed });
  page.drawLine({ start: { x: W - 52, y: H - 52 }, end: { x: W - 52 - cLen, y: H - 52 }, thickness: 3, color: tipRed });
  page.drawCircle({ x: W - 52, y: H - 52, size: 4.5, color: tipRed });
  page.drawLine({ start: { x: 52, y: 52 }, end: { x: 52, y: 52 + cLen }, thickness: 3, color: tipRed });
  page.drawLine({ start: { x: 52, y: 52 }, end: { x: 52 + cLen, y: 52 }, thickness: 3, color: tipRed });
  page.drawCircle({ x: 52, y: 52, size: 4.5, color: tipRed });
  page.drawLine({ start: { x: W - 52, y: 52 }, end: { x: W - 52, y: 52 + cLen }, thickness: 3, color: tipRed });
  page.drawLine({ start: { x: W - 52, y: 52 }, end: { x: W - 52 - cLen, y: 52 }, thickness: 3, color: tipRed });
  page.drawCircle({ x: W - 52, y: 52, size: 4.5, color: tipRed });

  // LOGO TIP BRASIL — bloco único centralizado
  const logoSize = 30;
  const tipPart = "TIP ";
  const brasilPart = "BRASIL";
  const tipW = fontBold.widthOfTextAtSize(tipPart, logoSize);
  const brasilW = fontBold.widthOfTextAtSize(brasilPart, logoSize);
  const logoTotalW = tipW + brasilW;
  const logoX = cx - logoTotalW / 2;
  const logoYBaseline = H - 60 - logoSize * 0.75;
  page.drawText(tipPart, { x: logoX, y: logoYBaseline, size: logoSize, font: fontBold, color: tipRed });
  page.drawText(brasilPart, { x: logoX + tipW, y: logoYBaseline, size: logoSize, font: fontBold, color: white });

  centerText(spaced("PROGRAMA DE TREINAMENTOS"), cx, 102, 7, font, muted);

  page.drawRectangle({ x: cx - 50, y: H - 128, width: 100, height: 1.5, color: tipRed });

  centerText(spaced("CERTIFICADO DE CONCLUSÃO"), cx, 144, 10, font, dim);
  centerText("Certificamos que", cx, 180, 12, fontIt, dim);

  let nomeSize = 32;
  while (fontBold.widthOfTextAtSize(cert.nome_completo, nomeSize) > W - 140 && nomeSize > 18) nomeSize -= 1;
  centerText(cert.nome_completo, cx, 215, nomeSize, fontBold, white);

  centerText("concluiu com sucesso o treinamento", cx, 265, 12, fontIt, dim);

  let trSize = 22;
  while (fontBold.widthOfTextAtSize(cert.treinamento_nome, trSize) > W - 140 && trSize > 14) trSize -= 1;
  centerText(cert.treinamento_nome, cx, 297, trSize, fontBold, tipRed);

  let metaY = 332;
  if (cert.parceiro_isp) {
    centerText(`REALIZADO EM PARCERIA COM ${cert.parceiro_isp.toUpperCase()}`, cx, metaY, 8, font, muted);
    metaY += 14;
  }
  const dataFmt = new Date(cert.data_treinamento + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  }).toUpperCase();
  centerText(`${dataFmt} · CARGA HORÁRIA 90 MINUTOS`, cx, metaY, 8, font, muted);

  page.drawRectangle({ x: cx - 50, y: H - 370, width: 100, height: 1.5, color: tipRed });

  // STATS
  const statColAprov = cx - 120;
  const statColAcert = cx + 120;
  centerText("APROVEITAMENTO", statColAprov, 392, 8, font, muted);
  centerText(`${Number(cert.nota_final).toFixed(0)}%`, statColAprov, 412, 30, fontBold, tipRed);

  centerText("ACERTOS", statColAcert, 392, 8, font, muted);
  const acertosStr = String(cert.acertos);
  const fracStr = `/${cert.total_perguntas}`;
  const big = 30, small = 18;
  const wBig = fontBold.widthOfTextAtSize(acertosStr, big);
  const wSm = fontBold.widthOfTextAtSize(fracStr, small);
  const acTotal = wBig + wSm;
  const acStartX = statColAcert - acTotal / 2;
  const acBaseline = H - 412 - big * 0.75;
  page.drawText(acertosStr, { x: acStartX, y: acBaseline, size: big, font: fontBold, color: white });
  page.drawText(fracStr, { x: acStartX + wBig, y: acBaseline + (big - small) * 0.35, size: small, font: fontBold, color: muted });

  // ASSINATURAS
  const sigCxL = 200;
  const sigCxR = W - 200;
  const sigBoxW = 140;
  const sigBoxH = 55;
  const sigImgTop = 460;

  try {
    const cristianoBytes = await fs.readFile(path.join(process.cwd(), "public/assinaturas/cristiano.png"));
    const andreBytes = await fs.readFile(path.join(process.cwd(), "public/assinaturas/andre.png"));
    const cristianoImg = await pdf.embedPng(cristianoBytes);
    const andreImg = await pdf.embedPng(andreBytes);
    const cDim = cristianoImg.scaleToFit(sigBoxW, sigBoxH);
    const aDim = andreImg.scaleToFit(sigBoxW, sigBoxH);

    page.drawImage(cristianoImg, {
      x: sigCxL - cDim.width / 2, y: H - sigImgTop - cDim.height,
      width: cDim.width, height: cDim.height,
    });
    page.drawImage(andreImg, {
      x: sigCxR - aDim.width / 2, y: H - sigImgTop - aDim.height,
      width: aDim.width, height: aDim.height,
    });
  } catch (e) {
    console.error("Erro carregando assinaturas:", e);
  }

  const sigLineY = H - 525;
  page.drawLine({ start: { x: sigCxL - 95, y: sigLineY }, end: { x: sigCxL + 95, y: sigLineY }, thickness: 0.5, color: white, opacity: 0.4 });
  page.drawLine({ start: { x: sigCxR - 95, y: sigLineY }, end: { x: sigCxR + 95, y: sigLineY }, thickness: 0.5, color: white, opacity: 0.4 });

  centerText("Cristiano Alves", sigCxL, 530, 11, fontBold, white);
  centerText("DIRETOR COMERCIAL · TIP BRASIL", sigCxL, 547, 7, font, muted);
  centerText("André Telles", sigCxR, 530, 11, fontBold, white);
  centerText("CEO · TIP BRASIL", sigCxR, 547, 7, font, muted);

  // SELO
  const selCx = cx;
  const selCy = H - 492;
  page.drawCircle({ x: selCx, y: selCy, size: 32, borderColor: tipRed, borderWidth: 2, opacity: 0 });
  page.drawCircle({ x: selCx, y: selCy, size: 27, borderColor: tipRed, borderWidth: 0.5, opacity: 0 });
  page.drawCircle({ x: selCx, y: selCy, size: 23, color: tipRed, opacity: 0.08 });
  centerText("TIP", selCx, 478, 10, fontBold, tipRed);
  centerText("BRASIL", selCx, 492, 9, fontBold, tipRed);
  centerText("CERTIFICADO 2026", selCx, 506, 5.5, font, muted);

  // RODAPÉ
  centerText(
    `CÓDIGO DE VALIDAÇÃO · ${cert.codigo} · VALIDE EM provas-tip.vercel.app/certificado/${cert.codigo}`,
    cx, 565, 7, font, rgb(0.45, 0.45, 0.45)
  );

  const bytes = await pdf.save();
  const buf = Buffer.from(bytes);
  const u8 = new Uint8Array(buf.byteLength);
  u8.set(buf);
  return new NextResponse(u8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${cert.codigo}.pdf"`,
    },
  });
}
