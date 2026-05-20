"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RelatoriosFiltros({ treinamentos, atual }: { treinamentos: { id: string; nome: string }[]; atual: { isp?: string; treinamento?: string; status?: string } }) {
  const router = useRouter();
  const [isp, setIsp] = useState(atual.isp || "");
  const [treinamento, setTreinamento] = useState(atual.treinamento || "");
  const [status, setStatus] = useState(atual.status || "");

  const aplicar = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (isp) params.set("isp", isp);
    if (treinamento) params.set("treinamento", treinamento);
    if (status) params.set("status", status);
    router.push(`/admin/relatorios?${params.toString()}`);
  };

  const limpar = () => { setIsp(""); setTreinamento(""); setStatus(""); router.push("/admin/relatorios"); };

  return (
    <form onSubmit={aplicar} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4 grid md:grid-cols-4 gap-3">
      <input type="text" placeholder="Filtrar por ISP..." value={isp} onChange={(e) => setIsp(e.target.value)}
        className="bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-2.5 text-sm rounded-lg outline-none focus:border-[var(--tip-red)]" />
      <select value={treinamento} onChange={(e) => setTreinamento(e.target.value)}
        className="bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-2.5 text-sm rounded-lg outline-none focus:border-[var(--tip-red)]">
        <option value="">Todos os treinamentos</option>
        {treinamentos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
      </select>
      <select value={status} onChange={(e) => setStatus(e.target.value)}
        className="bg-[var(--bg-input)] border border-[var(--border-strong)] text-white px-4 py-2.5 text-sm rounded-lg outline-none focus:border-[var(--tip-red)]">
        <option value="">Todos os status</option>
        <option value="ativa">Ativa</option>
        <option value="encerrada">Encerrada</option>
      </select>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white py-2.5 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg">Filtrar</button>
        <button type="button" onClick={limpar} className="px-4 bg-[var(--bg-surface-2)] border border-[var(--border-strong)] text-white py-2.5 font-condensed text-xs tracking-[1.3px] uppercase rounded-lg">Limpar</button>
      </div>
    </form>
  );
}
