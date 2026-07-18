"use client";
import { useState } from "react";
import ChipPedidosTable from "./ChipPedidosTable";
import EsimManager from "./EsimManager";

const ABAS = [
  { chave: "Tim", label: "Surf Chip", tipo: "chip" as const },
  { chave: "Vivo", label: "Telecall Chip", tipo: "chip" as const },
  { chave: "Arqia", label: "Arqia Chip", tipo: "chip" as const },
  { chave: "Valhalla", label: "Valhalla Chip", tipo: "chip" as const },
  { chave: "Surf", label: "Surf E-sim", tipo: "esim" as const },
  { chave: "Telecall", label: "Telecall E-sim", tipo: "esim" as const },
  { chave: "Arqia_Esim", label: "Arqia E-sim", tipo: "esim" as const, operadora: "Arqia" },
];

export default function ProducaoManager() {
  const [ativa, setAtiva] = useState(ABAS[0]);

  return (
    <div>
      <div className="flex gap-1 mb-5 flex-wrap">
        {ABAS.map((a) => (
          <button
            key={a.chave}
            onClick={() => setAtiva(a)}
            className={`px-4 py-2 rounded-full font-condensed text-xs font-bold tracking-[1.3px] uppercase transition-colors ${
              ativa.chave === a.chave ? "bg-[var(--tip-red)] text-white" : "bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {ativa.tipo === "chip" ? (
        <ChipPedidosTable rede={ativa.chave} />
      ) : (
        <EsimManager operadora={ativa.operadora || ativa.chave} />
      )}
    </div>
  );
}
