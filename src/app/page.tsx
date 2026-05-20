"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [pin, setPin] = useState("");
  const router = useRouter();

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim().length >= 4) {
      router.push(`/prova/${pin.trim()}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Topbar */}
      <header className="border-b border-[var(--border)] px-8 py-4 flex items-center justify-between bg-[var(--bg-surface-2)]">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-tight">
            <span className="text-[var(--tip-red)]">TIP</span> BRASIL
          </span>
          <span className="font-condensed text-[11px] tracking-[3px] uppercase text-[var(--text-muted)] border-l-2 border-[var(--tip-red)] pl-3">
            Sistema de Provas
          </span>
        </div>
      </header>

      {/* Centro */}
      <section className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
            <h1 className="font-display text-4xl tracking-tight leading-none">ENTRAR NA PROVA</h1>
          </div>
          <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
            Digite o PIN fornecido pelo palestrante
          </p>

          <form
            onSubmit={entrar}
            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4"
          >
            <div>
              <label className="block font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">
                PIN da sessão
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={10}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 font-condensed text-2xl font-bold tracking-widest text-center rounded-lg outline-none focus:border-[var(--tip-red)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={pin.trim().length < 4}
              className="w-full bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all"
            >
              Entrar
            </button>
          </form>

          <p className="mt-6 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">
            É palestrante? <a href="/login" className="text-[var(--tip-red)] hover:underline">Faça login</a>
          </p>

          <div className="mt-4 pt-4 border-t border-[var(--border)] text-center">
            <a href="/meus-certificados" className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Recuperar meus certificados →
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-8 py-4 text-center font-condensed text-[11px] tracking-[2px] uppercase text-[var(--text-muted)]">
        TIP Brasil © 2026
      </footer>
    </main>
  );
}
