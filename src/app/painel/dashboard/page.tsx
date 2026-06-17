import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { buildDashboard } from "@/lib/dashboard/data";
import { buildKickoffDashboard } from "@/lib/dashboard/kickoffs";
import Dashboard from "@/components/dashboard/Dashboard";

interface SP { inicio?: string; fim?: string; treinamentoId?: string; isp?: string }

export default async function PainelDashboard({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const data = await buildDashboard(sp, user.role === "admin" ? undefined : user.id);
  const kickoffData = await buildKickoffDashboard(sp, user.role === "admin" ? undefined : user.id);
  return <Dashboard data={data} filtros={sp} basePath="/painel/dashboard" kickoffData={kickoffData} />;
}
