import { buildDashboard } from "@/lib/dashboard/data";
import Dashboard from "@/components/dashboard/Dashboard";

interface SP { inicio?: string; fim?: string; palestranteId?: string; treinamentoId?: string; isp?: string }

export default async function AdminHome({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const data = await buildDashboard(sp);
  return <Dashboard data={data} filtros={sp} basePath="/admin" showPalestranteFiltro />;
}
