"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    if (res.ok) {
      router.push("/painel");
      router.refresh();
    } else {
      const j = await res.json();
      setErro(j.erro || "Erro ao entrar");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] px-8 py-4 flex items-center justify-between bg-[var(--bg-surface-2)]">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-tight">
            <span className="text-[var(--tip-red)]">TIP</span> BRASIL
          </span>
          <span className="font-condensed text-[11px] tracking-[3px] uppercase text-[var(--text-muted)] border-l-2 border-[var(--tip-red)] pl-3">
            Acesso Palestrante
          </span>
        </div>
        <a href="/" className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white">← Voltar</a>
      </header>

      <section className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
            <h1 className="font-display text-4xl tracking-tight leading-none">LOGIN</h1>
          </div>
          <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">
            Acesso administrativo
          </p>

          <form onSubmit={handleLogin} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
            <div>
              <label className="block font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 font-body text-base rounded-lg outline-none focus:border-[var(--tip-red)]" />
            </div>
            <div>
              <label className="block font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required
                className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 font-body text-base rounded-lg outline-none focus:border-[var(--tip-red)]" />
            </div>
            {erro && <p className="text-red-400 text-sm">{erro}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
