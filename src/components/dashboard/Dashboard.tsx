"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import type { DashboardData } from "@/lib/dashboard/data";

interface Props {
  data: DashboardData;
  filtros: { inicio?: string; fim?: string; palestranteId?: string; treinamentoId?: string; isp?: string };
  basePath: string;       // "/admin" ou "/painel/dashboard"
  showPalestranteFiltro?: boolean;
}

const COLORS = ["#E30613", "#3B82F6", "#22C55E", "#F59E0B", "#A855F7", "#06B6D4", "#EF4444", "#84CC16"];

export default function Dashboard({ data, filtros, basePath, showPalestranteFiltro }: Props) {
  const router = useRouter();
  const [f, setF] = useState({
    inicio: filtros.inicio || "",
    fim: filtros.fim || "",
    palestranteId: filtros.palestranteId || "",
    treinamentoId: filtros.treinamentoId || "",
    isp: filtros.isp || "",
  });

  const aplicar = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => v && params.set(k, v));
    router.push(`${basePath}?${params.toString()}`);
  };
  const limpar = () => {
    setF({ inicio: "", fim: "", palestranteId: "", treinamentoId: "", isp: "" });
    router.push(basePath);
  };
  const presetPeriodo = (dias: number) => {
    const fim = new Date();
    const inicio = new Date(); inicio.setDate(inicio.getDate() - dias);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    setF((p) => ({ ...p, inicio: fmt(inicio), fim: fmt(fim) }));
  };

  const semDados = data.resumo.sessoes === 0;

  return (
    <section className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">DASHBOARD</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-6 ml-5">Visão geral dos treinamentos</p>

      {/* FILTROS */}
      <form onSubmit={aplicar} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 mb-8">
        <div className="grid md:grid-cols-6 gap-3">
          <div>
            <label className="block font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mb-1">De</label>
            <input type="date" value={f.inicio} onChange={(e) => setF({ ...f, inicio: e.target.value })}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 text-sm rounded-lg outline-none focus:border-[var(--tip-red)]" />
          </div>
          <div>
            <label className="block font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mb-1">Até</label>
            <input type="date" value={f.fim} onChange={(e) => setF({ ...f, fim: e.target.value })}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 text-sm rounded-lg outline-none focus:border-[var(--tip-red)]" />
          </div>
          {showPalestranteFiltro && (
            <div>
              <label className="block font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mb-1">Palestrante</label>
              <select value={f.palestranteId} onChange={(e) => setF({ ...f, palestranteId: e.target.value })}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 text-sm rounded-lg outline-none focus:border-[var(--tip-red)]">
                <option value="">Todos</option>
                {data.filtros.palestrantes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mb-1">Treinamento</label>
            <select value={f.treinamentoId} onChange={(e) => setF({ ...f, treinamentoId: e.target.value })}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 text-sm rounded-lg outline-none focus:border-[var(--tip-red)]">
              <option value="">Todos</option>
              {data.filtros.treinamentos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] mb-1">ISP</label>
            <input type="text" value={f.isp} onChange={(e) => setF({ ...f, isp: e.target.value })}
              placeholder="Buscar ISP..."
              className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-3 py-2 text-sm rounded-lg outline-none focus:border-[var(--tip-red)]" />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="flex-1 bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white py-2 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg">Aplicar</button>
            <button type="button" onClick={limpar} className="bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-white px-3 py-2 font-condensed text-xs tracking-[1.3px] uppercase rounded-lg">×</button>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Preset onClick={() => presetPeriodo(7)}>7 dias</Preset>
          <Preset onClick={() => presetPeriodo(30)}>30 dias</Preset>
          <Preset onClick={() => presetPeriodo(90)}>90 dias</Preset>
          <Preset onClick={() => presetPeriodo(365)}>1 ano</Preset>
        </div>
      </form>

      {semDados ? (
        <EmptyState />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <Kpi label="Sessões" value={data.resumo.sessoes} accent="red" />
            <Kpi label="Em andamento" value={data.resumo.sessoesAtivas} accent="green" />
            <Kpi label="Participantes" value={data.resumo.participantes} accent="blue" />
            <Kpi label="Treinamentos" value={data.resumo.treinamentos} accent="purple" />
            <Kpi label="Nota Média" value={`${data.resumo.notaMedia.toFixed(1)}%`}
              accent={data.resumo.notaMedia >= 70 ? "green" : data.resumo.notaMedia >= 50 ? "amber" : "red"} />
            <Kpi label="Taxa Conclusão" value={`${data.resumo.taxaConclusao.toFixed(0)}%`} accent="amber" />
          </div>

          {/* LINHA TEMPORAL */}
          <Card title="Evolução no tempo" subtitle="Sessões e participantes por dia">
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={data.porPeriodo}>
                  <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" stroke="#8A8A8A" fontSize={11} tickFormatter={(v) => {
                    const [, m, d] = v.split("-"); return `${d}/${m}`;
                  }} />
                  <YAxis stroke="#8A8A8A" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0F0F0F", border: "1px solid #222", borderRadius: 8 }} labelStyle={{ color: "#8A8A8A" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="sessoes" name="Sessões" stroke="#E30613" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="participantes" name="Participantes" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            {/* DISTRIBUIÇÃO DE NOTAS */}
            <Card title="Distribuição de notas" subtitle="Quantos participantes em cada faixa">
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={data.distribuicaoNotas}>
                    <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" />
                    <XAxis dataKey="faixa" stroke="#8A8A8A" fontSize={11} />
                    <YAxis stroke="#8A8A8A" fontSize={11} />
                    <Tooltip contentStyle={{ background: "#0F0F0F", border: "1px solid #222", borderRadius: 8 }} />
                    <Bar dataKey="qtd" name="Participantes" radius={[4, 4, 0, 0]}>
                      {data.distribuicaoNotas.map((d, i) => <Cell key={i} fill={d.cor} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* TOP ISPs */}
            <Card title="Top 10 Parceiros (ISPs)" subtitle="Por participantes">
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={data.porISP} layout="vertical">
                    <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" />
                    <XAxis type="number" stroke="#8A8A8A" fontSize={11} />
                    <YAxis type="category" dataKey="isp" stroke="#8A8A8A" fontSize={11} width={120} />
                    <Tooltip contentStyle={{ background: "#0F0F0F", border: "1px solid #222", borderRadius: 8 }} />
                    <Bar dataKey="participantes" name="Participantes" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            {/* TREINAMENTOS */}
            <Card title="Treinamentos" subtitle="Volume e nota média">
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={data.porTreinamento}>
                    <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" />
                    <XAxis dataKey="nome" stroke="#8A8A8A" fontSize={10} angle={-15} textAnchor="end" height={60} />
                    <YAxis yAxisId="l" stroke="#8A8A8A" fontSize={11} />
                    <YAxis yAxisId="r" orientation="right" stroke="#22C55E" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "#0F0F0F", border: "1px solid #222", borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId="l" dataKey="participantes" name="Participantes" fill="#E30613" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="r" type="monotone" dataKey="notaMedia" name="Nota Média %" stroke="#22C55E" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* PALESTRANTES OU PIE DE TREINAMENTOS */}
            {showPalestranteFiltro ? (
              <Card title="Palestrantes" subtitle="Participantes por palestrante">
                <div className="h-72">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={data.porPalestrante} dataKey="participantes" nameKey="nome"
                        cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                        {data.porPalestrante.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0F0F0F", border: "1px solid #222", borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            ) : (
              <Card title="Distribuição por treinamento" subtitle="">
                <div className="h-72">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={data.porTreinamento} dataKey="participantes" nameKey="nome"
                        cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                        {data.porTreinamento.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0F0F0F", border: "1px solid #222", borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>

          {/* TOP PERGUNTAS ERRADAS */}
          <Card title="Perguntas com menor taxa de acerto" subtitle="Reforçar no próximo treinamento" className="mt-6">
            <div className="space-y-3">
              {data.topPerguntasErradas.length === 0 && (
                <p className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] text-center py-6">Sem dados suficientes</p>
              )}
              {data.topPerguntasErradas.map((p, i) => (
                <div key={i} className="border border-[var(--border)] rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)] mb-1">
                        {p.treinamento} · {p.modulo}
                      </div>
                      <p className="text-sm">{p.enunciado}</p>
                    </div>
                    <div className="text-right">
                      <div className={`font-display text-2xl ${p.taxaAcerto >= 70 ? "text-green-400" : p.taxaAcerto >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {p.taxaAcerto.toFixed(0)}%
                      </div>
                      <div className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">{p.total} resp.</div>
                    </div>
                  </div>
                  <div className="w-full bg-[var(--bg-surface-2)] rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full transition-all ${p.taxaAcerto >= 70 ? "bg-green-400" : p.taxaAcerto >= 50 ? "bg-yellow-400" : "bg-red-400"}`}
                      style={{ width: `${p.taxaAcerto}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </section>
  );
}

function Kpi({ label, value, accent }: { label: string; value: any; accent: "red" | "green" | "blue" | "amber" | "purple" }) {
  const colors: Record<string, string> = {
    red: "text-[var(--tip-red)]",
    green: "text-green-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
    purple: "text-purple-400",
  };
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4">
      <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">{label}</div>
      <div className={`font-display text-3xl ${colors[accent]}`}>{value}</div>
    </div>
  );
}

function Card({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 ${className}`}>
      <div className="mb-4">
        <div className="font-display text-lg">{title}</div>
        {subtitle && <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Preset({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)] hover:text-white bg-[var(--bg-surface-2)] border border-[var(--border)] hover:border-[var(--tip-red)] px-3 py-1.5 rounded-md">
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-16 text-center">
      <div className="w-3 h-3 rounded-full bg-[var(--tip-red)] mx-auto mb-4 opacity-50"></div>
      <p className="font-display text-xl mb-2">Sem dados no período</p>
      <p className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Realize sessões ou ajuste os filtros</p>
    </div>
  );
}
