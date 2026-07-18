import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getChipDashboard } from "@/lib/chip";
import ChipDashboard from "@/components/chip/ChipDashboard";
import ChipTabs from "@/components/chip/ChipTabs";

export const dynamic = "force-dynamic";

export default async function ChipPage({ searchParams }: { searchParams: Promise<{ ano?: string; mes?: string; operadora?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const ano = Number(sp.ano) || new Date().getFullYear();
  const mes = Number(sp.mes) || undefined;
  const data = await getChipDashboard(ano, mes, sp.operadora || "");

  return (
    <section className="max-w-7xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">CONTROLE DE CHIP</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
        Produção e estoque · Telecall · Surf · Arqia
      </p>

      <ChipTabs active="dashboard" />
      <ChipDashboard data={data} />
    </section>
  );
}
