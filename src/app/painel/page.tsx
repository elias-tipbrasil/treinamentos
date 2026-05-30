import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PainelHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = createAdminClient();
  const { data: sessoes } = await supabase
    .from("sessoes")
    .select("id, pin, parceiro_isp, data_hora, status, treinamento:treinamentos(nome)")
    .eq("palestrante_id", user.id)
    .order("criada_em", { ascending: false })
    .limit(50);

  const sessoesList = (sessoes || []) as any[];
  const ativas = sessoesList.filter((s) => s.status === "ativa").length;
  const total = sessoesList.length;
  const agora = new Date();
  const proximas = sessoesList.filter((s) => new Date(s.data_hora) >= agora || s.status === "ativa");
  const passadas = sessoesList.filter((s) => new Date(s.data_hora) < agora && s.status !== "ativa");

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-medium text-zinc-900">Sessões</h1>
          <p className="text-sm text-zinc-500 mt-1">Gerencie suas sessões de treinamento</p>
        </div>
        <Link
          href="/painel/nova-sessao"
          className="inline-flex items-center gap-1.5 bg-[#E60012] hover:bg-[#B5000E] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova Sessão
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <KpiCard label="Sessões ativas" value={ativas} accent="green" />
        <KpiCard label="Total no histórico" value={total} />
        <KpiCard label="Treinamentos realizados" value={passadas.length} />
      </div>

      <SessoesTable titulo="Próximas e em andamento" sessoes={proximas} vazia="Nenhuma sessão programada" />

      {passadas.length > 0 && (
        <div className="mt-6">
          <SessoesTable titulo="Histórico" sessoes={passadas} vazia="" />
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: number; accent?: "green" }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4">
      <div className="text-xs text-zinc-500 mb-1.5">{label}</div>
      <div className={`text-2xl font-medium ${accent === "green" ? "text-emerald-600" : "text-zinc-900"}`}>{value}</div>
    </div>
  );
}

function SessoesTable({ titulo, sessoes, vazia }: { titulo: string; sessoes: any[]; vazia: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-900">{titulo}</div>
        <div className="text-xs text-zinc-500">{sessoes.length} sessão{sessoes.length !== 1 ? "ões" : ""}</div>
      </div>

      {sessoes.length === 0 ? (
        <div className="p-8 text-center text-sm text-zinc-500">{vazia}</div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {sessoes.map((s) => (
            <Link
              key={s.id}
              href={`/painel/sessao/${s.id}`}
              className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-zinc-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-sm font-medium text-zinc-900 tracking-wider bg-zinc-100 px-2 py-0.5 rounded">
                    {s.pin}
                  </span>
                  <span className="text-sm font-medium text-zinc-900 truncate">{s.treinamento?.nome}</span>
                </div>
                <div className="text-xs text-zinc-500">
                  {s.parceiro_isp} ·{" "}
                  {new Date(s.data_hora).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <StatusBadge status={s.status} />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-400 flex-shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ativa") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Ativa
      </span>
    );
  }
  if (status === "encerrada") {
    return (
      <span className="inline-flex items-center text-xs font-medium text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-md">
        Encerrada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
      {status}
    </span>
  );
}
