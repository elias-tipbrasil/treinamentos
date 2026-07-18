"use client";
import Link from "next/link";

const TABS = [
  { id: "dashboard", label: "Dashboard", href: "/painel/chip" },
  { id: "producao", label: "Controle de Produção", href: "/painel/chip/producao" },
  { id: "estoque", label: "Controle de Estoque", href: "/painel/chip/estoque" },
  { id: "insumos", label: "Controle de Insumos", href: "/painel/chip/insumos" },
  { id: "forecast", label: "Forecast de Compra", href: "/painel/chip/forecast" },
  { id: "ptax", label: "Calculadora PTAX", href: "/painel/chip/ptax" },
];

export default function ChipTabs({ active }: { active: string }) {
  return (
    <div className="flex gap-1 mb-8 border-b border-[var(--border)]">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className={`px-4 py-2.5 font-condensed text-xs font-bold tracking-[1.5px] uppercase border-b-2 transition-colors ${
            active === t.id
              ? "border-[var(--tip-red)] text-white"
              : "border-transparent text-[var(--text-muted)] hover:text-white"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
