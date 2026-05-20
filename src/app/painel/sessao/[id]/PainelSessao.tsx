"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

interface Modulo { id: string; nome: string; ordem: number; tipo: string; perguntas: { id: string; ordem: number }[] }
interface Liberado { modulo_id: string; liberado_em: string; fechado_em: string | null }
interface Sessao { id: string; pin: string; parceiro_isp: string; data_hora: string; qtd_esperada: number | null; status: string; treinamento: { nome: string } }

export default function PainelSessao({ sessao, modulos, liberadosIniciais }: { sessao: Sessao; modulos: Modulo[]; liberadosIniciais: Liberado[] }) {
  const router = useRouter();
  const [liberados, setLiberados] = useState<Liberado[]>(liberadosIniciais);
  const [participantes, setParticipantes] = useState(0);
  const [respostasPorPergunta, setRespostasPorPergunta] = useState<Record<string, number>>({});
  const [acao, setAcao] = useState<string | null>(null);
  const [emitindo, setEmitindo] = useState(false);
  const [resultadoEmissao, setResultadoEmissao] = useState<any>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const buscarTudo = async () => {
      const { count: pCount } = await supabase.from("participantes").select("*", { count: "exact", head: true }).eq("sessao_id", sessao.id);
      setParticipantes(pCount || 0);

      const { data: respostas } = await supabase
        .from("respostas").select("pergunta_id, participantes!inner(sessao_id)").eq("participantes.sessao_id", sessao.id);
      const map: Record<string, number> = {};
      respostas?.forEach((r: any) => { map[r.pergunta_id] = (map[r.pergunta_id] || 0) + 1 });
      setRespostasPorPergunta(map);

      const { data: libs } = await supabase
        .from("modulos_liberados").select("modulo_id, liberado_em, fechado_em").eq("sessao_id", sessao.id);
      setLiberados(libs || []);
    };

    buscarTudo();
    pollingRef.current = setInterval(buscarTudo, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [sessao.id, supabase]);

  const liberar = async (modulo_id: string) => {
    setAcao(modulo_id);
    const res = await fetch(`/api/sessoes/${sessao.id}/liberar`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ modulo_id }),
    });
    if (res.ok) {
      const novo: Liberado = { modulo_id, liberado_em: new Date().toISOString(), fechado_em: null };
      setLiberados((l) => [...l.filter((x) => x.modulo_id !== modulo_id), novo]);
    }
    setAcao(null);
  };

  const fechar = async (modulo_id: string) => {
    setAcao(modulo_id);
    const res = await fetch(`/api/sessoes/${sessao.id}/fechar-modulo`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ modulo_id }),
    });
    if (res.ok) setLiberados((l) => l.map((x) => x.modulo_id === modulo_id ? { ...x, fechado_em: new Date().toISOString() } : x));
    setAcao(null);
  };

  const encerrar = async () => {
    if (!confirm("Encerrar a sessão? Após isso, ninguém mais poderá responder.")) return;
    await fetch(`/api/sessoes/${sessao.id}/encerrar`, { method: "POST" });
    router.refresh();
  };

  const emitirCertificados = async () => {
    if (!confirm("Emitir certificados para quem respondeu TODAS as perguntas obrigatórias?")) return;
    setEmitindo(true); setResultadoEmissao(null);
    const res = await fetch(`/api/sessoes/${sessao.id}/emitir-certificados`, { method: "POST" });
    const j = await res.json();
    setResultadoEmissao(j);
    setEmitindo(false);
  };

  const statusModulo = (modulo_id: string) => liberados.find((l) => l.modulo_id === modulo_id);
  const todosFechados = modulos.length > 0 && modulos.every((m) => {
    const st = statusModulo(m.id);
    return st && st.fechado_em;
  });

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] px-8 py-4 flex items-center justify-between bg-[var(--bg-surface-2)]">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-tight">
            <span className="text-[var(--tip-red)]">TIP</span> BRASIL
          </span>
          <span className="font-condensed text-[11px] tracking-[3px] uppercase text-[var(--text-muted)] border-l-2 border-[var(--tip-red)] pl-3">
            Controle de Sessão
          </span>
        </div>
        <a href="/painel" className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white">← Sessões</a>
      </header>

      <section className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="mb-6 flex justify-end gap-3 flex-wrap">
          <a href={`/painel/sessao/${sessao.id}/telao`} target="_blank"
            className="inline-flex items-center gap-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-2)] border border-[var(--tip-red)] text-[var(--tip-red)] px-5 py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all">
            ⤢ Abrir Telão
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">PIN da Sessão</div>
            <div className="font-display text-5xl text-[var(--tip-red)] tracking-widest">{sessao.pin}</div>
            <div className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] mt-3">Compartilhe com a turma</div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">Participantes Conectados</div>
            <div className="font-display text-5xl">{participantes}{sessao.qtd_esperada && <span className="text-[var(--text-muted)] text-2xl ml-2">/ {sessao.qtd_esperada}</span>}</div>
            <div className="font-condensed text-xs tracking-[2px] uppercase text-green-400 mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Atualização ao vivo
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">Treinamento</div>
            <div className="font-display text-xl leading-tight mb-1">{sessao.treinamento.nome}</div>
            <div className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)]">{sessao.parceiro_isp}</div>
            {sessao.status === "ativa" ? (
              <button onClick={encerrar}
                className="mt-4 text-xs font-condensed tracking-[1.5px] uppercase text-red-400 hover:text-red-300">
                Encerrar sessão →
              </button>
            ) : (
              <span className="inline-block mt-4 font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)]">Encerrada</span>
            )}
          </div>
        </div>

        {/* BLOCO CERTIFICADOS */}
        <div className="bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-surface-2)] border-2 border-[var(--tip-red)]/30 rounded-2xl p-6 mb-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--tip-red)]/10 border border-[var(--tip-red)]/40 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[var(--tip-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <div className="font-display text-xl">Certificados</div>
                <p className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)]">
                  Emite para quem respondeu todas as perguntas obrigatórias
                </p>
              </div>
            </div>
            <button onClick={emitirCertificados} disabled={emitindo || sessao.status === "ativa"}
              className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all flex items-center gap-2">
              {emitindo ? "Emitindo..." : "Emitir Certificados"}
            </button>
          </div>
          {sessao.status === "ativa" && (
            <p className="mt-3 font-condensed text-[11px] tracking-[1.5px] uppercase text-amber-400">
              Encerre a sessão antes de emitir os certificados
            </p>
          )}
          {resultadoEmissao && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="font-condensed text-xs tracking-[1.5px] uppercase text-green-400 mb-2">Resultado</div>
              <div className="text-sm space-y-1">
                <div>✓ <span className="font-bold text-green-400">{resultadoEmissao.emitidos}</span> certificado(s) emitido(s)</div>
                {resultadoEmissao.jaExistiam > 0 && <div className="text-[var(--text-muted)]">↻ {resultadoEmissao.jaExistiam} já tinham certificado</div>}
                {resultadoEmissao.pulados > 0 && <div className="text-amber-400">⚠ {resultadoEmissao.pulados} participante(s) não responderam tudo (não receberão)</div>}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-3 mb-4">
          <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
          <h1 className="font-display text-4xl tracking-tight leading-none">MÓDULOS</h1>
        </div>
        <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">Libere conforme avança no treinamento</p>

        <div className="space-y-4">
          {modulos.map((m) => {
            const st = statusModulo(m.id);
            const isLiberado = !!st && !st.fechado_em;
            const isFechado = !!st?.fechado_em;
            const totalPerguntas = m.perguntas.length;
            const totalRespostas = m.perguntas.reduce((sum, p) => sum + (respostasPorPergunta[p.id] || 0), 0);

            return (
              <div key={m.id} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-1">
                      Módulo {m.ordem}{m.tipo === "feedback" && " · Feedback"}
                    </div>
                    <div className="font-display text-2xl">{m.nome}</div>
                    <div className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)] mt-2">
                      {totalPerguntas} pergunta{totalPerguntas !== 1 ? "s" : ""}
                      {(isLiberado || isFechado) && <> · <span className="text-white">{totalRespostas}</span> respostas totais</>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!st && sessao.status === "ativa" && (
                      <button onClick={() => liberar(m.id)} disabled={acao === m.id}
                        className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white px-5 py-2.5 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all">
                        Liberar
                      </button>
                    )}
                    {isLiberado && (
                      <>
                        <span className="font-condensed text-[11px] tracking-[1.5px] uppercase text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Aberto
                        </span>
                        {sessao.status === "ativa" && (
                          <button onClick={() => fechar(m.id)} disabled={acao === m.id}
                            className="bg-[var(--bg-surface-2)] hover:bg-[var(--border)] border border-[var(--border-strong)] text-white px-5 py-2.5 font-condensed text-sm tracking-[1.3px] uppercase rounded-lg transition-all">
                            Fechar
                          </button>
                        )}
                      </>
                    )}
                    {isFechado && (
                      <span className="font-condensed text-[11px] tracking-[1.5px] uppercase text-[var(--text-muted)] bg-[var(--bg-surface-2)] border border-[var(--border)] px-3 py-1 rounded-full">
                        Fechado
                      </span>
                    )}
                  </div>
                </div>

                {(isLiberado || isFechado) && (
                  <div className="mt-5 pt-5 border-t border-[var(--border)] space-y-2">
                    {m.perguntas.sort((a, b) => a.ordem - b.ordem).map((p) => {
                      const c = respostasPorPergunta[p.id] || 0;
                      const pct = participantes > 0 ? Math.min(100, (c / participantes) * 100) : 0;
                      return (
                        <div key={p.id} className="flex items-center gap-4">
                          <span className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--text-muted)] w-20">Pergunta {p.ordem}</span>
                          <div className="flex-1 bg-[var(--bg-surface-2)] rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-[var(--tip-red)] transition-all duration-500" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="font-condensed text-sm font-bold w-20 text-right">{c} / {participantes}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
