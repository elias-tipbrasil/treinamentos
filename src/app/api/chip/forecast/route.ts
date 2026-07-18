import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getForecastOperadora, getFluxoCaixa, salvarMensal, salvarParametros, OPERADORAS_FORECAST } from "@/lib/forecast";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const operadora = searchParams.get("operadora") || "Surf";
  const ano = Number(searchParams.get("ano")) || new Date().getFullYear();
  if (!OPERADORAS_FORECAST.includes(operadora)) return NextResponse.json({ erro: "Operadora inválida" }, { status: 400 });

  const [{ parametros, linhas }, fluxoCaixa] = await Promise.all([
    getForecastOperadora(operadora, ano),
    getFluxoCaixa(operadora, ano),
  ]);

  return NextResponse.json({ parametros, linhas, fluxoCaixa, ano });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });

  const body = await req.json();

  if (body.tipo === "parametros") {
    const { tipo, operadora, ...campos } = body;
    const erro = await salvarParametros(operadora, campos);
    if (erro) return NextResponse.json({ erro: erro.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.tipo === "mensal") {
    const { tipo, operadora, mes, ...campos } = body;
    const erro = await salvarMensal(operadora, mes, campos);
    if (erro) return NextResponse.json({ erro: erro.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ erro: "tipo inválido" }, { status: 400 });
}
