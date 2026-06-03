export type Slide = {
  id: string;
  produto?: "mvno2" | "telefonia_fixa";
};

export const SLIDES_BASE: Slide[] = [
  { id: "bem-vindo" },                                 // bastão
  { id: "hero" },                                      // visibilidade total
  { id: "fluxo-mvno2", produto: "mvno2" },             // cronograma MVNO
  { id: "fluxo-telefonia", produto: "telefonia_fixa" },// cronograma Telefonia
  { id: "nosso-time" },                                // em tempo real (painel)
  { id: "faq-integracao" },                            // seis perguntas
  { id: "obrigado" },                                  // estratégia definida
];

export const PRODUTOS = [
  { id: "mvno2", label: "MVNO #2" },
  { id: "telefonia_fixa", label: "Telefonia Fixa" },
] as const;

export function getSlidesParaKickoff(produtos: string[]): Slide[] {
  return SLIDES_BASE.filter((s) => !s.produto || produtos.includes(s.produto));
}
