"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

interface Alt { id: string; texto: string; ordem: number }
interface Perg { id: string; enunciado: string; tipo: string; ordem: number; alternativas: Alt[] }
interface Mod { id: string; nome: string; ordem: number; tipo: string; perguntas: Perg[] }

export default function Responder({ pin, sessaoId, sessaoStatus, treinamentoNome, modulos }: {
  pin: string; sessaoId: string; sessaoStatus: string; treinamentoNome: string; modulos: Mod[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [participanteId, setParticipanteId] = useState<string | null>(null);
  const [liberados, setLiberados] = useState<Set<string>>(new Set());
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [enviando, setEnviando] = useState(false);
  const [sessaoEncerrada, setSessaoEncerrada] = useState(sessaoStatus === "encerrada");
  const [moduloAtivoId, setModuloAtivoId] = useState<string | null>(null);
  const [perguntaIdx, setPerguntaIdx] = useState(0);
  const [respostaTemp, setRespostaTemp] = useState<any>(null);
  const [moduloConcluido, setModuloConcluido] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const pid = localStorage.getItem(`participante:${pin}`);
    if (!pid) { router.replace(`/prova/${pin}`); return; }
    setParticipanteId(pid);

    const buscarEstado = async () => {
      const { data: libs } = await supabase
        .from("modulos_liberados").select("modulo_id").eq("sessao_id", sessaoId).is("fechado_em", null);
      setLiberados(new Set(libs?.map((l) => l.modulo_id) || []));

      const { data: ss } = await supabase.from("sessoes").select("status").eq("id", sessaoId).single();
      if (ss?.status === "encerrada") setSessaoEncerrada(true);

      const { data: rs } = await supabase
        .from("respostas").select("pergunta_id, alternativa_id, valor_escala, texto_resposta").eq("participante_id", pid);
      const map: Record<string, any> = {};
      rs?.forEach((r) => { map[r.pergunta_id] = r.alternativa_id || r.valor_escala || r.texto_resposta });
      setRespostas(map);
    };

    buscarEstado();
    pollingRef.current = setInterval(buscarEstado, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [pin, sessaoId, supabase, router]);

  // Quando muda os módulos liberados, identifica qual mostrar
  useEffect(() => {
    // procura o primeiro módulo liberado que tem pergunta não respondida pela pessoa
    const modulosOrdenados = [...modulos].sort((a, b) => a.ordem - b.ordem);
    let proximoModulo: string | null = null;
    let proximoIdx = 0;

    for (const m of modulosOrdenados) {
      if (!liberados.has(m.id)) continue;
      const perguntasOrdenadas = [...m.perguntas].sort((a, b) => a.ordem - b.ordem);
      const idxNaoResp = perguntasOrdenadas.findIndex((p) => !respostas[p.id]);
      if (idxNaoResp >= 0) {
        proximoModulo = m.id;
        proximoIdx = idxNaoResp;
        break;
      }
    }

    if (proximoModulo) {
      // se mudou de módulo, mostra "concluído" antes de avançar
      if (moduloAtivoId && moduloAtivoId !== proximoModulo) {
        setModuloConcluido(true);
        setTimeout(() => {
          setModuloConcluido(false);
          setModuloAtivoId(proximoModulo);
          setPerguntaIdx(proximoIdx);
          setRespostaTemp(null);
        }, 2500);
      } else {
        setModuloAtivoId(proximoModulo);
        setPerguntaIdx(proximoIdx);
        setRespostaTemp(null);
      }
    } else {
      // todos os liberados foram respondidos
      if (moduloAtivoId) setModuloConcluido(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liberados, respostas, modulos]);

  const responder = async (perguntaId: string, valor: any, tipo: string) => {
    if (!participanteId) return;
    setEnviando(true);
    setRespostas((p) => ({ ...p, [perguntaId]: valor }));
    await fetch("/api/prova/responder", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participante_id: participanteId, pergunta_id: perguntaId, tipo, valor }),
    });
    setRespostaTemp(null);
    setEnviando(false);
  };

  if (sessaoEncerrada) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header treinamento={treinamentoNome} pin={pin} />
        <section className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <h2 className="font-display text-3xl mb-4">Sessão Encerrada</h2>
            <p className="font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)] mb-6">Veja sua nota final</p>
            <a href={`/prova/${pin}/fim`} className="inline-block bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-6 py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg">
              Ver Resultado
            </a>
          </div>
        </section>
      </main>
    );
  }

  const moduloAtivo = modulos.find((m) => m.id === moduloAtivoId);
  const perguntasMod = moduloAtivo ? [...moduloAtivo.perguntas].sort((a, b) => a.ordem - b.ordem) : [];
  const perguntaAtual = perguntasMod[perguntaIdx];
  const totalPerg = perguntasMod.length;
  const respondidasMod = perguntasMod.filter((p) => respostas[p.id]).length;
  const todasLiberadasRespondidas = modulos.filter((m) => liberados.has(m.id))
    .every((m) => m.perguntas.every((p) => respostas[p.id]));

  // Tela "concluído"
  if (moduloConcluido) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header treinamento={treinamentoNome} pin={pin} />
        <section className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-400 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-3xl mb-3">Módulo Concluído!</h2>
            <p className="font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">
              {todasLiberadasRespondidas ? "Aguarde o próximo módulo" : "Próximo carregando..."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  // Tela aguardando
  if (!moduloAtivo || !perguntaAtual) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header treinamento={treinamentoNome} pin={pin} />
        <section className="flex-1 flex items-center justify-center px-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 text-center max-w-md w-full">
            <div className="w-3 h-3 rounded-full bg-[var(--tip-red)] mx-auto mb-4 animate-pulse"></div>
            <p className="font-display text-xl mb-2">Aguardando o palestrante</p>
            <p className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">
              As perguntas aparecerão aqui quando forem liberadas
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header treinamento={treinamentoNome} pin={pin} />

      {/* Barra de progresso */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-surface-2)] px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="font-display text-base">{moduloAtivo.nome}</span>
              <span className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">
                {perguntaIdx + 1} / {totalPerg}
              </span>
            </div>
            <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--tip-red)] transition-all duration-300"
                style={{ width: `${((perguntaIdx + 1) / totalPerg) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <section className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-2xl w-full">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8">
            <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-3">
              Pergunta {perguntaIdx + 1}
            </div>
            <h2 className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">{perguntaAtual.enunciado}</h2>

            {perguntaAtual.tipo === "multipla_escolha" && (
              <div className="space-y-3">
                {perguntaAtual.alternativas.sort((a, b) => a.ordem - b.ordem).map((a, i) => {
                  const selected = respostaTemp === a.id;
                  const letras = ["A", "B", "C", "D", "E", "F"];
                  return (
                    <button key={a.id} type="button" disabled={enviando}
                      onClick={() => setRespostaTemp(a.id)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center gap-4 ${
                        selected
                          ? "bg-[var(--tip-red)]/10 border-[var(--tip-red)]"
                          : "bg-[var(--bg-input)] border-[var(--border-strong)] hover:border-[var(--text-muted)]"
                      } disabled:opacity-60`}>
                      <span className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center font-display text-lg ${
                        selected ? "bg-[var(--tip-red)] text-white" : "bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-[var(--text-muted)]"
                      }`}>{letras[i]}</span>
                      <span className="text-base">{a.texto}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {perguntaAtual.tipo === "escala" && (
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((n) => {
                  const labels = ["Discordo totalmente", "Discordo", "Não sei", "Concordo", "Concordo plenamente"];
                  const selected = respostaTemp === n;
                  return (
                    <button key={n} type="button" disabled={enviando}
                      onClick={() => setRespostaTemp(n)}
                      className={`py-5 px-2 rounded-xl border text-center transition-all ${
                        selected ? "bg-[var(--tip-red)]/10 border-[var(--tip-red)]" : "bg-[var(--bg-input)] border-[var(--border-strong)] hover:border-[var(--text-muted)]"
                      } disabled:opacity-60`}>
                      <div className="font-display text-3xl mb-1">{n}</div>
                      <div className="font-condensed text-[10px] tracking-[1px] uppercase text-[var(--text-muted)] leading-tight">{labels[n - 1]}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {perguntaAtual.tipo === "texto_longo" && (
              <textarea rows={5} value={respostaTemp || ""}
                onChange={(e) => setRespostaTemp(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-xl outline-none focus:border-[var(--tip-red)] resize-none text-base" />
            )}

            <div className="mt-8">
              <button
                disabled={enviando || respostaTemp === null || respostaTemp === ""}
                onClick={() => responder(perguntaAtual.id, respostaTemp, perguntaAtual.tipo)}
                className="w-full bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 font-condensed text-base font-bold tracking-[1.3px] uppercase rounded-xl transition-all">
                {enviando ? "Enviando..." : perguntaIdx + 1 === totalPerg ? "Finalizar módulo" : "Próxima pergunta"}
              </button>
            </div>
          </div>

          <div className="mt-4 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">
            Respondidas {respondidasMod} de {totalPerg}
          </div>
        </div>
      </section>
    </main>
  );
}

function Header({ treinamento, pin }: { treinamento: string; pin: string }) {
  return (
    <header className="border-b border-[var(--border)] px-6 py-3 flex items-center justify-between bg-[var(--bg-surface-2)] sticky top-0 z-10">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-lg tracking-tight">
          <span className="text-[var(--tip-red)]">TIP</span> BRASIL
        </span>
        <span className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] border-l-2 border-[var(--tip-red)] pl-2">
          {treinamento}
        </span>
      </div>
      <span className="font-condensed text-[11px] tracking-[2px] uppercase text-[var(--text-muted)]">PIN {pin}</span>
    </header>
  );
}
