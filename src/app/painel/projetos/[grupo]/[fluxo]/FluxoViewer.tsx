"use client";
import { useState } from "react";

interface Props {
  fluxo: {
    tipo: "miro" | "pdf";
    miro_iframe?: string | null;
    pdf_url?: string | null;
  };
}

export default function FluxoViewer({ fluxo }: Props) {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // Extrai URL do iframe Miro
  const miroSrc = fluxo.miro_iframe ? extractMiroSrc(fluxo.miro_iframe) : null;

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 bg-black p-4" : "mt-4"}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">
          {fluxo.tipo === "miro" ? "Fluxograma" : "Documento PDF"}
        </div>
        <button
          onClick={() => setFullscreen((v) => !v)}
          className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white px-3 py-1.5 border border-[var(--border-strong)] hover:border-white rounded-full transition-colors"
        >
          {fullscreen ? "Sair da tela cheia" : "Tela cheia"}
        </button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl relative" style={{ height: fullscreen ? "calc(100vh - 80px)" : "75vh", minHeight: 600 }}>
        {loading && (
          <div className="absolute inset-0 bg-[var(--bg-surface)] flex flex-col items-center justify-center gap-4 z-10 pointer-events-none transition-opacity duration-700">
            <div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--tip-red)] rounded-full animate-spin"></div>
            <div className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Carregando</div>
          </div>
        )}

        {fluxo.tipo === "miro" && miroSrc && (
          <iframe
            src={miroSrc}
            className="w-full h-full border-0 block"
            scrolling="no"
            allowFullScreen
            allow="fullscreen; clipboard-read; clipboard-write"
            onLoad={() => setLoading(false)}
          />
        )}

        {fluxo.tipo === "miro" && !miroSrc && (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-sm">
            Iframe do Miro não foi cadastrado ainda
          </div>
        )}

        {fluxo.tipo === "pdf" && fluxo.pdf_url && (
          <iframe
            src={fluxo.pdf_url + "#toolbar=0&navpanes=0"}
            className="w-full h-full border-0 block"
            onLoad={() => setLoading(false)}
          />
        )}

        {fluxo.tipo === "pdf" && !fluxo.pdf_url && (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-sm">
            PDF não foi cadastrado ainda
          </div>
        )}
      </div>
    </div>
  );
}

function extractMiroSrc(iframeHtml: string): string | null {
  const match = iframeHtml.match(/src=["']([^"']+)["']/);
  return match ? match[1] : null;
}
