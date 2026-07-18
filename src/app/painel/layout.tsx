import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar, { ICONS } from "@/components/Sidebar";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = user.role === "admin";

  const sections = [
    {
      items: [
        { href: "/painel", label: "Treinamento", icon: ICONS.dashboard },
        { href: "/painel/nova-sessao", label: "Novo Treinamento", icon: ICONS.plus },
        { href: "/painel/dashboard", label: "Dashboard", icon: ICONS.chart },
        { href: "/painel/kickoff", label: "Kickoff", icon: ICONS.rocket },
        { href: "/painel/chip", label: "Controle de Chip", icon: ICONS.sim },
        { href: "/painel/projetos", label: "Projetos", icon: ICONS.folder },
      ],
    },
    ...(isAdmin
      ? [{
          label: "Admin",
          items: [
            { href: "/admin/treinamentos", label: "Treinamentos", icon: ICONS.book },
            { href: "/admin/palestrantes", label: "Palestrantes", icon: ICONS.users },
            { href: "/admin/relatorios", label: "Relatórios", icon: ICONS.file },
        { href: "/admin/projetos", label: "Projetos · Admin", icon: ICONS.folder },
          ],
        }]
      : []),
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} sections={sections} />
      <main className="flex-1 min-w-0 overflow-x-auto">{children}</main>
    </div>
  );
}
