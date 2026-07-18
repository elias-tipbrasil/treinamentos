"use client";
import { useEffect, useState } from "react";
import { Th, Td, TextCell, NumberCell, DateCell, SelectCell, OperadoraBadge, Kpi, limparCodEasy } from "./cells";

const STATUS_OPTS = ["Pronto", "Aguard. Parceiro", "Em produção"];
const OPERADORA_LABELS: Record<string, string> = { Surf: "Surf E-sim", Telecall: "Telecall E-sim", Arqia: "Arqia E-sim" };

interface EsimPedido {
  id: string;
  operadora: string;
  data_entrada: string | null;
  nome_parceiro: string;
  cod_easy: string | null;
  qtde_contratada: number;
  qtde_enviada: number;
  data_pedido: string | null;
  status: string | null;
  data_entrega: string | null;
  nome_rede: string | null;
  obs: string | null;
}

export default function EsimManager({ operadora }: { operadora: string }) {
  const [pedidos, setPedidos] = useState<EsimPedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const load = async (op: string) => {
    setLoading(true);
    const res = await fetch(`/api/chip/esim?operadora=${encodeURIComponent(op)}`);
    const j = await res.json().catch(() => ({ pedidos: [] }));
    setPedidos((j.pedidos || []).map((p: EsimPedido) => ({ ...p, cod_easy: limparCodEasy(p.cod_easy) })));
    setLoading(false);
  };
  useEffect(() => { load(operadora); }, [operadora]);

  const salvarCampo = async (id: string, campo: string, valor: any) => {
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));
    await fetch("/api/chip/esim", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [campo]: valor }),
    });
  };

  const novaLinha = async () => {
    const r = await fetch("/api/chip/esim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operadora, nome_parceiro: "Novo parceiro", data_entrada: new Date().toISOString().slice(0, 10) }),
    });
    const j = await r.json().catch(() => null);
    if (j?.id) await load(operadora);
  };

  const remover = async (id: string) => {
    if (!confirm("Remover esta linha?")) return;
    await fetch(`/api/chip/esim?id=${id}`, { method: "DELETE" });
    load(operadora);
  };

  const filtrados = pedidos.filter((p) => {
    if (!busca.trim()) return true;
    const b = busca.toLowerCase();
    return p.nome_parceiro.toLowerCase().includes(b) || (p.nome_rede || "").toLowerCase().includes(b) || (p.cod_easy || "").toLowerCase().includes(b);
  });

  const totalContratado = filtrados.reduce((s, p) => s + (p.qtde_contratada || 0), 0);
  const totalEnviado = filtrados.reduce((s, p) => s + (p.qtde_enviada || 0), 0);
  const totalPendente = totalContratado - totalEnviado;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar parceiro ou cód..."
          className="bg-[var(--bg-input)] border border-[var(--border-strong)] text-white text-sm px-3.5 py-2 rounded-lg outline-none focus:border-[var(--tip-red)] w-52"
        />
        <button
          onClick={novaLinha}
          className="bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-5 py-2 font-condensed text-xs font-bold tracking-[1.3px] uppercase rounded-lg"
        >
          + Nova linha
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5 max-w-xl">
        <Kpi label="Contratado" value={totalContratado.toLocaleString("pt-BR")} />
        <Kpi label="Enviado" value={totalEnviado.toLocaleString("pt-BR")} />
        <Kpi label="Pendente" value={totalPendente.toLocaleString("pt-BR")} destaque={totalPendente > 0} />
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1620px]" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr className="border-b border-[var(--border)] text-left font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">
                <Th w="130px" sticky left="0px">Entrada</Th>
                <Th w="180px" sticky left="130px">Parceiro</Th>
                <Th w="130px">Operadora</Th>
                <Th w="150px">Nome de rede</Th>
                <Th w="110px">Cód. Easy</Th>
                <Th w="110px" align="right">Contratada</Th>
                <Th w="100px" align="right">Enviada</Th>
                <Th w="90px" align="right">Pendente</Th>
                <Th w="140px">Data pedido</Th>
                <Th w="170px">Status</Th>
                <Th w="140px">Data entrega</Th>
                <Th w="200px">Obs</Th>
                <Th w="70px"></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading && (
                <tr><td colSpan={13} className="py-10 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Carregando...</td></tr>
              )}
              {!loading && filtrados.length === 0 && (
                <tr><td colSpan={13} className="py-10 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Nenhum pedido em {OPERADORA_LABELS[operadora]}</td></tr>
              )}
              {filtrados.map((p) => {
                const pendente = (p.qtde_contratada || 0) - (p.qtde_enviada || 0);
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <Td sticky left="0px"><DateCell value={p.data_entrada} onSave={(v) => salvarCampo(p.id, "data_entrada", v)} /></Td>
                    <Td sticky left="130px"><TextCell value={p.nome_parceiro} onSave={(v) => salvarCampo(p.id, "nome_parceiro", v)} bold /></Td>
                    <Td><OperadoraBadge label={OPERADORA_LABELS[p.operadora] || p.operadora} /></Td>
                    <Td><TextCell value={p.nome_rede || ""} onSave={(v) => salvarCampo(p.id, "nome_rede", v)} /></Td>
                    <Td><TextCell value={p.cod_easy || ""} onSave={(v) => salvarCampo(p.id, "cod_easy", v)} /></Td>
                    <Td><NumberCell value={p.qtde_contratada} onSave={(v) => salvarCampo(p.id, "qtde_contratada", v)} /></Td>
                    <Td><NumberCell value={p.qtde_enviada} onSave={(v) => salvarCampo(p.id, "qtde_enviada", v)} /></Td>
                    <Td align="right"><span className={pendente > 0 ? "text-yellow-400" : "text-[var(--text-muted)]"}>{pendente.toLocaleString("pt-BR")}</span></Td>
                    <Td><DateCell value={p.data_pedido} onSave={(v) => salvarCampo(p.id, "data_pedido", v)} /></Td>
                    <Td><SelectCell value={p.status || ""} options={STATUS_OPTS} onSave={(v) => salvarCampo(p.id, "status", v)} badge /></Td>
                    <Td><DateCell value={p.data_entrega} onSave={(v) => salvarCampo(p.id, "data_entrega", v)} /></Td>
                    <Td><TextCell value={p.obs || ""} onSave={(v) => salvarCampo(p.id, "obs", v)} /></Td>
                    <Td align="right">
                      <button onClick={() => remover(p.id)} className="text-[var(--text-muted)] hover:text-red-400 text-xs font-condensed tracking-[1.5px] uppercase">✕</button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
