import Link from "next/link";
import LogoutIconBtn from "@/components/LogoutIconBtn";

interface NavSection {
  label?: string;
  items: { href: string; label: string; icon: React.ReactNode }[];
}

export interface SidebarProps {
  user: { nome: string; email: string; role: string };
  sections: NavSection[];
}

export default function Sidebar({ user, sections }: SidebarProps) {
  return (
    <aside className="w-60 bg-zinc-900 text-white flex flex-col flex-shrink-0">
      {/* LOGO */}
      <div className="px-6 py-5 border-b border-zinc-800">
        <Link href={user.role === "admin" ? "/admin" : "/painel"} className="block">
          <div className="text-xl font-black tracking-tight leading-none">
            <span style={{ color: "var(--tip-red-bright)" }}>TIP</span>{" "}
            <span className="text-white">BRASIL</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1.5 tracking-wide">Sistema de Provas</div>
        </Link>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {sections.map((sec, i) => (
          <div key={i} className={i > 0 ? "mt-4" : ""}>
            {sec.label && (
              <div className="text-[10px] text-zinc-500 px-3 mb-2 tracking-[0.12em] uppercase font-medium">
                {sec.label}
              </div>
            )}
            <div className="space-y-0.5">
              {sec.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 text-zinc-400">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* RODAPÉ USUÁRIO */}
      <div className="px-4 py-3.5 border-t border-zinc-800 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-zinc-100 truncate">{user.nome}</div>
          <div className="text-[11px] text-zinc-500 truncate">{user.role}</div>
        </div>
        <LogoutIconBtn />
      </div>
    </aside>
  );
}

/* Ícones SVG mini (sem dependência externa) */
export const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};
