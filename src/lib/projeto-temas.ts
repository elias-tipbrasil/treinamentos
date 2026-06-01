export const TEMAS = {
  vermelho: {
    gradient: "radial-gradient(ellipse at 70% 20%, rgba(227,6,19,0.4) 0%, transparent 60%), linear-gradient(135deg, #1a0608 0%, #000 60%, #0a0a0a 100%)",
    accent: "#FF1A2E",
  },
  ambar: {
    gradient: "radial-gradient(ellipse at 30% 80%, rgba(245,158,11,0.3) 0%, transparent 60%), linear-gradient(135deg, #1a1100 0%, #000 60%, #0a0a0a 100%)",
    accent: "#fbbf24",
  },
  azul: {
    gradient: "radial-gradient(ellipse at 70% 30%, rgba(99,102,241,0.3) 0%, transparent 60%), linear-gradient(135deg, #0a0a1a 0%, #000 60%, #0a0a0a 100%)",
    accent: "#818cf8",
  },
  verde: {
    gradient: "radial-gradient(ellipse at 30% 30%, rgba(34,197,94,0.3) 0%, transparent 60%), linear-gradient(135deg, #001a0e 0%, #000 60%, #0a0a0a 100%)",
    accent: "#4ade80",
  },
  neutro: {
    gradient: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 60%), linear-gradient(135deg, #1a1a1a 0%, #000 60%, #0a0a0a 100%)",
    accent: "#ffffff",
  },
} as const;

export type TemaCor = keyof typeof TEMAS;

export const TEMAS_OPTIONS: { id: TemaCor; label: string }[] = [
  { id: "vermelho", label: "Vermelho" },
  { id: "ambar", label: "Âmbar" },
  { id: "azul", label: "Azul" },
  { id: "verde", label: "Verde" },
  { id: "neutro", label: "Neutro" },
];

export function getTema(cor: string | null | undefined) {
  return TEMAS[(cor as TemaCor) || "vermelho"] || TEMAS.vermelho;
}

/* SVG paths em viewBox 24x24 */
export const ICONES: Record<string, string> = {
  sim:      "M5 3h11a3 3 0 013 3v12a3 3 0 01-3 3H5a3 3 0 01-3-3V6a3 3 0 013-3z M8 12h6v5H8z",
  phone:    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  tv:       "M2 7h20v12H2z M8 23h8 M12 19v4",
  camera:   "M12 8a4 4 0 100 8 4 4 0 000-8z M3 7h4l2-3h6l2 3h4v13H3z",
  grid:     "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  rocket:   "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  cloud:    "M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z",
};

export const ICONES_OPTIONS: { id: string; label: string }[] = [
  { id: "sim",    label: "SIM Card" },
  { id: "phone",  label: "Telefone" },
  { id: "tv",     label: "TV" },
  { id: "camera", label: "Câmera" },
  { id: "grid",   label: "Grid" },
  { id: "rocket", label: "Foguete" },
  { id: "shield", label: "Escudo" },
  { id: "cloud",  label: "Nuvem" },
];
