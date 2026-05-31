"use client";
import { useState, useEffect } from "react";
import type { Slide } from "@/lib/kickoff-slides";
import SlideRenderer from "@/components/kickoff/SlideRenderer";

export default function Apresentacao({
  nomeCliente,
  slides,
  kickoffId,
}: {
  nomeCliente: string;
  slides: Slide[];
  kickoffId: string;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setIdx((i) => Math.min(i + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Home") {
        setIdx(0);
      } else if (e.key === "End") {
        setIdx(slides.length - 1);
      } else if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Topbar */}
      <div className="bg-[var(--bg-surface-2)] border-b border-[var(--border)] px-4 py-2 flex items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <a href="/painel/kickoff" className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white">
            ← Sair
          </a>
          <span className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">
            {nomeCliente}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">
            {idx + 1} / {slides.length}
          </span>
          <button
            onClick={toggleFullscreen}
            className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white px-3 py-1 border border-[var(--border-strong)] rounded"
          >
            Fullscreen (F11)
          </button>
          <a
            href={`/api/kickoffs/${kickoffId}/pdf`}
            target="_blank"
            className="font-condensed text-[10px] tracking-[2px] uppercase text-[var(--tip-red)] hover:text-white px-3 py-1 border border-[var(--tip-red)] rounded"
          >
            Exportar PDF
          </a>
        </div>
      </div>

      {/* Slide */}
      <div className="flex-1 relative">
        <SlideRenderer slide={slides[idx]} nomeCliente={nomeCliente} />

        {/* Navegação */}
        <button
          onClick={() => setIdx((i) => Math.max(i - 1, 0))}
          disabled={idx === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 disabled:opacity-20 disabled:cursor-not-allowed text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl"
        >
          ‹
        </button>
        <button
          onClick={() => setIdx((i) => Math.min(i + 1, slides.length - 1))}
          disabled={idx === slides.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 disabled:opacity-20 disabled:cursor-not-allowed text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl"
        >
          ›
        </button>

        {/* Barra de progresso */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--bg-surface-2)]">
          <div
            className="h-full bg-[var(--tip-red)] transition-all duration-300"
            style={{ width: `${((idx + 1) / slides.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
