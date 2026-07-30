"use client";
import { useEffect, useMemo, useState } from "react";
import { Th, Td, TextCell, NumberCell, DateCell, SelectCell, OperadoraBadge, LinkCell, Kpi, limparCodEasy } from "./cells";

const REDE_LABELS: Record<string, string> = { Tim: "Surf Chip", Vivo: "Telecall Chip", Arqia: "Arqia Chip", Valhalla: "Valhalla Chip" };
const REDE_LABELS_REVERSO: Record<string, string> = Object.fromEntries(Object.entries(REDE_LABELS).map(([k, v]) => [v, k]));
const PENDENTE_GRUPO = ["Aguard. Parceiro", "Aguard. Mkt TIP", "Reservado", "Em produção", "Aguard. Envio"];
const STATUS_ARTE_OPTS = ["Aguard. Parceiro", "Aguard. Mkt TIP", "Reservado", "Em produção", "Aguard. Envio", "Pronto"];
const PRODUCAO_OPTS = ["Produção TIP", "Grafica Campinas", "Grafica SP"];
const PLANO_OPTS = ["FIXO", "CONSUMO", "MISTO"];
const DIAS_PREVISAO_ARQIA = 60;

const somarDias = (dias: number) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

interface Pedido {
  id: string;
  rede: string;
  data_entrada: string;
  arte_aprovada: string | null;
  nome_cliente: string;
  cod_easy: string | null;
  qtde_contratada: number;
  qtde_enviada: number;
  data_envio: string | null;
  status_arte: string | null;
  producao: string | null;
  plano: string | null;
  obs: string | null;
  nome_rede: string | null;
  link_arte: string | null;
  endereco_entrega: string | null;
  responsavel_contato: string | null;
  prova_digital_recebida: string | null;
  previsao_entrega: string | null;
}

