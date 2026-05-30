"use client";
import { useRouter } from "next/navigation";

export default function LogoutIconBtn() {
  const router = useRouter();
  return (
    <button
      title="Sair"
      aria-label="Sair"
      onClick={async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors flex-shrink-0"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  );
}
