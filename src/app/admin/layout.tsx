import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";
import LogoutBtn from "../painel/LogoutBtn";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--bg-surface-2)]">
        <div className="px-8 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-baseline gap-3">
            <Link href="/admin" className="font-display text-2xl tracking-tight">
              <span className="text-[var(--tip-red)]">TIP</span> BRASIL
            </Link>
            <span className="font-condensed text-[11px] tracking-[3px] uppercase text-[var(--text-muted)] border-l-2 border-[var(--tip-red)] pl-3">
              Admin · {user.nome}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/painel" className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white">Painel</Link>
            <LogoutBtn />
          </div>
        </div>
        <nav className="px-8 flex gap-6 border-t border-[var(--border)]">
          <AdminLink href="/admin">Dashboard</AdminLink>
          <AdminLink href="/admin/treinamentos">Treinamentos</AdminLink>
          <AdminLink href="/admin/palestrantes">Palestrantes</AdminLink>
          <AdminLink href="/admin/relatorios">Relatórios</AdminLink>
        </nav>
      </header>
      {children}
    </main>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="py-3 font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white border-b-2 border-transparent hover:border-[var(--tip-red)] transition-all">
      {children}
    </Link>
  );
}
