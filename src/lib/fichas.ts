export type Campo = {
  id: string; label: string;
  tipo: "texto" | "texto_longo" | "numero" | "email" | "telefone" | "data" | "cep" | "uf" | "checkbox";
  obrigatorio: boolean; hint?: string; lgpd?: string; maxLength?: number;
};
export type Secao = { titulo: string; campos: Campo[] };
export type FichaSchema = { titulo: string; subtitulo?: string; secoes: Secao[] };

const ENDERECO = (p = ""): Campo[] => [
  { id: p + "cep", label: "CEP", tipo: "cep", obrigatorio: true },
  { id: p + "logradouro", label: "Endereço (logradouro)", tipo: "texto", obrigatorio: true },
  { id: p + "numero", label: "Número", tipo: "texto", obrigatorio: true },
  { id: p + "complemento", label: "Complemento", tipo: "texto", obrigatorio: false },
  { id: p + "bairro", label: "Bairro", tipo: "texto", obrigatorio: true },
  { id: p + "cidade", label: "Cidade", tipo: "texto", obrigatorio: true },
  { id: p + "uf", label: "UF", tipo: "uf", obrigatorio: true },
];

export const FICHAS: Record<string, FichaSchema> = {
  mvno1: {
    titulo: "Vamos abrir seu MVNO",
    subtitulo: "Preencha pra liberarmos os acessos e iniciar a produção. Todos os campos são obrigatórios",
    secoes: [
      { titulo: "Acessos · Perfil Administrador", campos: [
        { id: "nome_completo", label: "Nome completo", tipo: "texto", obrigatorio: true },
        { id: "cpf", label: "CPF", tipo: "texto", obrigatorio: true, lgpd: "Privacidade e Segurança (LGPD): dado usado exclusivamente para identificação do responsável e liberação de acessos. Tratamento seguro e sigiloso conforme a LGPD e o contrato entre o Parceiro e a TIP Brasil." },
        { id: "data_nascimento", label: "Data de nascimento", tipo: "data", obrigatorio: true },
        { id: "telefone", label: "Telefone / WhatsApp", tipo: "telefone", obrigatorio: true },
        { id: "email", label: "E-mail corporativo", tipo: "email", obrigatorio: true },
        ...ENDERECO(),
      ]},
      { titulo: "Empresa", campos: [
        { id: "razao_social", label: "Razão social", tipo: "texto", obrigatorio: true },
        { id: "nome_fantasia", label: "Nome fantasia", tipo: "texto", obrigatorio: true },
        { id: "cnpj", label: "CNPJ", tipo: "texto", obrigatorio: true },
      ]},
      { titulo: "Logística e entrega · Chips físicos", campos: [
        { id: "resp_recebimento", label: "Responsável pelo recebimento", tipo: "texto", obrigatorio: true },
        { id: "cpf_recebedor", label: "CPF do responsável", tipo: "texto", obrigatorio: true },
        { id: "tel_recebedor", label: "Telefone do recebedor", tipo: "telefone", obrigatorio: true },
        ...ENDERECO("ent_"),
        { id: "ponto_referencia", label: "Ponto de referência", tipo: "texto", obrigatorio: true },
      ]},
      { titulo: "Projeto MVNO #1", campos: [
        { id: "perfil_eletronico", label: "Nome para perfil eletrônico TIM", tipo: "texto", obrigatorio: true, maxLength: 15, hint: "Máx. 15 caracteres, sem acentos ou símbolos. É o nome que aparece no celular do cliente final." },
      ]},
      { titulo: "Confirmação", campos: [
        { id: "declaracao", label: "Declaro que conferi todos os dados. Estou ciente de que a TIP Brasil seguirá o endereço e as definições de perfil aqui registrados. Em caso de mudança (endereço, e-mail ou nome de perfil), comprometo-me a informar o time de Onboarding imediatamente, sob risco de entrega em local errado ou erro na gravação do perfil.", tipo: "checkbox", obrigatorio: true },
      ]},
    ],
  },
};

// MVNO físicos reusam a mesma ficha por ora (ajustamos textos por produto depois)
FICHAS.mvno2 = FICHAS.mvno1;
FICHAS.mvno3 = FICHAS.mvno1;
FICHAS.mvno4 = FICHAS.mvno1;
