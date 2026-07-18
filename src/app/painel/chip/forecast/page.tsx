import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ChipTabs from "@/components/chip/ChipTabs";
import ForecastManager from "@/components/chip/ForecastManager";

export const dynamic = "force-dynamic";

export default async function ChipForecastPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <section className="max-w-7xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">CONTROLE DE CHIP</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
        Produção e estoque · Telecall · Surf · Arqia
      </p>

      <ChipTabs active="forecast" />
      <ForecastManager />
    </section>
  );
}
