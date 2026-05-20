"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Mod { id: string; nome: string; ordem: number; tipo: string; perguntas: { id: string }[] }
interface Sessao { id: string; pin: string; parceiro_isp: string; status: string; treinamento: { nome: string } }

export default function Telao({ sessao, modulos }: { sessao: Sessao; modulos: Mod[] }) {
  const supabase = createClient();
  const [participantes, setParticipantes] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, Set<string>>>({}); // pergunta_id -> set de participante_id
  const [moduloAberto, setModuloAberto] = useState<{ id: string; liberadoEm: string } | null>(null);
  const [cronometro, setCronometro] = useState("00:00");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const cronoRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const buscar = async () => {
      const { count: pCount } = await supabase.from("participantes").select("*", { count: "exact", head: true }).eq("sessao_id", sessao.id);
      setParticipantes(pCount || 0);

      const { data: libs } = await supabase
        .from("modulos_liberados").select("modulo_id, liberado_em").eq("sessao_id", sessao.id).is("fechado_em", null)
        .order("liberado_em", { ascending: false }).limit(1);
      if (libs && libs.length > 0) {
        setModuloAberto({ id: libs[0].modulo_id, liberadoEm: libs[0].liberado_em });
      } else {
        setModuloAberto(null);
      }

      // pega respostas distintas por pergunta
      const { data: resps } = await supabase
        .from("respostas")
        .select("pergunta_id, participante_id, participantes!inner(sessao_id)")
        .eq("participantes.sessao_id", sessao.id);
      const map: Record<string, Set<string>> = {};
      resps?.forEach((r: any) => {
        if (!map[r.pergunta_id]) map[r.pergunta_id] = new Set();
        map[r.pergunta_id].add(r.participante_id);
      });
      setRespostas(map);
    };

    buscar();
    pollingRef.current = setInterval(buscar, 1500);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [sessao.id, supabase]);

  useEffect(() => {
    if (!moduloAberto) { setCronometro("00:00"); return; }
    const tick = () => {
      const inicio = new Date(moduloAberto.liberadoEm).getTime();
      const agora = Date.now();
      const seg = Math.max(0, Math.floor((agora - inicio) / 1000));
      const m = Math.floor(seg / 60);
      const s = seg % 60;
      setCronometro(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    cronoRef.current = setInterval(tick, 1000);
    return () => { if (cronoRef.current) clearInterval(cronoRef.current); };
  }, [moduloAberto]);

  const moduloAtual = moduloAberto ? modulos.find((m) => m.id === moduloAberto.id) : null;

  // calcula quantos participantes concluíram o módulo (responderam TODAS as perguntas dele)
  let concluiram = 0;
  if (moduloAtual && moduloAtual.perguntas.length > 0) {
    // pega interseção: participantes que responderam TODAS as perguntas do módulo
    const setsArr = moduloAtual.perguntas.map((p) => respostas[p.id] || new Set<string>());
    if (setsArr.length > 0) {
      const inter = new Set(setsArr[0]);
      for (let i = 1; i < setsArr.length; i++) {
        for (const id of Array.from(inter)) {
          if (!setsArr[i].has(id)) inter.delete(id);
        }
      }
      concluiram = inter.size;
    }
  }
  const totalRespostasModulo = moduloAtual
    ? moduloAtual.perguntas.reduce((sum, p) => sum + (respostas[p.id]?.size || 0), 0)
    : 0;
  const totalEsperadoModulo = moduloAtual ? moduloAtual.perguntas.length * participantes : 0;
  const pctConclusao = participantes > 0 && moduloAtual ? (concluiram / participantes) * 100 : 0;

  return (
    <main className="min-h-screen flex flex-col bg-[var(--bg-page)]">
      {/* Top bar mínimo */}
      <header className="px-8 py-4 flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-tight">
            <span className="text-[var(--tip-red)]">TIP</span> BRASIL
          </span>
          <span className="font-condensed text-[11px] tracking-[3px] uppercase text-[var(--text-muted)] border-l-2 border-[var(--tip-red)] pl-3">
            {sessao.treinamento.nome} · {sessao.parceiro_isp}
          </span>
        </div>
        <a href={`/painel/sessao/${sessao.id}`} className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white">
          ← Controle
        </a>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-6xl w-full">
          {!moduloAtual ? (
            // Estado: sem módulo aberto - mostra o PIN gigante
            <div className="text-center">
              <p className="font-condensed text-base tracking-[4px] uppercase text-[var(--text-muted)] mb-6">
                Acesse pelo navegador
              </p>
              <p className="font-condensed text-lg tracking-[3px] uppercase text-white mb-4">
                provas-tip.vercel.app
              </p>
              <p className="font-condensed text-base tracking-[3px] uppercase text-[var(--text-muted)] mb-8">e digite o PIN</p>

              <div className="inline-block bg-[var(--bg-surface)] border-2 border-[var(--tip-red)] rounded-3xl px-16 py-10 mb-10 shadow-[0_0_60px_rgba(227,6,19,0.25)]">
                <div className="font-display text-9xl md:text-[10rem] text-[var(--tip-red)] tracking-[0.3em] leading-none">{sessao.pin}</div>
              </div>

              <div className="flex items-baseline justify-center gap-4">
                <div className="font-display text-7xl">{participantes}</div>
                <div className="font-condensed text-lg tracking-[3px] uppercase text-[var(--text-muted)]">
                  {participantes === 1 ? "Conectado" : "Conectados"}
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Aguardando liberação de módulo
              </div>
            </div>
          ) : (
            // Estado: módulo aberto
            <div>
              {/* Header do módulo */}
              <div className="text-center mb-10">
                <p className="font-condensed text-sm tracking-[4px] uppercase text-[var(--text-muted)] mb-2">
                  Módulo {moduloAtual.ordem} em andamento
                </p>
                <h1 className="font-display text-6xl md:text-7xl tracking-tight">{moduloAtual.nome}</h1>
              </div>

              {/* Cards principais */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                {/* Cronômetro */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 text-center">
                  <div className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-3">Tempo decorrido</div>
                  <div className="font-display text-7xl text-white tabular-nums tracking-tight">{cronometro}</div>
                </div>

                {/* Concluíram */}
                <div className="bg-[var(--bg-surface)] border-2 border-[var(--tip-red)] rounded-3xl p-8 text-center shadow-[0_0_40px_rgba(227,6,19,0.15)]">
                  <div className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-3">Concluíram</div>
                  <div className="font-display text-7xl text-[var(--tip-red)] tabular-nums">
                    {concluiram}<span className="text-[var(--text-muted)] text-4xl">/{participantes}</span>
                  </div>
                  <div className="font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)] mt-2">
                    {pctConclusao.toFixed(0)}%
                  </div>
                </div>

                {/* Respostas totais */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 text-center">
                  <div className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-3">Respostas registradas</div>
                  <div className="font-display text-7xl text-blue-400 tabular-nums">
                    {totalRespostasModulo}<span className="text-[var(--text-muted)] text-4xl">/{totalEsperadoModulo}</span>
                  </div>
                  <div className="font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)] mt-2">
                    {moduloAtual.perguntas.length} pergunta{moduloAtual.perguntas.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Barra de progresso gigante */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-condensed text-sm tracking-[3px] uppercase text-[var(--text-muted)]">
                    Progresso da turma
                  </div>
                  <div className="font-display text-4xl tabular-nums">{pctConclusao.toFixed(0)}%</div>
                </div>
                <div className="h-6 bg-[var(--bg-page)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div className="h-full bg-gradient-to-r from-[var(--tip-red)] to-red-400 transition-all duration-700 ease-out flex items-center justify-end pr-3"
                    style={{ width: `${pctConclusao}%` }}>
                    {pctConclusao > 10 && <span className="font-condensed text-xs text-white tracking-[1.5px] font-bold">{concluiram} pessoas</span>}
                  </div>
                </div>

                {/* CTA grande quando faltam pessoas */}
                {pctConclusao < 100 && (
                  <div className="mt-6 text-center">
                    <p className="font-display text-3xl">
                      <span className="text-[var(--tip-red)]">{participantes - concluiram}</span>
                      <span className="text-[var(--text-muted)] text-xl ml-3 tracking-[2px] font-condensed uppercase">
                        {participantes - concluiram === 1 ? "pessoa ainda respondendo" : "pessoas ainda respondendo"}
                      </span>
                    </p>
                  </div>
                )}
                {pctConclusao === 100 && participantes > 0 && (
                  <div className="mt-6 text-center font-display text-3xl text-green-400">✓ Todos concluíram!</div>
                )}
              </div>

              {/* Lembrete do PIN no rodapé */}
              <div className="mt-8 text-center font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)]">
                Atrasados? Entrem em <span className="text-white">provas-tip.vercel.app</span> · PIN <span className="font-display text-[var(--tip-red)] text-lg tracking-widest">{sessao.pin}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
