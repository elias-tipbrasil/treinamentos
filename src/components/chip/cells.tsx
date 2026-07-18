"use client";
import { useEffect, useState } from "react";

export function limparCodEasy(v: string | null) {
  if (!v) return "";
  return v.replace(/\.0$/, "");
}

export function Th({ children, w, align, sticky, left }: { children?: React.ReactNode; w?: string; align?: "left" | "right"; sticky?: boolean; left?: string }) {
  return (
    <th
      className={`px-3 py-3 font-normal ${align === "right" ? "text-right" : "text-left"} ${sticky ? "sticky z-20 relative bg-[var(--bg-surface)] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-[var(--border)]" : ""}`}
      style={{ ...(w ? { width: w } : {}), ...(sticky ? { left } : {}) }}
    >
      {children}
    </th>
  );
}
export function Td({ children, align, sticky, left }: { children: React.ReactNode; align?: "left" | "right"; sticky?: boolean; left?: string }) {
  return (
    <td
      className={`px-2 py-1 align-middle overflow-hidden ${align === "right" ? "text-right" : ""} ${sticky ? "sticky z-10 relative bg-[var(--bg-surface)] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-[var(--border)]" : ""}`}
      style={sticky ? { left } : undefined}
    >
      {children}
    </td>
  );
}

export function TextCell({ value, onSave, bold }: { value: string; onSave: (v: string) => void; bold?: boolean }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const cor = bold ? "font-medium text-white" : v.trim() ? "text-white" : "text-[var(--text-muted)]";
  return (
    <input
      value={v}
      title={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { if (v !== value) onSave(v); }}
      className={`w-full bg-transparent border border-transparent hover:border-[var(--border-strong)] focus:border-[var(--tip-red)] rounded-md px-2 py-1.5 outline-none text-sm truncate ${cor}`}
    />
  );
}

export function NumberCell({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [v, setV] = useState(String(value ?? 0));
  useEffect(() => setV(String(value ?? 0)), [value]);
  return (
    <input
      type="number"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { const n = Number(v) || 0; if (n !== value) onSave(n); }}
      className="w-full bg-transparent border border-transparent hover:border-[var(--border-strong)] focus:border-[var(--tip-red)] rounded-md px-2 py-1.5 outline-none text-sm text-right"
    />
  );
}

export function DateCell({ value, onSave }: { value: string | null; onSave: (v: string) => void }) {
  const [v, setV] = useState(value || "");
  useEffect(() => setV(value || ""), [value]);
  return (
    <input
      type="date"
      value={v}
      onChange={(e) => { setV(e.target.value); onSave(e.target.value); }}
      className={`w-full bg-transparent border border-transparent hover:border-[var(--border-strong)] focus:border-[var(--tip-red)] rounded-md px-1 py-1.5 outline-none text-sm ${v ? "text-white" : "text-[var(--text-muted)]"}`}
    />
  );
}

export function SelectCell({ value, options, onSave, badge }: { value: string; options: string[]; onSave: (v: string) => void; badge?: boolean }) {
  const cor = badge
    ? value === "Pronto" ? "text-green-400" : value.toLowerCase().includes("aguard") ? "text-yellow-400" : "text-white"
    : "text-white";
  return (
    <select
      value={value}
      title={value}
      onChange={(e) => onSave(e.target.value)}
      className={`w-full appearance-none bg-transparent border border-transparent hover:border-[var(--border-strong)] focus:border-[var(--tip-red)] rounded-md pl-2 pr-5 py-1.5 outline-none text-sm truncate cursor-pointer bg-no-repeat bg-[right_0.3rem_center] ${cor}`}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")" }}
    >
      <option value="" className="text-[var(--text-muted)]">—</option>
      {options.map((o) => <option key={o} value={o} className="text-white bg-[var(--bg-surface)]">{o}</option>)}
    </select>
  );
}

export function OperadoraBadge({ label }: { label: string }) {
  const cores: Record<string, string> = {
    "Surf Chip": "text-[#818cf8] bg-[#818cf8]/10",
    "Telecall Chip": "text-[#FF1A2E] bg-[#FF1A2E]/10",
    "Arqia Chip": "text-[#fbbf24] bg-[#fbbf24]/10",
    "Valhalla Chip": "text-white bg-white/10",
    "Surf E-sim": "text-[#818cf8] bg-[#818cf8]/10",
    "Telecall E-sim": "text-[#FF1A2E] bg-[#FF1A2E]/10",
    "Arqia E-sim": "text-[#fbbf24] bg-[#fbbf24]/10",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${cores[label] || "text-white bg-white/10"}`}>
      {label}
    </span>
  );
}

export function LinkCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editando, setEditando] = useState(!value);
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); setEditando(!value); }, [value]);

  if (!editando && value) {
    return (
      <div className="flex items-center gap-1">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 truncate px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 hover:bg-white/10 text-blue-300 text-center"
          title={value}
        >
          Ver arte ↗
        </a>
        <button onClick={() => setEditando(true)} title="Editar link" className="text-[var(--text-muted)] hover:text-white text-xs px-1">✎</button>
        <button onClick={() => { setV(""); onSave(""); }} title="Remover link" className="text-[var(--text-muted)] hover:text-red-400 text-xs px-1">✕</button>
      </div>
    );
  }

  return (
    <input
      value={v}
      autoFocus={editando && !!value}
      placeholder="Colar link..."
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { onSave(v); setEditando(!v); }}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className="w-full bg-transparent border border-transparent hover:border-[var(--border-strong)] focus:border-[var(--tip-red)] rounded-md px-2 py-1.5 outline-none text-sm text-[var(--text-muted)] truncate"
    />
  );
}

export function Kpi({ label, value, destaque }: { label: string; value: string; destaque?: boolean }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-4">
      <div className="font-condensed text-[10px] tracking-[2.5px] uppercase text-[var(--text-muted)] mb-2">{label}</div>
      <div className={`font-display text-2xl ${destaque ? "text-yellow-400" : ""}`}>{value}</div>
    </div>
  );
}
