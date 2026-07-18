import { NextResponse } from "next/server";
import { getChipProdutos } from "@/lib/chip";

export async function GET() {
  const produtos = await getChipProdutos();
  return NextResponse.json({ produtos });
}
