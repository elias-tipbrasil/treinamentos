"use client";
import { useState } from "react";

interface Certificado {
  codigo: string;
  nome_completo: string;
  treinamento_nome: string;
  parceiro_isp: string | null;
  data_treinamento: string;
  nota_final: number;
  total_perguntas: number;
  acertos: number;
  emitido_em: string;
}

export default function MeusCertificados() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [certs, setCerts] = useState<Certificado[] | null>(null);
  const [erro, setErro] = useState("");

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErro(""); setCerts(null);
    try {
      const res = await fetch("/api/meus-certificados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.erro || "Erro");
      setCerts(j.certificados);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] px-6 py-3 bg-[var(--bg-surface-2)] flex items-center justify-between">
        <span className="font-display text-lg tracking-tight">
          <span className="text-[var(--tip-red)]">TIP</span> BRASIL
        </span>
        <a href="/" className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white">
          ← Início
        </a>
      </header>

      <section className="flex-1 px-4 md:px-6 py-10 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
            <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-none">MEUS CERTIFICADOS</h1>
          </div>
          <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-10 ml-5">
            Recupere os certificados emitidos para você
          </p>

          <form onSubmit={buscar} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 mb-6">
            <label className="block font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">
              Seu e-mail
            </label>
            <div className="flex gap-3">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                autoFocus
                className="flex-1 bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white px-6 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all"
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
            {erro && <p className="mt-3 text-red-400 text-sm">{erro}</p>}
          </form>

          {certs !== null && (
            <>
              {certs.length === 0 ? (
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 text-center">
                  <p className="font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">
                    Nenhum certificado encontrado para este e-mail
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-3 normal-case tracking-normal">
                    Confira se o e-mail está correto ou aguarde o palestrante emitir os certificados da sua sessão.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] mb-3">
                    {certs.length} certificado{certs.length !== 1 ? "s" : ""} encontrado{certs.length !== 1 ? "s" : ""}
                  </p>
                  {certs.map((c) => {
                    const dataFmt = new Date(c.data_treinamento + "T12:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit", month: "short", year: "numeric"
                    });
                    return (
                      <a
                        key={c.codigo}
                        href={`/certificado/${c.codigo}`}
                        className="block bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-2)] border border-[var(--border)] hover:border-[var(--tip-red)] rounded-2xl p-5 transition-all group"
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="font-display text-xl mb-1 truncate">{c.treinamento_nome}</div>
                            <div className="font-condensed text-[11px] tracking-[1.5px] uppercase text-[var(--text-muted)]">
                              {c.nome_completo} · {dataFmt}
                              {c.parceiro_isp && <> · {c.parceiro_isp}</>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">Nota</div>
                              <div className="font-display text-2xl text-[var(--tip-red)]">{Number(c.nota_final).toFixed(0)}%</div>
                            </div>
                            <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--tip-red)] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-[var(--border)] font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">
                          Código {c.codigo}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
