export type Slide = { id: string; produto?: string };

export const SLIDES_BASE: Slide[] = [
  { id: "bem-vindo" },
  { id: "hero" },
  { id: "cronograma" },
  { id: "painel" },
  { id: "faq-integracao" },
  { id: "obrigado" },
];

export const PRODUTOS = [
  { id: "mvno1", label: "MVNO #1 · TIM" },
  { id: "mvno2", label: "MVNO #2 · TIM" },
  { id: "mvno3", label: "MVNO #3 · Vivo" },
  { id: "mvno4", label: "MVNO #4 · Multi (TIM + roaming Vivo)" },
  { id: "mvno_esim", label: "MVNO eSIM" },
  { id: "mvno_app", label: "MVNO App Whitelabel" },
  { id: "mvno_migracao", label: "MVNO Migração" },
  { id: "tv_tipmais", label: "TV TIP+" },
  { id: "tv_streaming", label: "TV Streaming" },
  { id: "tv_sky", label: "TV Sky" },
  { id: "fixa_proprio", label: "Telefonia Fixa · Servidor próprio" },
  { id: "fixa_tip", label: "Telefonia Fixa · Servidor TIP" },
  { id: "pabx_era", label: "PABX · Servidor ERA" },
  { id: "telemedicina", label: "Telemedicina" },
  { id: "seguros", label: "Seguros" },
  { id: "vision", label: "Vision" },
] as const;

export function getSlidesParaKickoff(_produtos: string[]): Slide[] {
  return SLIDES_BASE;
}
