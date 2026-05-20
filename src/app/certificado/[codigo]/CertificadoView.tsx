"use client";
import { useState } from "react";

interface Cert {
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

export default function CertificadoView({ cert }: { cert: Cert }) {
  const [baixando, setBaixando] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/certificado/${cert.codigo}` : "";
  const titulo = `Certificado · ${cert.treinamento_nome}`;
  const texto = `Concluí o treinamento "${cert.treinamento_nome}" pela TIP Brasil!`;

  const baixarPDF = async () => {
    setBaixando(true);
    const res = await fetch(`/api/certificado/${cert.codigo}/pdf`);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `certificado-${cert.codigo}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
    setBaixando(false);
  };

  const compartilhar = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try { await (navigator as any).share({ title: titulo, text: texto, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copiado!");
    }
  };

  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(texto + " " + url)}`;

  const dataFmt = new Date(cert.data_treinamento + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  }).toUpperCase();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] px-6 py-3 bg-[var(--bg-surface-2)] flex items-center justify-between">
        <span className="font-display text-lg tracking-tight">
          <span className="text-[var(--tip-red)]">TIP</span> BRASIL
        </span>
        <span className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)]">
          Certificado {cert.codigo}
        </span>
      </header>

      <section className="flex-1 px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* CERTIFICADO A4 PAISAGEM */}
          <div className="relative overflow-hidden rounded-3xl shadow-[0_0_60px_rgba(227,6,19,0.18)] mb-6"
            style={{ aspectRatio: "1123 / 794" }}>
            <svg viewBox="0 0 1123 794" xmlns="http://www.w3.org/2000/svg"
                 style={{ width: "100%", height: "100%", display: "block" }}
                 fontFamily="'Helvetica Neue', Arial, sans-serif">
              <defs>
                <pattern id="diagCert" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="22" stroke="#E30613" strokeWidth="2" opacity="0.04"/>
                </pattern>
                <linearGradient id="bgGradCert" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1a1a1a"/>
                  <stop offset="60%" stopColor="#141414"/>
                  <stop offset="100%" stopColor="#0a0a0a"/>
                </linearGradient>
              </defs>

              <rect x="0" y="0" width="1123" height="794" fill="#050505"/>
              <rect x="30" y="30" width="1063" height="734" fill="url(#bgGradCert)" stroke="#E30613" strokeWidth="3"/>
              <rect x="50" y="50" width="1023" height="694" fill="none" stroke="#E30613" strokeWidth="1" opacity="0.35"/>
              <rect x="50" y="50" width="1023" height="694" fill="url(#diagCert)"/>

              {/* cantos */}
              <path d="M 70 130 L 70 70 L 130 70" stroke="#E30613" strokeWidth="4" fill="none"/>
              <circle cx="70" cy="70" r="6" fill="#E30613"/>
              <path d="M 993 70 L 1053 70 L 1053 130" stroke="#E30613" strokeWidth="4" fill="none"/>
              <circle cx="1053" cy="70" r="6" fill="#E30613"/>
              <path d="M 130 724 L 70 724 L 70 664" stroke="#E30613" strokeWidth="4" fill="none"/>
              <circle cx="70" cy="724" r="6" fill="#E30613"/>
              <path d="M 1053 664 L 1053 724 L 993 724" stroke="#E30613" strokeWidth="4" fill="none"/>
              <circle cx="1053" cy="724" r="6" fill="#E30613"/>

              {/* TOPO */}
              <g transform="translate(561.5, 130)">
                <text textAnchor="middle" y="0" fontSize="42" fontWeight="900" letterSpacing="2" fill="#fff">
                  <tspan fill="#E30613">TIP</tspan><tspan> BRASIL</tspan>
                </text>
                <text textAnchor="middle" y="28" fontSize="11" letterSpacing="6" fill="#8A8A8A">PROGRAMA DE TREINAMENTOS</text>
              </g>

              <line x1="491" y1="195" x2="632" y2="195" stroke="#E30613" strokeWidth="2"/>

              <text x="561.5" y="240" textAnchor="middle" fontSize="16" letterSpacing="9" fill="#B0B0B0">CERTIFICADO DE CONCLUSÃO</text>

              <text x="561.5" y="290" textAnchor="middle" fontSize="18" letterSpacing="1" fill="#A0A0A0" fontStyle="italic">Certificamos que</text>

              <text x="561.5" y="350" textAnchor="middle" fontSize={Math.min(46, Math.max(28, 900 / cert.nome_completo.length * 1.2))} fontWeight="700" fill="#fff">{cert.nome_completo}</text>

              <text x="561.5" y="392" textAnchor="middle" fontSize="18" letterSpacing="1" fill="#A0A0A0" fontStyle="italic">concluiu com sucesso o treinamento</text>

              <text x="561.5" y="440" textAnchor="middle" fontSize="32" fontWeight="700" fill="#E30613">{cert.treinamento_nome}</text>

              {cert.parceiro_isp && (
                <text x="561.5" y="468" textAnchor="middle" fontSize="13" letterSpacing="3" fill="#8A8A8A">
                  REALIZADO EM PARCERIA COM {cert.parceiro_isp.toUpperCase()}
                </text>
              )}
              <text x="561.5" y={cert.parceiro_isp ? 488 : 468} textAnchor="middle" fontSize="13" letterSpacing="3" fill="#8A8A8A">
                {dataFmt} · CARGA HORÁRIA 90 MINUTOS
              </text>

              <line x1="491" y1="518" x2="632" y2="518" stroke="#E30613" strokeWidth="2"/>

              {/* STATS */}
              <g transform="translate(420, 558)">
                <text textAnchor="middle" fontSize="10" letterSpacing="2.5" fill="#8A8A8A">APROVEITAMENTO</text>
                <text textAnchor="middle" y="42" fontSize="44" fontWeight="800" fill="#E30613">{Number(cert.nota_final).toFixed(0)}%</text>
              </g>
              <g transform="translate(700, 558)">
                <text textAnchor="middle" fontSize="10" letterSpacing="2.5" fill="#8A8A8A">ACERTOS</text>
                <text textAnchor="middle" y="42" fontSize="44" fontWeight="800" fill="#fff">
                  <tspan>{cert.acertos}</tspan><tspan fill="#8A8A8A" fontSize="26">/{cert.total_perguntas}</tspan>
                </text>
              </g>

              {/* ASSINATURAS REAIS */}
              <image href="/assinaturas/cristiano.png" x="185" y="600" width="180" height="80" preserveAspectRatio="xMidYMax meet"/>
              <line x1="170" y1="690" x2="380" y2="690" stroke="#fff" strokeWidth="1" opacity="0.4"/>
              <text x="275" y="710" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">Cristiano Alves</text>
              <text x="275" y="727" textAnchor="middle" fontSize="10" letterSpacing="2" fill="#8A8A8A">DIRETOR COMERCIAL · TIP BRASIL</text>

              {/* selo central */}
              <g transform="translate(561.5, 678)">
                <circle r="48" fill="none" stroke="#E30613" strokeWidth="2.5"/>
                <circle r="42" fill="none" stroke="#E30613" strokeWidth="0.8" opacity="0.5"/>
                <circle r="36" fill="#E30613" opacity="0.08"/>
                <text textAnchor="middle" y="-8" fontSize="11" letterSpacing="4" fill="#E30613" fontWeight="800">TIP</text>
                <text textAnchor="middle" y="7" fontSize="10" letterSpacing="3" fill="#E30613" fontWeight="700">BRASIL</text>
                <text textAnchor="middle" y="22" fontSize="7" letterSpacing="2" fill="#8A8A8A">CERTIFICADO 2026</text>
              </g>

              <image href="/assinaturas/andre.png" x="758" y="600" width="180" height="80" preserveAspectRatio="xMidYMax meet"/>
              <line x1="743" y1="690" x2="953" y2="690" stroke="#fff" strokeWidth="1" opacity="0.4"/>
              <text x="848" y="710" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">André Telles</text>
              <text x="848" y="727" textAnchor="middle" fontSize="10" letterSpacing="2" fill="#8A8A8A">CEO · TIP BRASIL</text>

              <text x="561.5" y="758" textAnchor="middle" fontSize="9" letterSpacing="3" fill="#666">
                CÓDIGO DE VALIDAÇÃO · {cert.codigo} · VALIDE EM provas-tip.vercel.app/certificado/{cert.codigo}
              </text>
            </svg>
          </div>

          {/* AÇÕES */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button onClick={baixarPDF} disabled={baixando}
                className="col-span-2 md:col-span-1 bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white py-3 px-4 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg flex items-center justify-center gap-2">
                {baixando ? "Gerando..." : "⬇ Baixar PDF"}
              </button>

              <a href={linkedin} target="_blank" rel="noopener noreferrer"
                className="bg-[#0A66C2] hover:bg-[#004182] text-white py-3 px-4 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg flex items-center justify-center gap-2">
                LinkedIn
              </a>
              <a href={facebook} target="_blank" rel="noopener noreferrer"
                className="bg-[#1877F2] hover:bg-[#0d65d9] text-white py-3 px-4 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg flex items-center justify-center gap-2">
                Facebook
              </a>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1eb55a] text-white py-3 px-4 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg flex items-center justify-center gap-2">
                WhatsApp
              </a>
              <button onClick={compartilhar}
                className="bg-[var(--bg-surface-2)] hover:bg-[var(--border)] border border-[var(--border-strong)] text-white py-3 px-4 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg flex items-center justify-center gap-2">
                + Mais
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 text-[var(--text-muted)] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-condensed text-[11px] tracking-[1.5px] uppercase text-[var(--text-muted)] leading-relaxed">
                Instagram não aceita link direto — use <button onClick={compartilhar} className="text-white underline">copiar link</button> e cole nos seus stories
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <a href="/" className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white">
              ← Voltar ao início
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
