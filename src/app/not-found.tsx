export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">404</h1>
      </div>
      <p className="font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)] mb-6">Página não encontrada</p>
      <a href="/" className="font-condensed text-xs tracking-[2px] uppercase text-[var(--tip-red)] hover:underline">← Voltar ao início</a>
    </main>
  );
}
