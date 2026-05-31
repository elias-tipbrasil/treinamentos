export type Slide = {
  id: string;
  produto?: "mvno2" | "telefonia_fixa"; // se setado, só aparece quando o produto está selecionado
};

export const SLIDES_BASE: Slide[] = [
  { id: "bem-vindo" },
  { id: "hero" },
  { id: "nosso-time" },
  { id: "importante" },
  { id: "faq-integracao" },
  { id: "fluxo-mvno2", produto: "mvno2" },
  { id: "fluxo-telefonia", produto: "telefonia_fixa" },
  { id: "obrigado" },
];

export const PRODUTOS = [
  { id: "mvno2", label: "MVNO #2" },
  { id: "telefonia_fixa", label: "Telefonia Fixa" },
] as const;

export function getSlidesParaKickoff(produtos: string[]): Slide[] {
  return SLIDES_BASE.filter((s) => !s.produto || produtos.includes(s.produto));
}
