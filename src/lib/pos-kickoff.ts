import { PRODUTOS } from "@/lib/kickoff-slides";

export const LABELS: Record<string, string> = Object.fromEntries(PRODUTOS.map((p) => [p.id, p.label]));

// produtos com chip físico → mostram o bloco de gabarito do SIM
export const GABARITO_CHIP = new Set(["mvno1", "mvno2", "mvno3", "mvno4"]);

export const GABARITO_SIM = {
  titulo: "Crie a arte do SIM no padrão",
  desc: "Baixe o gabarito de frente e verso, respeite as marcas de corte e segurança. O verso deve ser predominantemente branco",
  rejeitar: [
    "Fundo 100% preenchido no verso",
    "Logo ou elemento entre os códigos do chip",
    "PNG com margem ou mockup de marcação",
    "Envio incompleto (menos de 4 arquivos)",
  ],
  link: "#",
  designer: "Sem time de design? Carol Nobre · 19 93500-7199 · nobrecarol73@gmail.com",
};
