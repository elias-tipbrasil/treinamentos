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
  const [hideUI, setHideUI] = useState(false);

  // Auto-hide da UI após 3s sem mouse
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const reset = () => {
      setHideUI(false);
      clearTimeout(timer);
      timer = setTimeout(() => setHideUI(true), 3000);
    };
    reset();
    window.addEventListener("mousemove", reset);
    return () => {
      window.removeEventListener("mousemove", reset);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setIdx((i) => Math.min(i + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Home") setIdx(0);
      else if (e.key === "End") setIdx(slides.length - 1);
      else if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col cursor-default">
      {/* Topbar - some após 3s sem movimento */}
      <div className={`bg-black/40 backdrop-blur-md border-b border-zinc-900 px-5 py-2.5 flex items-center justify-between gap-3 z-20 transition-opacity duration-500 ${hideUI ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <div className="flex items-center gap-4">
          <a href="/painel/kickoff" className="text-[11px] tracking-[0.2em] uppercase text-zinc-500 hover:text-white font-light">
            ← Sair
          </a>
          <span className="text-[11px] tracking-[0.2em] uppercase text-zinc-400 font-medium">{nomeCliente}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] tracking-[0.2em] uppercase text-zinc-500 font-light">
            {String(idx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <button
            onClick={toggleFullscreen}
            className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-white px-3 py-1.5 border border-zinc-800 rounded-full transition-colors"
          >
            Fullscreen (F)
          </button>
          <a
            href={`/api/kickoffs/${kickoffId}/pdf`}
            target="_blank"
            className="text-[10px] tracking-[0.2em] uppercase text-[var(--tip-red)] hover:text-white px-3 py-1.5 border border-[var(--tip-red)] hover:bg-[var(--tip-red)] rounded-full transition-colors"
          >
            Exportar PDF
          </a>
        </div>
      </div>

      {/* Slide */}
      <div className="flex-1 relative" onClick={(e) => {
        // clique em qualquer área avança
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("a")) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x > rect.width / 2) setIdx((i) => Math.min(i + 1, slides.length - 1));
        else setIdx((i) => Math.max(i - 1, 0));
      }}>
        <SlideRenderer slide={slides[idx]} nomeCliente={nomeCliente} />

        {/* Setas - somem com a UI */}
        <button
          onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.max(i - 1, 0)); }}
          disabled={idx === 0}
          className={`absolute left-6 top-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-md hover:bg-white/10 disabled:opacity-0 disabled:cursor-not-allowed text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${hideUI ? "opacity-0" : "opacity-60 hover:opacity-100"}`}
        >
          ‹
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.min(i + 1, slides.length - 1)); }}
          disabled={idx === slides.length - 1}
          className={`absolute right-6 top-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-md hover:bg-white/10 disabled:opacity-0 disabled:cursor-not-allowed text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${hideUI ? "opacity-0" : "opacity-60 hover:opacity-100"}`}
        >
          ›
        </button>

        {/* Barra de progresso fina embaixo */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900">
          <div
            className="h-full bg-[var(--tip-red)] transition-all duration-700 ease-out"
            style={{ width: `${((idx + 1) / slides.length) * 100}%` }}
          ></div>
        </div>

        {/* Dots indicadores - somem com a UI */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 transition-opacity duration-500 ${hideUI ? "opacity-0" : "opacity-100"}`}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-white" : "w-1.5 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
