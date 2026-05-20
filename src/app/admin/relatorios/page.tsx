import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import RelatoriosFiltros from "./RelatoriosFiltros";

interface Search { isp?: string; treinamento?: string; status?: string }

export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("sessoes")
    .select("id, pin, parceiro_isp, data_hora, status, qtd_esperada, treinamento_id, treinamento:treinamentos(id, nome), palestrante:usuarios!sessoes_palestrante_id_fkey(nome), participantes(id)")
    .order("data_hora", { ascending: false });

  if (sp.isp) query = query.ilike("parceiro_isp", `%${sp.isp}%`);
  if (sp.treinamento) query = query.eq("treinamento_id", sp.treinamento);
  if (sp.status) query = query.eq("status", sp.status);

  const { data: sessoes } = await query;
  const { data: treinamentos } = await supabase.from("treinamentos").select("id, nome").order("nome");

  return (
    <section className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
        <h1 className="font-display text-4xl tracking-tight leading-none">RELATÓRIOS</h1>
      </div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">Sessões e resultados</p>

      <RelatoriosFiltros treinamentos={(treinamentos || []) as any} atual={sp} />

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden mt-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-surface-2)]">
              <Th>Data</Th><Th>PIN</Th><Th>Treinamento</Th><Th>Parceiro</Th><Th>Palestrante</Th><Th>Participantes</Th><Th>Status</Th><th></th>
            </tr>
          </thead>
          <tbody>
            {sessoes?.map((s: any) => (
              <tr key={s.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface-2)]">
                <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{new Date(s.data_hora).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</td>
                <td className="px-4 py-3 font-condensed font-bold tracking-wider">{s.pin}</td>
                <td className="px-4 py-3 text-sm">{s.treinamento?.nome}</td>
                <td className="px-4 py-3 text-sm">{s.parceiro_isp}</td>
                <td className="px-4 py-3 text-sm">{s.palestrante?.nome}</td>
                <td className="px-4 py-3 text-sm">{s.participantes?.length || 0}{s.qtd_esperada && ` / ${s.qtd_esperada}`}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full font-condensed text-[10px] tracking-[1.5px] uppercase ${
                    s.status === "ativa" ? "text-green-400 bg-green-500/10 border border-green-500/30" : "text-[var(--text-muted)] bg-[var(--bg-surface-2)] border border-[var(--border)]"
                  }`}>{s.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/relatorios/${s.id}`} className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--tip-red)] hover:underline">
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
            {(!sessoes || sessoes.length === 0) && (
              <tr><td colSpan={8} className="px-6 py-12 text-center font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">Nenhuma sessão encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">{children}</th>;
}
