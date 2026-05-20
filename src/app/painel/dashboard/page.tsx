import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { buildDashboard } from "@/lib/dashboard/data";
import Dashboard from "@/components/dashboard/Dashboard";
import Link from "next/link";
import LogoutBtn from "../LogoutBtn";

interface SP { inicio?: string; fim?: string; treinamentoId?: string; isp?: string }

export default async function PainelDashboard({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const data = await buildDashboard(sp, user.id);

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
          <NavLink href="/painel">Sessões</NavLink>
          <NavLink href="/painel/dashboard">Dashboard</NavLink>
        </nav>
      </header>
      <Dashboard data={data} filtros={sp} basePath="/painel/dashboard" />
    </main>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="py-3 font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white border-b-2 border-transparent hover:border-[var(--tip-red)] transition-all">
      {children}
    </Link>
  );
}
