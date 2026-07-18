import { NextResponse } from "next/server";

function formatarDataBC(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}
function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Busca a cotação PTAX (fechamento) do dia útil imediatamente anterior à data informada,
// andando pra trás até achar um dia com cotação divulgada (fins de semana e feriados não têm).
async function buscarPtaxDiaAnterior(dataBase: Date) {
  let d = new Date(dataBase);
  d.setDate(d.getDate() - 1);

  for (let tentativas = 0; tentativas < 10; tentativas++) {
    const dataBC = formatarDataBC(d);
    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${dataBC}'&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const j = await res.json();
      const item = j?.value?.[0];
      if (item) {
        return {
          dataCotacao: toISO(d),
          cotacaoCompra: item.cotacaoCompra as number,
          cotacaoVenda: item.cotacaoVenda as number,
        };
      }
    }
    d.setDate(d.getDate() - 1);
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dataParam = searchParams.get("data");
  if (!dataParam) return NextResponse.json({ erro: "Informe a data" }, { status: 400 });

  const dataBase = new Date(dataParam + "T00:00:00");
  if (isNaN(dataBase.getTime())) return NextResponse.json({ erro: "Data inválida" }, { status: 400 });

  try {
    const ptax = await buscarPtaxDiaAnterior(dataBase);
    if (!ptax) return NextResponse.json({ erro: "Não foi possível obter a PTAX do Banco Central" }, { status: 502 });
    return NextResponse.json(ptax);
  } catch (e: any) {
    return NextResponse.json({ erro: "Falha ao consultar o Banco Central: " + e.message }, { status: 502 });
  }
}
