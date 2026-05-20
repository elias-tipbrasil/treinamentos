"use client";
import { useRouter } from "next/navigation";

export default function LogoutBtn() {
  const router = useRouter();
  return (
    <button
      onClick={async () => { await fetch("/api/logout", { method: "POST" }); router.push("/"); router.refresh(); }}
      className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] hover:text-white">
      Sair
    </button>
  );
}
