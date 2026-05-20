import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";

export default async function Page({ params }: { params: Promise<{ sessaoId: string }> }) {
  const { sessaoId } = await params;
  const supabase = createAdminClient();

  const { data: sessao } = await supabase
    .from("sessoes")
    .select("id, pin, parceiro_isp, data_hora, status, qtd_esperada, treinamento_id, treinamento:treinamentos(id, nome), palestrante:usuarios!sessoes_palestrante_id_fkey(nome)")
    .eq("id", sessaoId).single();

  if (!sessao) notFound();

  // estrutura do treinamento (módulos > perguntas > alternativas)
  const { data: modulos } = await supabase
    .from("modulos")
    .select("id, nome, ordem, tipo, perguntas(id, enunciado, tipo, ordem, vale_nota, alternativas(id, texto, correta, ordem))")
    .eq("treinamento_id", sessao.treinamento_id)
    .order("ordem");

  // participantes e respostas
  const { data: participantes } = await supabase
    .from("participantes")
    .select("id, nome, email, entrou_em, respostas(pergunta_id, alternativa_id, valor_escala, texto_resposta)")
    .eq("sessao_id", sessaoId)
    .order("nome");

  // Calcular notas
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

  // Estatísticas por pergunta
  const stats: Record<string, { respostas: number; corretas: number }> = {};
  allPergs.forEach((perg: any) => {
    let respostas = 0; let corretas = 0;
    (participantes || []).forEach((p: any) => {
      const r = p.respostas.find((r: any) => r.pergunta_id === perg.id);
      if (r) {
        respostas++;
        if (perg.tipo === "multipla_escolha" && r.alternativa_id === correctMap[perg.id]) corretas++;
      }
    });
    stats[perg.id] = { respostas, corretas };
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
          className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-4 py-2.5 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg">
          ⬇ Exportar CSV
        </a>
        <a href={`/api/admin/relatorios/${sessaoId}/export?formato=excel`} download
          className="bg-[var(--bg-surface)] border border-[var(--border-strong)] hover:border-[var(--tip-red)] text-white px-4 py-2.5 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg">
          ⬇ Exportar Excel
        </a>
      </div>

      {/* Resumo */}
      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <Card label="Participantes" value={participantes?.length || 0} />
        <Card label="Média geral" value={`${media.toFixed(1)}%`} />
        <Card label="Perguntas avaliadas" value={pergsValeNota.length} />
        <Card label="Status" value={sessao.status} />
      </div>

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
                <td className="px-4 py-3">
                  <span className={`font-condensed font-bold ${p.pct >= 70 ? "text-green-400" : p.pct >= 50 ? "text-yellow-400" : "text-red-400"}`}>{p.pct.toFixed(0)}%</span>
                </td>
              </tr>
            ))}
            {ranking.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">Nenhum participante</td></tr>
            )}
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
            <div className="space-y-3">
              {m.perguntas.sort((a: any, b: any) => a.ordem - b.ordem).map((p: any) => {
                const s = stats[p.id] || { respostas: 0, corretas: 0 };
                const taxaAcerto = s.respostas ? (s.corretas / s.respostas) * 100 : 0;
                return (
                  <div key={p.id} className="border-t border-[var(--border)] pt-3">
                    <p className="text-sm mb-2">{p.ordem}. {p.enunciado}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-[var(--text-muted)]">{s.respostas} resposta(s)</span>
                      {p.vale_nota && (
                        <span className={`font-condensed font-bold ${taxaAcerto >= 70 ? "text-green-400" : taxaAcerto >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                          {taxaAcerto.toFixed(0)}% de acerto
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
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