export default function ChipPedidosTable({ rede }: { rede: string }) {
  const isArqia = rede === "Arqia";
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [dataDe, setDataDe] = useState("");
  const [dataAte, setDataAte] = useState("");
  const [prevDe, setPrevDe] = useState("");
  const [prevAte, setPrevAte] = useState("");

  const load = async (r: string) => {
    setLoading(true);
    const res = await fetch(`/api/chip/producao?rede=${encodeURIComponent(r)}`);
    const j = await res.json().catch(() => ({ pedidos: [] }));
    setPedidos((j.pedidos || []).map((p: Pedido) => ({ ...p, cod_easy: limparCodEasy(p.cod_easy) })));
    setLoading(false);
  };
  useEffect(() => { load(rede); setStatusFiltro("Todos"); setPrevDe(""); setPrevAte(""); }, [rede]);

  const salvarCampos = async (id: string, patch: Record<string, any>, recarregar?: boolean) => {
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    await fetch("/api/chip/producao", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (recarregar) load(rede);
  };

  const salvarCampo = async (id: string, campo: string, valor: any, recarregar?: boolean) =>
    salvarCampos(id, { [campo]: valor }, recarregar);

  const salvarStatus = async (p: Pedido, valor: string) => {
    if (isArqia && valor === "Em produção" && !p.previsao_entrega) {
      await salvarCampos(p.id, { status_arte: valor, previsao_entrega: somarDias(DIAS_PREVISAO_ARQIA) });
      return;
    }
    await salvarCampos(p.id, { status_arte: valor });
  };

  const novaLinha = async () => {
    const r = await fetch("/api/chip/producao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rede, nome_cliente: "Novo parceiro", data_entrada: new Date().toISOString().slice(0, 10) }),
    });
    const j = await r.json().catch(() => null);
    if (j?.id) await load(rede);
  };

  const remover = async (id: string) => {
    if (!confirm("Remover esta linha?")) return;
    await fetch(`/api/chip/producao?id=${id}`, { method: "DELETE" });
    load(rede);
  };

  const statusDisponiveis = useMemo(() => {
    const set = new Set<string>(STATUS_ARTE_OPTS);
    pedidos.forEach((p) => p.status_arte && set.add(p.status_arte));
    return ["Todos", "Pendente", ...Array.from(set)];
  }, [pedidos]);

  const filtrados = pedidos.filter((p) => {
    if (statusFiltro === "Pendente") {
      if (!PENDENTE_GRUPO.includes(p.status_arte || "")) return false;
    } else if (statusFiltro !== "Todos" && (p.status_arte || "") !== statusFiltro) return false;
    if (dataDe && p.data_entrada < dataDe) return false;
    if (dataAte && p.data_entrada > dataAte) return false;
    if (isArqia && (prevDe || prevAte)) {
      const prev = p.previsao_entrega || "";
      if (!prev) return false;
      if (prevDe && prev < prevDe) return false;
      if (prevAte && prev > prevAte) return false;
    }
    if (!busca.trim()) return true;
    const b = busca.toLowerCase();
    return p.nome_cliente.toLowerCase().includes(b) || (p.nome_rede || "").toLowerCase().includes(b) || (p.cod_easy || "").toLowerCase().includes(b);
  });

  const totalContratado = filtrados.reduce((s, p) => s + (p.qtde_contratada || 0), 0);
  const totalEnviado = filtrados.reduce((s, p) => s + (p.qtde_enviada || 0), 0);
  const totalPendente = totalContratado - totalEnviado;
  const totalColunas = isArqia ? 20 : 19;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2">
            <span className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">Entre</span>
            <input
              type="date"
              value={dataDe}
              onChange={(e) => setDataDe(e.target.value)}
              className={`bg-transparent outline-none text-sm ${dataDe ? "text-white" : "text-[var(--text-muted)]"}`}
            />
            <span className="text-[var(--text-muted)] text-xs">e</span>
            <input
              type="date"
              value={dataAte}
              onChange={(e) => setDataAte(e.target.value)}
              className={`bg-transparent outline-none text-sm ${dataAte ? "text-white" : "text-[var(--text-muted)]"}`}
            />
            {(dataDe || dataAte) && (
              <button onClick={() => { setDataDe(""); setDataAte(""); }} className="text-[var(--text-muted)] hover:text-white text-xs px-1">✕</button>
            )}
          </div>

          {isArqia && (
            <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-3 py-2">
              <span className="font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">Previsão entrega entre</span>
              <input
                type="date"
                value={prevDe}
                onChange={(e) => setPrevDe(e.target.value)}
                className={`bg-transparent outline-none text-sm ${prevDe ? "text-white" : "text-[var(--text-muted)]"}`}
              />
              <span className="text-[var(--text-muted)] text-xs">e</span>
              <input
                type="date"
                value={prevAte}
                onChange={(e) => setPrevAte(e.target.value)}
                className={`bg-transparent outline-none text-sm ${prevAte ? "text-white" : "text-[var(--text-muted)]"}`}
              />
              {(prevDe || prevAte) && (
                <button onClick={() => { setPrevDe(""); setPrevAte(""); }} className="text-[var(--text-muted)] hover:text-white text-xs px-1">✕</button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
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
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {statusDisponiveis.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFiltro(s)}
            className={`px-3.5 py-1.5 rounded-full font-condensed text-[11px] font-bold tracking-[1px] uppercase transition-colors ${
              statusFiltro === s
                ? "bg-white text-black"
                : "bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5 max-w-xl">
        <Kpi label="Contratado" value={totalContratado.toLocaleString("pt-BR")} />
        <Kpi label="Enviado" value={totalEnviado.toLocaleString("pt-BR")} />
        <Kpi label="Pendente" value={totalPendente.toLocaleString("pt-BR")} destaque={totalPendente > 0} />
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${isArqia ? "min-w-[2800px]" : "min-w-[2660px]"}`} style={{ tableLayout: "fixed" }}>
            <thead>
              <tr className="border-b border-[var(--border)] text-left font-condensed text-[10px] tracking-[1.5px] uppercase text-[var(--text-muted)]">
                <Th w="130px" sticky left="0px">Entrada</Th>
                <Th w="180px" sticky left="130px">Parceiro</Th>
                <Th w="110px">Operadora</Th>
                <Th w="140px">Nome de rede</Th>
                <Th w="100px">Cód. Easy</Th>
                <Th w="100px" align="right">Contratada</Th>
                <Th w="100px" align="right">Enviada</Th>
                <Th w="90px" align="right">Pendente</Th>
                <Th w="130px">Arte aprovada</Th>
                <Th w="130px">Data envio</Th>
                <Th w="200px">Status projeto</Th>
                <Th w="130px">Prova digital</Th>
                {isArqia && <Th w="140px">Previsão entrega</Th>}
                <Th w="150px">Produção</Th>
                <Th w="120px">Plano</Th>
                <Th w="180px">Obs</Th>
                <Th w="200px">Link da arte</Th>
                <Th w="220px">Endereço</Th>
                <Th w="180px">Contato</Th>
                <Th w="70px"></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading && (
                <tr><td colSpan={totalColunas} className="py-10 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Carregando...</td></tr>
              )}
              {!loading && filtrados.length === 0 && (
                <tr><td colSpan={totalColunas} className="py-10 text-center font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)]">Nenhum pedido em {REDE_LABELS[rede]}</td></tr>
              )}
              {filtrados.map((p) => {
                const pendente = (p.qtde_contratada || 0) - (p.qtde_enviada || 0);
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <Td sticky left="0px"><DateCell value={p.data_entrada} onSave={(v) => salvarCampo(p.id, "data_entrada", v)} /></Td>
                    <Td sticky left="130px"><TextCell value={p.nome_cliente} onSave={(v) => salvarCampo(p.id, "nome_cliente", v)} bold /></Td>
                    <Td>
                      <OperadoraBadge label={REDE_LABELS[p.rede] || p.rede} />
                    </Td>
                    <Td><TextCell value={p.nome_rede || ""} onSave={(v) => salvarCampo(p.id, "nome_rede", v)} /></Td>
                    <Td><TextCell value={p.cod_easy || ""} onSave={(v) => salvarCampo(p.id, "cod_easy", v)} /></Td>
                    <Td><NumberCell value={p.qtde_contratada} onSave={(v) => salvarCampo(p.id, "qtde_contratada", v)} /></Td>
                    <Td><NumberCell value={p.qtde_enviada} onSave={(v) => salvarCampo(p.id, "qtde_enviada", v)} /></Td>
                    <Td align="right"><span className={pendente > 0 ? "text-yellow-400" : "text-[var(--text-muted)]"}>{pendente.toLocaleString("pt-BR")}</span></Td>
                    <Td><DateCell value={p.arte_aprovada} onSave={(v) => salvarCampo(p.id, "arte_aprovada", v)} /></Td>
                    <Td><DateCell value={p.data_envio} onSave={(v) => salvarCampo(p.id, "data_envio", v)} /></Td>
                    <Td>
                      <SelectCell value={p.status_arte || ""} options={STATUS_ARTE_OPTS} onSave={(v) => salvarStatus(p, v)} badge />
                    </Td>
                    <Td><DateCell value={p.prova_digital_recebida} onSave={(v) => salvarCampo(p.id, "prova_digital_recebida", v)} /></Td>
                    {isArqia && (
                      <Td><DateCell value={p.previsao_entrega} onSave={(v) => salvarCampo(p.id, "previsao_entrega", v)} /></Td>
                    )}
                    <Td><SelectCell value={p.producao || ""} options={PRODUCAO_OPTS} onSave={(v) => salvarCampo(p.id, "producao", v)} /></Td>
                    <Td><SelectCell value={p.plano || ""} options={PLANO_OPTS} onSave={(v) => salvarCampo(p.id, "plano", v)} /></Td>
                    <Td><TextCell value={p.obs || ""} onSave={(v) => salvarCampo(p.id, "obs", v)} /></Td>
                    <Td><LinkCell value={p.link_arte || ""} onSave={(v) => salvarCampo(p.id, "link_arte", v)} /></Td>
                    <Td><TextCell value={p.endereco_entrega || ""} onSave={(v) => salvarCampo(p.id, "endereco_entrega", v)} /></Td>
                    <Td><TextCell value={p.responsavel_contato || ""} onSave={(v) => salvarCampo(p.id, "responsavel_contato", v)} /></Td>
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
