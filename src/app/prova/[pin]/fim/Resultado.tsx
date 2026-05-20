"use client";
import { useEffect, useState } from "react";

export default function Resultado({ pin, sessaoId, treinamento }: { pin: string; sessaoId: string; treinamento: string }) {
  const [nota, setNota] = useState<{ acertos: number; total: number; pct: number } | null>(null);
  const [certificado, setCertificado] = useState<{ codigo: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pid = localStorage.getItem(`participante:${pin}`);
    if (!pid) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/prova/nota?participante=${pid}&sessao=${sessaoId}`).then((r) => r.json()),
      fetch(`/api/prova/certificado?participante=${pid}&sessao=${sessaoId}`).then((r) => r.json()),
    ]).then(([n, c]) => {
      setNota(n);
      if (c?.codigo) setCertificado({ codigo: c.codigo });
      setLoading(false);
    });
  }, [pin, sessaoId]);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] px-6 py-3 bg-[var(--bg-surface-2)]">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-lg tracking-tight">
            <span className="text-[var(--tip-red)]">TIP</span> BRASIL
          </span>
          <span className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] border-l-2 border-[var(--tip-red)] pl-2">
            {treinamento}
          </span>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-md w-full">
          <div className="flex items-baseline gap-3 justify-center mb-6">
            <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
            <h1 className="font-display text-4xl tracking-tight leading-none">RESULTADO</h1>
          </div>

          {loading ? (
            <p className="text-center font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">Calculando...</p>
          ) : !nota ? (
            <p className="text-center font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">Sem dados</p>
          ) : (
            <>
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-10 text-center mb-6">
                <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-3">Sua Nota</div>
                <div className="font-display text-7xl text-[var(--tip-red)] mb-4">{nota.pct.toFixed(0)}%</div>
                <div className="font-condensed text-base tracking-[2px] uppercase">
                  {nota.acertos} de {nota.total} acertos
                </div>
              </div>

              {certificado ? (
                <a href={`/certificado/${certificado.codigo}`}
                  className="block bg-gradient-to-br from-[var(--tip-red)] to-[var(--tip-red-dark)] text-white p-6 rounded-2xl text-center hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(227,6,19,0.3)]">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="font-display text-2xl mb-1">Seu Certificado está pronto!</div>
                  <div className="font-condensed text-xs tracking-[2px] uppercase opacity-90">Toque para visualizar e compartilhar</div>
                </a>
              ) : (
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 text-center">
                  <p className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">
                    Aguardando o palestrante emitir os certificados
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
