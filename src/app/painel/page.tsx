import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import LogoutBtn from "./LogoutBtn";

export default async function PainelHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = createAdminClient();
  const { data: sessoes } = await supabase
    .from("sessoes")
    .select("id, pin, parceiro_isp, data_hora, status, treinamento:treinamentos(nome)")
    .eq("palestrante_id", user.id)
    .order("criada_em", { ascending: false })
    .limit(20);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--bg-surface-2)]">
        <div className="px-8 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-baseline gap-3">
            <Link href="/painel" className="font-display text-2xl tracking-tight">
              <span className="text-[var(--tip-red)]">TIP</span> BRASIL
            </Link>
            <span className="font-condensed text-[11px] tracking-[3px] uppercase text-[var(--text-muted)] border-l-2 border-[var(--tip-red)] pl-3">
              {user.nome}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user.role === "admin" && <Link href="/admin" className="font-condensed text-xs tracking-[2px] uppercase text-[var(--tip-red)] hover:underline">Admin</Link>}
            <LogoutBtn />
          </div>
        </div>
        <nav className="px-8 flex gap-6 border-t border-[var(--border)]">
          <NavLink href="/painel" active>Sessões</NavLink>
          <NavLink href="/painel/dashboard">Dashboard</NavLink>
        </nav>
      </header>

      <section className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="w-2.5 h-9 bg-[var(--tip-red)] translate-y-1"></span>
          <h1 className="font-display text-4xl tracking-tight leading-none">SESSÕES</h1>
        </div>
        <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8 ml-5">Suas execuções de treinamento</p>

        <div className="mb-8">
          <Link href="/painel/nova-sessao"
            className="inline-flex items-center gap-2 bg-[var(--tip-red)] hover:bg-[var(--tip-red-dark)] text-white px-5 py-3 font-condensed text-sm font-bold tracking-[1.3px] uppercase rounded-lg transition-all">
            + Nova Sessão
          </Link>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {!sessoes || sessoes.length === 0 ? (
            <div className="p-12 text-center font-condensed text-sm tracking-[2px] uppercase text-[var(--text-muted)]">
              Nenhuma sessão criada ainda
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-surface-2)]">
                  <th className="text-left px-6 py-3 font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">PIN</th>
                  <th className="text-left px-6 py-3 font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">Treinamento</th>
                  <th className="text-left px-6 py-3 font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">Parceiro</th>
                  <th className="text-left px-6 py-3 font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">Data</th>
                  <th className="text-left px-6 py-3 font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)]">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sessoes.map((s: any) => (
                  <tr key={s.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface-2)]">
                    <td className="px-6 py-4 font-condensed font-bold text-lg tracking-wider">{s.pin}</td>
                    <td className="px-6 py-4 text-sm">{s.treinamento?.nome}</td>
                    <td className="px-6 py-4 text-sm">{s.parceiro_isp}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                      {new Date(s.data_hora).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-condensed text-[11px] tracking-[1.5px] uppercase ${
                        s.status === "ativa"
                          ? "text-green-400 bg-green-500/10 border border-green-500/30"
                          : "text-[var(--text-muted)] bg-[var(--bg-surface-2)] border border-[var(--border)]"
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/painel/sessao/${s.id}`}
                        className="font-condensed text-xs tracking-[1.5px] uppercase text-[var(--tip-red)] hover:underline">
                        Abrir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link href={href} className={`py-3 font-condensed text-xs tracking-[2px] uppercase border-b-2 transition-all ${
      active ? "text-white border-[var(--tip-red)]" : "text-[var(--text-muted)] hover:text-white border-transparent hover:border-[var(--tip-red)]"
    }`}>
      {children}
    </Link>
  );
}
