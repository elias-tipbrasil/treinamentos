"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EntrarForm({ sessaoId, pin }: { sessaoId: string; pin: string }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErro("");
    const res = await fetch("/api/prova/entrar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessao_id: sessaoId, nome, email }),
    });
    const j = await res.json();
    if (res.ok) {
      localStorage.setItem(`participante:${pin}`, j.participante_id);
      router.push(`/prova/${pin}/responder`);
    } else { setErro(j.erro || "Erro"); setLoading(false); }
  };

  return (
    <form onSubmit={entrar} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
      <div>
        <label className="block font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">
          Nome Completo
        </label>
        <input required type="text" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus
          placeholder="Digite seu nome como deseja no certificado"
          className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]" />
        <div className="mt-2 flex items-start gap-2 px-3 py-2 bg-[var(--tip-red)]/5 border border-[var(--tip-red)]/30 rounded-lg">
          <svg className="w-4 h-4 flex-shrink-0 text-[var(--tip-red)] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <p className="font-condensed text-[11px] tracking-[1.5px] uppercase text-[var(--tip-red)] leading-relaxed">
            Este nome será impresso no seu certificado de conclusão
          </p>
        </div>
      </div>
      <div>
        <label className="block font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">E-mail</label>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-3 rounded-lg outline-none focus:border-[var(--tip-red)]" />
      </div>
      {erro && <p className="text-red-400 text-sm">{erro}</p>}
      <button type="submit" disabled={loading}
        className="w-full bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] disabled:opacity-50 text-white py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all">
        {loading ? "Entrando..." : "Entrar na Prova"}
      </button>
    </form>
  );
}
