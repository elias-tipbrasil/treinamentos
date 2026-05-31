import { requireAdmin } from "@/lib/require-admin";
import Sidebar, { ICONS } from "@/components/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  const sections = [
    {
      items: [
        { href: "/painel", label: "Sessões", icon: ICONS.dashboard },
        { href: "/painel/nova-sessao", label: "Nova Sessão", icon: ICONS.plus },
        { href: "/painel/dashboard", label: "Dashboard", icon: ICONS.chart },
        { href: "/painel/kickoff", label: "Kickoff", icon: ICONS.rocket },
      ],
    },
    {
      label: "Admin",
      items: [
        { href: "/admin", label: "Visão Geral", icon: ICONS.shield },
        { href: "/admin/treinamentos", label: "Treinamentos", icon: ICONS.book },
        { href: "/admin/palestrantes", label: "Palestrantes", icon: ICONS.users },
        { href: "/admin/relatorios", label: "Relatórios", icon: ICONS.file },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} sections={sections} />
      <main className="flex-1 min-w-0 overflow-x-auto">{children}</main>
    </div>
  );
}
