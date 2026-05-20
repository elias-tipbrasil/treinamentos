import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/painel");
  return user;
}
