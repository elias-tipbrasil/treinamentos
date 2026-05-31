import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { getSlidesParaKickoff } from "@/lib/kickoff-slides";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: k } = await supabase
    .from("kickoffs")
    .select("nome_cliente, produtos")
    .eq("id", id)
    .eq("palestrante_id", user.id)
    .single();

  if (!k) return NextResponse.json({ erro: "Kickoff não encontrado" }, { status: 404 });

  const slides = getSlidesParaKickoff(k.produtos || []);
  const pdf = await PDFDocument.create();
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const tipRed = rgb(0.89, 0.024, 0.075);
  const white = rgb(1, 1, 1);
  const muted = rgb(0.54, 0.54, 0.54);

  for (const slide of slides) {
    const page = pdf.addPage([842, 595]); // A4 paisagem
    const W = 842, H = 595;
    const cx = W / 2;

    // fundo preto
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.02, 0.02, 0.02) });
    page.drawRectangle({ x: 25, y: 25, width: W - 50, height: H - 50, color: rgb(0.08, 0.08, 0.08), borderColor: tipRed, borderWidth: 1.5 });

    const centerText = (text: string, yTop: number, size: number, f: any, color: any) => {
      const w = f.widthOfTextAtSize(text, size);
      const x = cx - w / 2;
      const y = H - yTop - size * 0.75;
      page.drawText(text, { x, y, size, font: f, color });
    };

    // Logo no topo
    const logoSize = 14;
    const tipW = fontBold.widthOfTextAtSize("TIP ", logoSize);
    const brasilW = fontBold.widthOfTextAtSize("BRASIL", logoSize);
    const lTotal = tipW + brasilW;
    const lX = cx - lTotal / 2;
    page.drawText("TIP ", { x: lX, y: H - 50, size: logoSize, font: fontBold, color: tipRed });
    page.drawText("BRASIL", { x: lX + tipW, y: H - 50, size: logoSize, font: fontBold, color: white });

    // Conteúdo por slide
    switch (slide.id) {
      case "bem-vindo":
        centerText("Bem-vindo ao Universo TIP Brasil!", 130, 32, fontBold, white);
        page.drawRectangle({ x: cx - 30, y: H - 195, width: 60, height: 2, color: tipRed });
        centerText("A", 230, 18, font, white);
        centerText(k.nome_cliente, 260, 22, fontBold, tipRed);
        centerText("agora faz parte deste universo de parceiros.", 295, 16, font, white);
        centerText("Estamos prontos para trilhar juntos", 380, 12, font, muted);
        centerText("uma jornada de crescimento e transformação.", 400, 12, font, muted);
        break;

      case "hero":
        centerText("Você deu o passo e agora", 200, 28, fontBold, white);
        centerText("pertence ao Universo TIP Brasil", 240, 28, fontBold, white);
        centerText(k.nome_cliente, 320, 14, font, muted);
        break;

      case "nosso-time": {
        centerText("Nosso Time", 110, 32, fontBold, white);
        const colW = 340;
        const leftX = cx - colW - 20;
        const rightX = cx + 20;
        const topY = H - 190;
        // Coluna esquerda
        page.drawRectangle({ x: leftX, y: topY - 220, width: colW, height: 220, borderColor: tipRed, borderWidth: 0.5, opacity: 0 });
        page.drawText("Onboard Técnico", { x: leftX + 16, y: topY - 28, size: 16, font: fontBold, color: tipRed });
        page.drawText("RESPONSABILIDADES", { x: leftX + 16, y: topY - 48, size: 8, font, color: muted });
        ["• Envio das Informações para Início do Projeto", "• Liberação de acessos de Plataformas e APIs", "• Homologação da Integração", "• Treinamentos da Plataforma"].forEach((t, i) => {
          page.drawText(t, { x: leftX + 16, y: topY - 75 - i * 18, size: 10, font, color: white });
        });
        // Coluna direita
        page.drawRectangle({ x: rightX, y: topY - 220, width: colW, height: 220, borderColor: tipRed, borderWidth: 0.5, opacity: 0 });
        page.drawText("Onboard Administrativo", { x: rightX + 16, y: topY - 28, size: 16, font: fontBold, color: tipRed });
        page.drawText("RESPONSABILIDADES", { x: rightX + 16, y: topY - 48, size: 8, font, color: muted });
        ["• Cadastro da Parceira e Produtos contratados", "• Cobrança das Informações", "  para continuidade do projeto", "• Iniciar Produção do Projeto"].forEach((t, i) => {
          page.drawText(t, { x: rightX + 16, y: topY - 75 - i * 18, size: 10, font, color: white });
        });
        break;
      }

      case "importante":
        centerText("IMPORTANTE", 130, 28, fontBold, white);
        page.drawRectangle({ x: 80, y: H - 470, width: W - 160, height: 280, color: tipRed });
        const importanteLinhas = [
          "Para acelerarmos o RESULTADO e ENTREGA é muito importante",
          "que RESPONDA e ENVIE rapidamente as informações solicitadas.",
          "",
          "A ENTREGA do PROJETO pode ser COMPROMETIDA",
          "caso falte informações ou demora no envio.",
        ];
        importanteLinhas.forEach((l, i) => {
          centerText(l, 220 + i * 28, 13, font, white);
        });
        break;

      case "faq-integracao": {
        page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: tipRed });
        page.drawRectangle({ x: 25, y: 25, width: W - 50, height: H - 50, color: tipRed, borderColor: tipRed, borderWidth: 1.5 });
        page.drawText("FAQ INTEGRAÇÃO", { x: 50, y: H - 80, size: 24, font: fontBold, color: rgb(0, 0, 0) });
        page.drawRectangle({ x: 40, y: 50, width: W - 80, height: H - 150, color: white });

        const faqs = [
          ["A TIP Brasil quem faz a Integração?", "Não, a TIP entrega APIs e Token para que o ERP integre."],
          ["Quais ERPs estão integrados?", "70% dos ERPs do mercado de Provedores."],
          ["Quem fica responsável pela Integração?", "O ISP abre ticket com seu ERP após liberação do Token."],
          ["Tem custo a Integração?", "Por parte da TIP não há custo. Depende do acordo com o ERP."],
          ["Após integração, como saber se funciona?", "Marcamos uma reunião de homologação para testar juntos."],
          ["Quais funções existe na Integração?", "APIs cobrem grande parte: bloqueio/desbloqueio automático,"],
        ];
        const colXs = [60, 430];
        const rowY = [H - 180, H - 280, H - 380];
        faqs.forEach((f, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = colXs[col];
          const y = rowY[row];
          page.drawText(f[0], { x, y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
          page.drawText(f[1], { x, y: y - 18, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
        });
        break;
      }

      case "fluxo-mvno2":
        centerText("Projeto CHIP MVNO", 90, 22, fontBold, white);
        centerText("Fluxo de implantação", 118, 10, font, muted);
        drawFluxograma(page, font, fontBold, [
          ["Até 3 dias", "Cadastro inicial"],
          ["Aguard. ISP", "Criação da Arte"],
          ["+ 10 dias", "Produção"],
          ["Aguard. ISP", "Integração ERP"],
          ["+ 10 dias", "Homologação"],
          ["+ 40 dias", "Entrega"],
          ["Go Live", "Operação Assistida"],
        ], H);
        page.drawRectangle({ x: 50, y: 60, width: W - 100, height: 50, color: rgb(0.1, 0.1, 0.1), borderColor: tipRed, borderWidth: 1 });
        page.drawText("Importante: O projeto começa a contar o prazo a partir da Aprovação da Arte.", { x: 65, y: 88, size: 9, font: fontBold, color: tipRed });
        page.drawText("No MVNO, o Go Live pode acontecer com entrega do Chip e/ou eSIM.", { x: 65, y: 73, size: 9, font, color: white });
        break;

      case "fluxo-telefonia":
        centerText("Projeto Telefonia Fixa", 90, 22, fontBold, white);
        centerText("Fluxo de implantação", 118, 10, font, muted);
        drawFluxograma(page, font, fontBold, [
          ["Até 3 dias", "Cadastro inicial"],
          ["Aguard. ISP", "Documentação"],
          ["+ 10 dias", "Liberação"],
          ["Aguard. ISP", "Integração ERP"],
          ["+ 10 dias", "Homologação"],
          ["Go Live", "Operação Assistida"],
        ], H);
        break;

      case "obrigado":
        centerText("MUITO OBRIGADO", 150, 28, fontBold, white);
        page.drawRectangle({ x: 80, y: H - 420, width: W - 160, height: 200, color: tipRed });
        centerText("A estratégia está pronta.", 270, 24, fontBold, white);
        centerText("AGORA é colher RESULTADO", 310, 24, fontBold, white);
        break;
    }

    // Rodapé com nome do cliente
    page.drawText(`${k.nome_cliente} · Kickoff TIP Brasil`, { x: 50, y: 30, size: 8, font, color: muted });
  }

  const bytes = await pdf.save();
  const buf = Buffer.from(bytes);
  const u8 = new Uint8Array(buf.byteLength);
  u8.set(buf);
  return new NextResponse(u8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kickoff-${k.nome_cliente.replace(/[^a-zA-Z0-9]/g, "-")}.pdf"`,
    },
  });
}

function drawFluxograma(page: any, font: any, fontBold: any, etapas: [string, string][], H: number) {
  const startY = H - 180;
  const boxW = 110;
  const boxH = 65;
  const gap = 12;
  const cols = 4;
  const totalW = boxW * cols + gap * (cols - 1);
  const startX = (842 - totalW) / 2;

  etapas.forEach((e, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (boxW + gap);
    const y = startY - row * (boxH + 20);

    const cor = e[0].includes("Aguard") ? rgb(0.86, 0.15, 0.15)
      : e[0].includes("Go Live") ? rgb(0.13, 0.65, 0.27)
      : rgb(0.96, 0.62, 0.04);

    page.drawRectangle({ x, y: y - boxH, width: boxW, height: boxH, color: rgb(0.1, 0.1, 0.1), borderWidth: 0.5, borderColor: rgb(0.2, 0.2, 0.2) });
    page.drawRectangle({ x: x + 6, y: y - 18, width: 56, height: 12, color: cor });
    page.drawText(e[0], { x: x + 9, y: y - 16, size: 6, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText(e[1], { x: x + 6, y: y - 40, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  });
}
