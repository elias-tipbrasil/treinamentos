import Link from "next/link";
import { getTema, ICONES } from "@/lib/projeto-temas";

interface Props {
  href: string;
  eyebrow: string;
  titulo: string;
  metaItems?: string[];
  cor?: string | null;
  icone?: string | null;
}

export default function ProjetoTile({ href, eyebrow, titulo, metaItems = [], cor, icone }: Props) {
  const tema = getTema(cor);
  const iconePath = icone && ICONES[icone] ? ICONES[icone] : ICONES.grid;

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-3xl border border-[var(--border)] transition-all duration-500 hover:scale-[1.04] hover:border-white/20 hover:z-10"
      style={{ aspectRatio: "16/9", background: tema.gradient }}
    >
      {/* ícone de fundo gigante */}
      <div className="pointer-events-none absolute top-1/2 right-[-40px] -translate-y-1/2 opacity-[0.15] transition-all duration-500 group-hover:opacity-30 group-hover:scale-110 group-hover:-rotate-3">
        <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          {iconePath.split(/\s+(?=[MmLlHhVvCcSsQqTtAaZz])/).map((d, i) => <path key={i} d={d} />)}
        </svg>
      </div>

      {/* conteúdo */}
      <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
        <div className="text-[10px] tracking-[0.3em] uppercase font-medium text-white/60 mb-1.5">{eyebrow}</div>
        <h3 className="font-display text-2xl md:text-4xl leading-tight" style={{ letterSpacing: "-0.03em" }}>
          {titulo}
        </h3>
        {metaItems.length > 0 && (
          <div className="mt-2 flex items-center gap-3 text-xs text-white/70 flex-wrap">
            {metaItems.map((m, i) => (
              <span key={i} className="flex items-center gap-3">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-white/40"></span>}
                <span dangerouslySetInnerHTML={{ __html: m }} />
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/* Tile especial pra "Adicionar novo" (admin) */
export function ProjetoTileNovo({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--tip-red)] hover:text-white transition-all duration-300"
      style={{ aspectRatio: "16/9" }}
    >
      <div className="text-5xl font-light">+</div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-[10px] tracking-[0.25em] uppercase opacity-50">Visível só pra admin</div>
    </Link>
  );
}
