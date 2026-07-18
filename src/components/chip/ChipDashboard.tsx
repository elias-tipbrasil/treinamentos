"use client";
import { useRouter, useSearchParams } from "next/navigation";
import type { EstoqueDashboard } from "@/lib/chip";
import { OPERADORAS_CHIP } from "@/lib/chip";

const CORES: Record<string, string> = {
  Telecall: "#FF1A2E",
  Surf: "#818cf8",
  Arqia: "#fbbf24",
  Valhalla: "#ffffff",
};

const MESES_NOME = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

interface LinhaEnvio {
  label: string;
  porOperadora: Record<string, number>;
  total: number;
  destaque?: boolean;
}

export default function ChipDashboard({ data }: { data: EstoqueDashboard }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const atualizarParam = (chave: string, valor: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set(chave, valor);
    else params.delete(chave);
    router.push(`/painel/chip?${params.toString()}`);
  };

  const maxEstoqueProduto = Math.max(
    1,
    ...data.porOperadora.flatMap((g) => g.produtos.map((p) => p.estoque))
  );

  const mesesComDadoChip = data.enviosChipPorMes.filter((m) => m.total > 0);
  const ultimoMesChip = mesesComDadoChip.length ? mesesComDadoChip[mesesComDadoChip.length - 1].mes : 0;
  const mesesComDadoEsim = data.enviosEsimPorMes.filter((m) => m.total > 0);
  const ultimoMesEsim = mesesComDadoEsim.length ? mesesComDadoEsim[mesesComDadoEsim.length - 1].mes : 0;

  const linhasMesChip: LinhaEnvio[] = data.enviosChipPorMes.map((m) => ({ label: m.label, porOperadora: m.porOperadora, total: m.total, destaque: m.mes === ultimoMesChip }));
  const linhasMesEsim: LinhaEnvio[] = data.enviosEsimPorMes.map((m) => ({ label: m.label, porOperadora: m.porOperadora, total: m.total, destaque: m.mes === ultimoMesEsim }));
  const linhasSemanaChip: LinhaEnvio[] = data.enviosChipPorSemana.map((s) => ({ label: `Semana ${s.semana}`, porOperadora: s.porOperadora, total: s.total }));
  const linhasSemanaEsim: LinhaEnvio[] = data.enviosEsimPorSemana.map((s) => ({ label: `Semana ${s.semana}`, porOperadora: s.porOperadora, total: s.total }));

  return (
    <>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex gap-1">
          <button
            onClick={() => atualizarParam("operadora", "")}
            className={`px-4 py-2 rounded-full font-condensed text-xs font-bold tracking-[1.3px] uppercase transition-colors ${
              !data.operadoraFiltro ? "bg-[var(--tip-red)] text-white" : "bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Todas
          </button>
          {OPERADORAS_CHIP.map((o) => (
            <button
              key={o}
              onClick={() => atualizarParam("operadora", o)}
              className={`px-4 py-2 rounded-full font-condensed text-xs font-bold tracking-[1.3px] uppercase transition-colors ${
                data.operadoraFiltro === o ? "bg-[var(--tip-red)] text-white" : "bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
        <select
          value={data.ano}
          onChange={(e) => atualizarParam("ano", e.target.value)}
          className="bg-[var(--bg-surface)] border border-[var(--border-strong)] text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:border-[var(--tip-red)]"
        >
          {data.anosDisponiveis.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <KpiSplit label={`Pedidos em ${data.ano}`} chip={data.pedidosChip} esim={data.pedidosEsim} />
        <KpiSplit label={`Entregues em ${data.ano}`} chip={data.entreguesChip} esim={data.entreguesEsim} />
        <Kpi label="Estoque total" value={data.estoqueTotalGeral.toLocaleString("pt-BR")} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {data.porOperadora.map((g) => (
          <div key={g.operadora} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="font-display text-xl" style={{ color: CORES[g.operadora] || "#fff" }}>{g.operadora}</h3>
              <span className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">
                {g.totalEstoque.toLocaleString("pt-BR")} un.
              </span>
            </div>
            <div className="space-y-3">
              {g.produtos.map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/80 truncate pr-2">{p.nome}</span>
                    <span className="text-[var(--text-muted)] shrink-0">{p.estoque.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--bg-surface-2)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(2, (Math.max(0, p.estoque) / maxEstoqueProduto) * 100)}%`,
                        background: CORES[g.operadora] || "#fff",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 mb-6">
        <TabelaEnvio titulo="Envio de Chip por mês" colunaLabel="Mês" linhas={linhasMesChip} operadoras={data.operadorasChipExibir} badge={`${data.ano}`} />
        {data.operadorasEsimExibir.length > 0 && (
          <TabelaEnvio titulo="Envio de E-sim por mês" colunaLabel="Mês" linhas={linhasMesEsim} operadoras={data.operadorasEsimExibir} badge={`${data.ano}`} />
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl">Envio por semana</h2>
        <select
          value={data.mesSemana}
          onChange={(e) => atualizarParam("mes", e.target.value)}
          className="bg-[var(--bg-input)] border border-[var(--border-strong)] text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[var(--tip-red)]"
        >
          {MESES_NOME.map((nome, i) => (
            <option key={i} value={i + 1}>{nome}</option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <TabelaEnvio titulo="Chip" colunaLabel="Semana" linhas={linhasSemanaChip} operadoras={data.operadorasChipExibir} badge={MESES_NOME[data.mesSemana - 1]} />
        {data.operadorasEsimExibir.length > 0 ? (
          <TabelaEnvio titulo="E-sim" colunaLabel="Semana" linhas={linhasSemanaEsim} operadoras={data.operadorasEsimExibir} badge={MESES_NOME[data.mesSemana - 1]} />
        ) : (
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 flex items-center justify-center">
            <span className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Sem E-sim para esta operadora</span>
          </div>
        )}
      </div>
    </>
  );
}

const CORES_OP: Record<string, string> = {
  Surf: "#818cf8",
  Telecall: "#FF1A2E",
  Arqia: "#fbbf24",
  Valhalla: "#ffffff",
};

function TabelaEnvio({ titulo, colunaLabel, linhas, operadoras, badge }: { titulo: string; colunaLabel: string; linhas: LinhaEnvio[]; operadoras: string[]; badge: string }) {
  const totais = Object.fromEntries(operadoras.map((o) => [o, 0])) as Record<string, number>;
  let totalGeral = 0;
  for (const l of linhas) {
    for (const o of operadoras) totais[o] += l.porOperadora[o] || 0;
    totalGeral += l.total;
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--border)]">
        <h3 className="font-display text-lg">{titulo}</h3>
        <span className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">{badge} · Total <b className="text-white text-sm">{totalGeral.toLocaleString("pt-BR")}</b></span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-condensed tracking-[1.5px] uppercase text-[var(--text-muted)] border-b border-[var(--border)]">
              <th className="text-left px-5 py-2.5 font-normal">{colunaLabel}</th>
              {operadoras.map((o) => (
                <th key={o} className="text-right px-4 py-2.5 font-normal">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: CORES_OP[o] }} />
                    {o}
                  </span>
                </th>
              ))}
              <th className="text-right px-5 py-2.5 font-normal text-white">Total</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l, i) => (
              <tr
                key={l.label}
                className={`${i % 2 === 1 ? "bg-white/[0.015]" : ""} ${l.destaque ? "bg-[var(--tip-red-glow)]" : ""} border-b border-[var(--border)]/50`}
              >
                <td className="px-5 py-2 text-white/80">{l.label}</td>
                {operadoras.map((o) => (
                  <td key={o} className={`text-right px-4 py-2 tabular-nums ${l.porOperadora[o] ? "text-white" : "text-[var(--text-muted)]"}`}>
                    {l.porOperadora[o] ? l.porOperadora[o].toLocaleString("pt-BR") : "—"}
                  </td>
                ))}
                <td className="text-right px-5 py-2 font-medium tabular-nums text-white">{l.total ? l.total.toLocaleString("pt-BR") : "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[var(--border-strong)] bg-[var(--bg-surface-2)]">
              <td className="px-5 py-3 font-display text-sm">Total</td>
              {operadoras.map((o) => (
                <td key={o} className="text-right px-4 py-3 font-display text-sm tabular-nums" style={{ color: CORES_OP[o] }}>
                  {totais[o].toLocaleString("pt-BR")}
                </td>
              ))}
              <td className="text-right px-5 py-3 font-display text-base tabular-nums">{totalGeral.toLocaleString("pt-BR")}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4">
      <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">{label}</div>
      <div className="font-display text-3xl">{value}</div>
    </div>
  );
}

function KpiSplit({ label, chip, esim }: { label: string; chip: number; esim: number }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4">
      <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">{label}</div>
      <div className="font-display text-3xl mb-2">{(chip + esim).toLocaleString("pt-BR")}</div>
      <div className="flex items-center gap-4 text-xs">
        <span className="text-[var(--text-muted)]">Chip <b className="text-white font-medium">{chip.toLocaleString("pt-BR")}</b></span>
        <span className="text-[var(--text-muted)]">E-sim <b className="text-white font-medium">{esim.toLocaleString("pt-BR")}</b></span>
      </div>
    </div>
  );
}
