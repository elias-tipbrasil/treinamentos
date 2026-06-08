import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";

export default async function Page({ params }: { params: Promise<{ sessaoId: string }> }) {
  const { sessaoId } = await params;
  const supabase = createAdminClient();

  const { data: sessao } = await supabase
    .from("sessoes")
    .select("id, pin, parceiro_isp, data_hora, status, qtd_esperada, treinamento_id, treinamento:treinamentos(id, nome)")
    .eq("id", sessaoId).single();
  if (!sessao) notFound();

  const { data: modulos } = await supabase
    .from("modulos")
    .select("id, nome, ordem, tipo, perguntas(id, enunciado, tipo, ordem, vale_nota, alternativas(id, texto, correta, ordem))")
    .eq("treinamento_id", sessao.treinamento_id)
    .order("ordem");

  const { data: participantes } = await supabase
    .from("participantes")
    .select("id, nome, email, entrou_em, respostas(pergunta_id, alternativa_id, valor_escala, texto_resposta)")
    .eq("sessao_id", sessaoId)
    .order("nome");

  const allPergs = (modulos || []).flatMap((m: any) => m.perguntas);
  const pergsValeNota = allPergs.filter((p: any) => p.vale_nota);
  const correctMap: Record<string, string> = {};
  allPergs.forEach((p: any) => {
    const c = p.alternativas?.find((a: any) => a.correta);
    if (c) correctMap[p.id] = c.id;
  });

  const ranking = (participantes || []).map((p: any) => {
    const respMap = new Map(p.respostas.map((r: any) => [r.pergunta_id, r.alternativa_id]));
    let acertos = 0;
    pergsValeNota.forEach((perg: any) => {
      if (respMap.get(perg.id) && respMap.get(perg.id) === correctMap[perg.id]) acertos++;
    });
    return { ...p, acertos, total: pergsValeNota.length, pct: pergsValeNota.length ? (acertos / pergsValeNota.length) * 100 : 0 };
  }).sort((a: any, b: any) => b.pct - a.pct);

  const media = ranking.length ? ranking.reduce((s, r) => s + r.pct, 0) / ranking.length : 0;
  const aprovados = ranking.filter((r) => r.pct >= 70).length;
  const faixas = [
    { label: "≥ 70%", cor: "#22c55e", n: ranking.filter((r) => r.pct >= 70).length },
    { label: "50–69%", cor: "#eab308", n: ranking.filter((r) => r.pct >= 50 && r.pct < 70).length },
    { label: "< 50%", cor: "#ef4444", n: ranking.filter((r) => r.pct < 50).length },
  ];

  // respostas agrupadas por pergunta
  const respByPerg: Record<string, any[]> = {};
  (participantes || []).forEach((p: any) => {
    p.respostas.forEach((r: any) => {
      (respByPerg[r.pergunta_id] = respByPerg[r.pergunta_id] || []).push({ nome: p.nome, ...r });
    });
  });

  return (
    <section className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
      <Link href="/admin/relatorios" className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white mb-4 inline-block">← Relatórios</Link>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">{(sessao.treinamento as any).nome}</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-6 ml-5">
        {sessao.parceiro_isp} · {new Date(sessao.data_hora).toLocaleString("pt-BR")} · PIN {sessao.pin}
      </p>

      <div className="flex gap-3 mb-8 flex-wrap">
        <a href={`/api/admin/relatorios/${sessaoId}/export?formato=csv`} download
          className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-4 py-2.5 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg">⬇ Exportar CSV</a>
        <a href={`/api/admin/relatorios/${sessaoId}/export?formato=excel`} download
          className="bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:border-[var(--tip-red)] text-white px-4 py-2.5 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg">⬇ Exportar Excel</a>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card label="Participantes" value={participantes?.length || 0} />
        <Card label="Média geral" value={`${media.toFixed(1)}%`} />
        <Card label="Aprovados (≥70%)" value={`${aprovados}/${ranking.length}`} />
        <Card label="Status" value={sessao.status} />
      </div>

      {/* Distribuição de notas */}
      {ranking.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 mb-10">
          <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-4">Distribuição de notas</div>
          <div className="space-y-3">
            {faixas.map((f) => {
              const pct = ranking.length ? (f.n / ranking.length) * 100 : 0;
              return (
                <div key={f.label} className="flex items-center gap-3 text-xs">
                  <span className="w-16 text-[var(--text-muted)]">{f.label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-surface-2)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: f.cor }} />
                  </div>
                  <span className="w-10 text-right">{f.n}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ranking */}
      <h2 className="font-display text-2xl mb-3">Participantes</h2>
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden mb-10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-surface-2)]">
              <Th>#</Th><Th>Nome</Th><Th>E-mail</Th><Th>Acertos</Th><Th>Nota</Th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((p, i) => (
              <tr key={p.id} className="border-b border-[var(--border)]">
                <td className="px-4 py-3 text-sm text-[var(--text-muted)] w-12">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">{p.nome}</td>
                <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{p.email}</td>
                <td className="px-4 py-3 text-sm">{p.acertos} / {p.total}</td>
                <td className="px-4 py-3"><span className={`font-condensed font-bold ${p.pct >= 70 ? "text-green-400" : p.pct >= 50 ? "text-yellow-400" : "text-red-400"}`}>{p.pct.toFixed(0)}%</span></td>
              </tr>
            ))}
            {ranking.length === 0 && (<tr><td colSpan={5} className="px-6 py-12 text-center font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">Nenhum participante</td></tr>)}
          </tbody>
        </table>
      </div>

      {/* Análise por pergunta */}
      <h2 className="font-display text-2xl mb-3">Análise por pergunta</h2>
      <div className="space-y-4">
        {modulos?.map((m: any) => (
          <div key={m.id} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5">
            <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-1">Módulo {m.ordem} · {m.tipo === "feedback" ? "Feedback" : "Conhecimento"}</div>
            <div className="font-display text-xl mb-4">{m.nome}</div>
            <div className="space-y-5">
              {m.perguntas.sort((a: any, b: any) => a.ordem - b.ordem).map((p: any) => (
                <Pergunta key={p.id} perg={p} respostas={respByPerg[p.id] || []} correctId={correctMap[p.id]} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pergunta({ perg, respostas, correctId }: { perg: any; respostas: any[]; correctId?: string }) {
  const total = respostas.length;
  return (
    <div className="border-t border-[var(--border)] pt-3">
      <p className="text-sm mb-3">{perg.ordem}. {perg.enunciado} <span className="text-[var(--text-muted)] text-xs">· {total} resposta(s)</span></p>

      {perg.tipo === "multipla_escolha" && (
        <div className="space-y-2">
          {perg.alternativas.sort((a: any, b: any) => a.ordem - b.ordem).map((alt: any) => {
            const n = respostas.filter((r) => r.alternativa_id === alt.id).length;
            const pct = total ? (n / total) * 100 : 0;
            const certa = alt.id === correctId;
            return (
              <div key={alt.id} className="flex items-center gap-3 text-xs">
                <span className={`w-48 truncate ${certa ? "text-green-400 font-medium" : ""}`}>{alt.texto}{certa ? " ✓" : ""}</span>
                <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface-2)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: certa ? "#22c55e" : "var(--tip-red)" }} />
                </div>
                <span className="w-14 text-right text-[var(--text-muted)]">{n} · {pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      )}

      {perg.tipo === "escala" && (() => {
        const vals = respostas.map((r) => r.valor_escala).filter((v) => v != null);
        const med = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
        return (
          <div>
            <div className="flex items-baseline gap-2 mb-3"><span className="font-display text-2xl">{med.toFixed(1)}</span><span className="text-xs text-[var(--text-muted)]">média (1–5)</span></div>
            <div className="space-y-1.5">
              {[1, 2, 3, 4, 5].map((nota) => {
                const n = vals.filter((v) => v === nota).length;
                const pct = vals.length ? (n / vals.length) * 100 : 0;
                return (
                  <div key={nota} className="flex items-center gap-3 text-xs">
                    <span className="w-4 text-[var(--text-muted)]">{nota}</span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface-2)] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--tip-red)" }} /></div>
                    <span className="w-14 text-right text-[var(--text-muted)]">{n} · {pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {perg.tipo === "texto_longo" && (
        <div className="space-y-2">
          {respostas.filter((r) => r.texto_resposta).map((r, i) => (
            <div key={i} className="border-l-2 border-[var(--tip-red)] pl-3 py-1">
              <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">{r.nome}</div>
              <p className="text-sm">{r.texto_resposta}</p>
            </div>
          ))}
          {respostas.filter((r) => r.texto_resposta).length === 0 && <p className="text-xs text-[var(--text-muted)]">Sem respostas de texto</p>}
        </div>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5">
      <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">{label}</div>
      <div className="font-display text-3xl">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">{children}</th>;
}
