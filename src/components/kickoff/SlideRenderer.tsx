import type { Slide } from "@/lib/kickoff-slides";

export default function SlideRenderer({ slide, nomeCliente }: { slide: Slide; nomeCliente: string }) {
  switch (slide.id) {
    case "bem-vindo":          return <Bastao />;
    case "hero":               return <Visibilidade />;
    case "nosso-time":         return <Painel />;
    case "importante":         return <Importante />;
    case "faq-integracao":     return <FAQIntegracao />;
    case "fluxo-mvno2":        return <FluxoMVNO />;
    case "fluxo-telefonia":    return <FluxoTelefonia />;
    case "obrigado":           return <Obrigado nomeCliente={nomeCliente} />;
    default:                   return <div className="w-full h-full bg-black text-white flex items-center justify-center">Slide {slide.id}</div>;
  }
}

/* ===== WRAPPER ===== */
function SlideBase({ children, gradient = "default" }: { children: React.ReactNode; gradient?: "default" | "red" | "deep" }) {
  const grads = {
    default: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(227,6,19,0.07), transparent 70%), linear-gradient(180deg, #000 0%, #0a0a0a 100%)",
    red:     "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(227,6,19,0.30), transparent 70%), linear-gradient(180deg, #1a0608 0%, #000 100%)",
    deep:    "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(227,6,19,0.16), transparent 70%), linear-gradient(180deg, #050505 0%, #000 100%)",
  };
  return (
    <div className="w-full h-full relative overflow-hidden text-white" style={{ background: grads[gradient] }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      <div className="relative w-full h-full">{children}</div>
    </div>
  );
}

const ANIM = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
`;

/* ===== 1 · PASSAGEM DE BASTÃO ===== */
function Bastao() {
  return (
    <SlideBase gradient="deep">
      <style>{ANIM + `
        .b-eye { animation: fadeUp 0.8s ease-out 0.1s both; }
        .b-from { animation: fadeUp 0.9s ease-out 0.5s both; }
        .b-to { animation: scaleIn 1s ease-out 1.0s both; }
        .b-sub { animation: fadeUp 0.9s ease-out 1.6s both; }
      `}</style>
      <div className="w-full h-full flex flex-col items-center justify-center px-12 text-center">
        <p className="b-eye text-xs md:text-sm tracking-[0.5em] text-[var(--tip-red)] uppercase mb-10 font-medium">Passagem de bastão</p>
        <h1 className="font-display leading-[0.92]" style={{ letterSpacing: "-0.05em" }}>
          <span className="b-from block text-6xl md:text-8xl text-zinc-600 line-through decoration-2">Comercial</span>
          <span className="b-to block text-7xl md:text-[9rem] text-[var(--tip-red)] mt-2">Onboard</span>
        </h1>
        <p className="b-sub mt-16 max-w-2xl text-xl md:text-2xl text-zinc-300 font-light leading-snug">
          O ciclo comercial está concluído.<br/>
          <span className="text-white font-medium">A entrega até o Go Live começa aqui.</span>
        </p>
      </div>
    </SlideBase>
  );
}

/* ===== 2 · VISIBILIDADE TOTAL ===== */
function Visibilidade() {
  return (
    <SlideBase gradient="default">
      <style>{ANIM + `
        .v-eye { animation: fadeUp 0.8s ease-out 0.1s both; }
        .v-title { animation: scaleIn 1s ease-out 0.5s both; }
        .v-sub { animation: fadeUp 0.9s ease-out 1.1s both; }
      `}</style>
      <div className="w-full h-full flex flex-col items-center justify-center px-12 text-center">
        <p className="v-eye text-xs md:text-sm tracking-[0.5em] text-[var(--tip-red)] uppercase mb-8 font-medium">Bem-vindo</p>
        <h1 className="v-title font-display text-7xl md:text-[9rem] leading-[0.92]" style={{ letterSpacing: "-0.05em" }}>
          Visibilidade<br/><span className="text-[var(--tip-red)]">total</span>
        </h1>
        <p className="v-sub mt-14 max-w-2xl text-xl md:text-3xl text-zinc-300 font-light leading-snug">
          Esta reunião tem um objetivo único.<br/>
          <span className="text-white font-medium">Você sai com tudo claro.</span>
        </p>
      </div>
    </SlideBase>
  );
}

/* ===== 3 · EM TEMPO REAL (painel) ===== */
function Painel() {
  const itens = [
    "Conversas entre nosso time e o projeto",
    "Responsabilidades do seu ISP",
    "Onde anexa as informações que precisamos para seguir com o projeto",
    "Acompanhamento de todo o cronograma",
    "Comunicação referente ao projeto com nosso time e vice-versa",
  ];
  return (
    <SlideBase gradient="default">
      <style>{ANIM + `
        .p-left { animation: fadeUp 0.9s ease-out 0.2s both; }
        .p-img { animation: scaleIn 1s ease-out 0.5s both; }
      `}</style>
      <div className="w-full h-full grid md:grid-cols-[0.82fr_1.18fr] gap-12 items-center px-16 max-w-[1500px] mx-auto">
        <div className="p-left">
          <p className="text-xs tracking-[0.4em] text-[var(--tip-red)] uppercase mb-4 font-medium">Acompanhamento</p>
          <h2 className="font-display text-5xl md:text-7xl leading-tight mb-6" style={{ letterSpacing: "-0.035em" }}>Em tempo real</h2>
          <p className="text-zinc-400 text-lg font-light leading-relaxed mb-8">
            Cada projeto recebe um painel dedicado no CRM da TIP.<br/>
            <span className="text-white font-medium">Acesso por link único. Sem solicitar atualizações.</span>
          </p>
          <ul className="space-y-0">
            {itens.map((it, i) => (
              <li key={i} className="flex gap-4 items-start py-4 border-t border-white/10">
                <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--tip-red)] text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-zinc-300 text-[15px] leading-snug pt-1">{it}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-img relative">
          <div className="absolute inset-0 blur-[80px] scale-[1.3]" style={{ background: "radial-gradient(ellipse at center, rgba(227,6,19,0.18), transparent 65%)" }} />
          <img src="/kickoff-painel.jpg" alt="Painel do projeto no CRM da TIP"
               className="relative w-full h-auto rounded-2xl border border-white/10"
               style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.8), 0 50px 160px rgba(227,6,19,0.12)" }} />
        </div>
      </div>
    </SlideBase>
  );
}

/* ===== 4 · IMPORTANTE ===== */
function Importante() {
  return (
    <SlideBase gradient="red">
      <style>{ANIM + `
        .i-label { animation: fadeUp 0.7s ease-out 0.2s both; }
        .i-title { animation: scaleIn 1s ease-out 0.6s both; }
        .i-text { animation: fadeUp 0.9s ease-out 1.2s both; }
      `}</style>
      <div className="w-full h-full flex flex-col items-center justify-center px-12 text-center">
        <p className="i-label text-xs tracking-[0.5em] text-zinc-300 uppercase mb-8 font-medium">Importante</p>
        <h2 className="i-title font-display text-6xl md:text-8xl leading-[0.95] mb-14 max-w-5xl" style={{ letterSpacing: "-0.04em" }}>
          Velocidade<br/>define a entrega
        </h2>
        <div className="i-text max-w-3xl space-y-5 text-xl md:text-2xl text-zinc-200 font-light leading-relaxed">
          <p>Para acelerar <span className="font-medium text-white">o resultado</span>, é fundamental <span className="font-medium text-white">responder e enviar rapidamente</span> as informações solicitadas.</p>
          <p className="text-lg md:text-xl text-zinc-400">A entrega pode ser comprometida caso falte informação ou haja demora no envio.</p>
        </div>
      </div>
    </SlideBase>
  );
}

/* ===== 5 · FAQ ===== */
function FAQIntegracao() {
  const faqs = [
    { q: "Quem realiza a integração com o ERP?", a: "A TIP entrega APIs e Token. A integração é executada pelo ERP, que escreve na plataforma da TIP." },
    { q: "Quais ERPs estão integrados?", a: "Cerca de 70% dos ERPs do mercado de provedores. Para os demais, a equipe orienta o processo." },
    { q: "Quem é responsável pelo ticket de integração?", a: "O ISP. Após liberação do Token e API, o ISP abre o ticket no ERP para executar a integração." },
    { q: "Tem custo para integrar?", a: "Não há custo por parte da TIP. Eventuais custos dependem do acordo entre o ISP e o ERP." },
    { q: "Como saber se está homologado?", a: "Em uma reunião de homologação, com testes conjuntos de todos os fluxos críticos." },
    { q: "Quais funções a integração cobre?", a: "Bloqueio e desbloqueio automático, ativação de serviços e funções específicas conforme o ERP." },
  ];
  return (
    <SlideBase gradient="default">
      <style>{ANIM + faqs.map((_, i) => `.f-${i} { animation: fadeUp 0.7s ease-out ${0.4 + i * 0.1}s both; }`).join("\n") + `
        .f-title { animation: fadeUp 0.8s ease-out 0.1s both; }
      `}</style>
      <div className="w-full h-full flex flex-col justify-center px-16 max-w-7xl mx-auto">
        <div className="f-title mb-12">
          <p className="text-xs tracking-[0.4em] text-[var(--tip-red)] uppercase mb-4 font-medium">Dúvidas frequentes</p>
          <h2 className="font-display text-5xl md:text-7xl leading-tight" style={{ letterSpacing: "-0.035em" }}>Seis perguntas</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          {faqs.map((f, i) => (
            <div key={i} className={`f-${i}`}>
              <h4 className="text-lg md:text-xl font-medium mb-2 text-white leading-snug">{f.q}</h4>
              <p className="text-zinc-400 text-base md:text-lg font-light leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  );
}

/* ===== CRONOGRAMA (cards opção 2) ===== */
type Etapa = { tag: string; titulo: string; cor: "amber" | "red" | "green"; itens: string[] };
function Cronograma({ produto, etapas }: { produto: string; etapas: Etapa[] }) {
  const cores = {
    amber: { dot: "#f59e0b", bg: "rgba(245,158,11,0.12)", text: "#fbbf24" },
    red:   { dot: "#e30613", bg: "rgba(227,6,19,0.14)",  text: "#ff5366" },
    green: { dot: "#22c55e", bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
  };
  return (
    <SlideBase gradient="default">
      <style>{ANIM + etapas.map((_, i) => `.c-${i} { animation: fadeUp 0.6s ease-out ${0.4 + i * 0.1}s both; }`).join("\n") + `
        .c-title { animation: fadeUp 0.8s ease-out 0.1s both; }
      `}</style>
      <div className="w-full h-full flex flex-col justify-center px-12 max-w-[1500px] mx-auto">
        <div className="c-title text-center mb-12">
          <p className="text-xs tracking-[0.4em] text-[var(--tip-red)] uppercase mb-3 font-medium">A jornada · {produto}</p>
          <h2 className="font-display text-5xl md:text-7xl leading-tight" style={{ letterSpacing: "-0.035em" }}>Cronograma</h2>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${etapas.length}, minmax(0, 1fr))` }}>
          {etapas.map((e, i) => {
            const c = cores[e.cor];
            return (
              <div key={i} className={`c-${i} rounded-2xl p-5 bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-white/10`} style={{ borderLeft: `3px solid ${c.dot}` }}>
                <div className="text-[10px] tracking-[0.3em] text-white/35 mb-3">{String(i + 1).padStart(2, "0")}</div>
                <span className="inline-block text-[9px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold mb-3" style={{ background: c.bg, color: c.text }}>{e.tag}</span>
                <h3 className="text-base font-semibold leading-tight mb-3" style={{ letterSpacing: "-0.02em" }}>{e.titulo}</h3>
                <ul className="space-y-1.5">
                  {e.itens.map((it, j) => (
                    <li key={j} className="flex gap-2 text-[11px] text-white/60 leading-snug">
                      <span style={{ color: c.dot }}>•</span><span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </SlideBase>
  );
}

function FluxoMVNO() {
  return <Cronograma produto="MVNO" etapas={[
    { tag: "Imediato",                  titulo: "Cadastro",    cor: "amber", itens: ["Cadastro do parceiro", "Cadastro de produtos", "Reunião de kickoff", "Envio das informações ao ISP"] },
    { tag: "Aguarda você",              titulo: "Arte do chip", cor: "red",  itens: ["Criação da arte conforme gabarito", "Nome do perfil eletrônico", "Preenchimento da ficha", "Envio para a TIP Brasil"] },
    { tag: "+ 10 dias",                 titulo: "Aprovação",   cor: "amber", itens: ["Arte enviada para aprovação", "Arte aprovada", "Início da produção"] },
    { tag: "+ 1 dia",                   titulo: "Acessos",     cor: "amber", itens: ["Plataforma MVNO", "Ticket", "EAD", "APIs"] },
    { tag: "Aguarda você",              titulo: "Integração",  cor: "red",   itens: ["Ticket com seu ERP para integração", "Envio de OK à TIP Brasil", "Integração pronta"] },
    { tag: "+ 10 dias",                 titulo: "Homologação", cor: "amber", itens: ["Reunião de homologação da integração", "Treinamento das plataformas"] },
    { tag: "+ 40 dias após aprovação",  titulo: "Entrega",     cor: "amber", itens: ["Produção dos chips finalizada", "Gravação do perfil eletrônico", "Envio ao parceiro"] },
    { tag: "Go Live",                   titulo: "Operação",    cor: "green", itens: ["Início da operação e venda"] },
  ]} />;
}

function FluxoTelefonia() {
  return <Cronograma produto="Telefonia Fixa" etapas={[
    { tag: "Imediato",     titulo: "Cadastro",     cor: "amber", itens: ["Cadastro do parceiro", "Cadastro de produtos", "Reunião de kickoff", "Envio das informações ao ISP"] },
    { tag: "Aguarda você", titulo: "Documentação", cor: "red",   itens: ["Envio dos documentos", "Planilha de produtos"] },
    { tag: "+ 10 dias",    titulo: "Liberação",    cor: "amber", itens: ["Plataformas de telefonia e ticket", "APIs de integração"] },
    { tag: "Aguarda você", titulo: "Integração",   cor: "red",   itens: ["Ticket com seu ERP para integração", "Integração pronta"] },
    { tag: "+ 10 dias",    titulo: "Homologação",  cor: "amber", itens: ["Reunião de homologação", "Treinamento das plataformas"] },
    { tag: "Go Live",      titulo: "Operação",     cor: "green", itens: ["Início da operação e venda"] },
  ]} />;
}

/* ===== 8 · FINAL ===== */
function Obrigado({ nomeCliente }: { nomeCliente: string }) {
  return (
    <SlideBase gradient="red">
      <style>{ANIM + `
        .o-label { animation: fadeUp 0.7s ease-out 0.2s both; }
        .o-title { animation: scaleIn 1.2s ease-out 0.6s both; }
        .o-card { animation: fadeUp 0.9s ease-out 1.2s both; }
        .o-sub { animation: fadeUp 0.9s ease-out 1.6s both; }
      `}</style>
      <div className="w-full h-full flex flex-col items-center justify-center px-12 text-center">
        <p className="o-label text-xs tracking-[0.5em] text-zinc-300 uppercase mb-8 font-medium">Obrigado</p>
        <h1 className="o-title font-display text-7xl md:text-[8rem] leading-[0.92] mb-10 max-w-6xl" style={{ letterSpacing: "-0.045em" }}>
          Estratégia<br/><span className="text-zinc-300">definida</span>
        </h1>
        <div className="o-card max-w-2xl rounded-2xl border border-white/15 bg-white/[0.03] px-9 py-7 mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--tip-red)] font-semibold mb-3">Primeira ação</p>
          <p className="text-lg md:text-2xl font-semibold leading-snug" style={{ letterSpacing: "-0.02em" }}>
            Devolução da <span className="text-[var(--tip-red)]">ficha de cadastro preenchida em até 3 dias úteis</span><br/>
            <span className="text-white/70 font-normal text-base md:text-lg">A contagem do cronograma começa a partir deste momento</span>
          </p>
        </div>
        <p className="o-sub text-xl md:text-2xl text-zinc-300 font-light">A execução começa agora</p>
      </div>
    </SlideBase>
  );
}
