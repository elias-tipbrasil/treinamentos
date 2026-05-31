import type { Slide } from "@/lib/kickoff-slides";

export default function SlideRenderer({ slide, nomeCliente }: { slide: Slide; nomeCliente: string }) {
  switch (slide.id) {
    case "bem-vindo":          return <BemVindo nomeCliente={nomeCliente} />;
    case "hero":               return <Hero nomeCliente={nomeCliente} />;
    case "nosso-time":         return <NossoTime />;
    case "importante":         return <Importante />;
    case "faq-integracao":     return <FAQIntegracao />;
    case "fluxo-mvno2":        return <FluxoMVNO />;
    case "fluxo-telefonia":    return <FluxoTelefonia />;
    case "obrigado":           return <Obrigado />;
    default:                   return <div className="w-full h-full bg-black text-white flex items-center justify-center">Slide {slide.id}</div>;
  }
}

/* Helper: wrapper de cada slide com fundo + grid sutil + fades */
function SlideBase({ children, gradient = "default" }: { children: React.ReactNode; gradient?: "default" | "red" | "deep" }) {
  const grads = {
    default: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(227,6,19,0.08), transparent 70%), linear-gradient(180deg, #000 0%, #0a0a0a 100%)",
    red:     "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(227,6,19,0.35), transparent 70%), linear-gradient(180deg, #1a0608 0%, #000 100%)",
    deep:    "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(227,6,19,0.18), transparent 70%), linear-gradient(180deg, #050505 0%, #000 100%)",
  };
  return (
    <div className="w-full h-full relative overflow-hidden text-white" style={{ background: grads[gradient] }}>
      {/* grid sutil de fundo */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}></div>
      {/* glow vermelho sutil bottom-right */}
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full" style={{
        background: "radial-gradient(circle, rgba(227,6,19,0.15) 0%, transparent 70%)",
      }}></div>
      <div className="relative w-full h-full">{children}</div>
    </div>
  );
}

/* ========== SLIDE 1: BEM-VINDO ========== */
function BemVindo({ nomeCliente }: { nomeCliente: string }) {
  return (
    <SlideBase gradient="default">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .bv-1 { animation: fadeUp 0.9s ease-out 0.1s both; }
        .bv-2 { animation: scaleIn 1s ease-out 0.6s both; }
        .bv-3 { animation: fadeUp 0.9s ease-out 1.0s both; }
        .bv-4 { animation: fadeUp 0.9s ease-out 1.4s both; }
      `}</style>
      <div className="w-full h-full flex flex-col items-center justify-center px-12 text-center">
        <p className="bv-1 text-sm md:text-base tracking-[0.4em] text-zinc-400 uppercase mb-8 font-light">Bem-vindo ao Universo</p>
        <h1 className="bv-2 font-display text-7xl md:text-[9rem] leading-[0.95] mb-12" style={{ letterSpacing: "-0.04em" }}>
          <span className="text-[var(--tip-red)]">TIP</span> BRASIL
        </h1>
        <div className="bv-3 max-w-3xl">
          <p className="text-2xl md:text-4xl text-zinc-200 leading-snug font-light">
            <span className="text-white font-medium">{nomeCliente}</span> agora faz parte
          </p>
          <p className="text-2xl md:text-4xl text-zinc-200 leading-snug font-light mt-2">
            deste universo de parceiros.
          </p>
        </div>
        <p className="bv-4 mt-20 text-sm md:text-base text-zinc-500 max-w-2xl font-light italic">
          Estamos prontos para trilhar juntos uma jornada de crescimento e transformação.
        </p>
      </div>
    </SlideBase>
  );
}

/* ========== SLIDE 2: HERO ========== */
function Hero({ nomeCliente }: { nomeCliente: string }) {
  return (
    <SlideBase gradient="deep">
      <style>{`
        @keyframes slowZoom { from { transform: scale(1.05); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes lineGrow { from { width: 0; } to { width: 80px; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .hero-line { animation: lineGrow 1.2s ease-out 0.3s both; }
        .hero-title { animation: slowZoom 1.6s ease-out 0.8s both; }
        .hero-sub { animation: slideUp 0.9s ease-out 1.8s both; }
      `}</style>
      <div className="w-full h-full flex flex-col items-center justify-center px-12">
        <div className="hero-line h-px bg-[var(--tip-red)] mb-12" style={{ width: 80 }}></div>
        <h1 className="hero-title font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] text-center max-w-6xl"
            style={{ letterSpacing: "-0.035em" }}>
          Você deu o passo<br/>
          e agora pertence ao<br/>
          <span className="text-[var(--tip-red)]">Universo TIP Brasil</span>
        </h1>
        <p className="hero-sub mt-16 text-base tracking-[0.3em] text-zinc-500 uppercase font-light">{nomeCliente}</p>
      </div>
    </SlideBase>
  );
}

/* ========== SLIDE 3: NOSSO TIME ========== */
function NossoTime() {
  return (
    <SlideBase gradient="default">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .nt-title { animation: fadeUp 0.8s ease-out 0.1s both; }
        .nt-c1 { animation: fadeUp 0.9s ease-out 0.5s both; }
        .nt-c2 { animation: fadeUp 0.9s ease-out 0.8s both; }
      `}</style>
      <div className="w-full h-full flex flex-col justify-center px-16 max-w-7xl mx-auto">
        <div className="nt-title mb-16">
          <p className="text-xs tracking-[0.4em] text-[var(--tip-red)] uppercase mb-4 font-medium">— Nosso time</p>
          <h2 className="font-display text-6xl md:text-7xl leading-tight" style={{ letterSpacing: "-0.035em" }}>
            Duas frentes,<br/>
            <span className="text-zinc-400">uma só entrega.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="nt-c1 bg-gradient-to-br from-[#161616] to-[#0a0a0a] border border-zinc-800 rounded-3xl p-10 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[var(--tip-red)]/10 border border-[var(--tip-red)] flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--tip-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium">Onboard Técnico</h3>
            </div>
            <ul className="space-y-3 text-zinc-300 text-lg">
              <li className="flex gap-3"><span className="text-[var(--tip-red)]">·</span>Envio das informações para início do projeto</li>
              <li className="flex gap-3"><span className="text-[var(--tip-red)]">·</span>Liberação de acessos de plataformas e APIs</li>
              <li className="flex gap-3"><span className="text-[var(--tip-red)]">·</span>Homologação da integração</li>
              <li className="flex gap-3"><span className="text-[var(--tip-red)]">·</span>Treinamentos da plataforma</li>
            </ul>
          </div>
          <div className="nt-c2 bg-gradient-to-br from-[#161616] to-[#0a0a0a] border border-zinc-800 rounded-3xl p-10 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[var(--tip-red)]/10 border border-[var(--tip-red)] flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--tip-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2m4 0V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium">Onboard Administrativo</h3>
            </div>
            <ul className="space-y-3 text-zinc-300 text-lg">
              <li className="flex gap-3"><span className="text-[var(--tip-red)]">·</span>Cadastro da parceira e produtos contratados</li>
              <li className="flex gap-3"><span className="text-[var(--tip-red)]">·</span>Cobrança das informações para continuidade</li>
              <li className="flex gap-3"><span className="text-[var(--tip-red)]">·</span>Iniciar produção do projeto</li>
            </ul>
          </div>
        </div>
      </div>
    </SlideBase>
  );
}

/* ========== SLIDE 4: IMPORTANTE ========== */
function Importante() {
  return (
    <SlideBase gradient="red">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        .imp-label { animation: fadeUp 0.7s ease-out 0.2s both; }
        .imp-title { animation: scaleIn 1s ease-out 0.6s both; }
        .imp-text { animation: fadeUp 0.9s ease-out 1.2s both; }
      `}</style>
      <div className="w-full h-full flex flex-col items-center justify-center px-12 text-center">
        <p className="imp-label text-xs tracking-[0.5em] text-zinc-400 uppercase mb-8 font-medium">— Importante</p>
        <h2 className="imp-title font-display text-6xl md:text-8xl leading-[0.95] mb-16 max-w-5xl"
            style={{ letterSpacing: "-0.04em" }}>
          Velocidade<br/>define a entrega.
        </h2>
        <div className="imp-text max-w-3xl space-y-6 text-xl md:text-2xl text-zinc-200 font-light leading-relaxed">
          <p>
            Para acelerar <span className="font-medium text-white">o resultado</span>, é fundamental que você <span className="font-medium text-white">responda e envie rapidamente</span> as informações solicitadas.
          </p>
          <p className="text-lg md:text-xl text-zinc-400">
            A entrega do projeto pode ser comprometida caso falte informação ou demora no envio.
          </p>
        </div>
      </div>
    </SlideBase>
  );
}

/* ========== SLIDE 5: FAQ ========== */
function FAQIntegracao() {
  const faqs = [
    { q: "A TIP Brasil faz a integração?", a: "Não. Entregamos APIs e Token para que o ERP integre — é o ERP que escreve na plataforma da TIP." },
    { q: "Após a integração, como saber?", a: "Marcamos uma reunião de homologação para testar juntos." },
    { q: "Quais ERPs estão integrados?", a: "Cerca de 70% dos ERPs do mercado de provedores. Se o seu não estiver, nossa equipe orienta a integração." },
    { q: "Tem custo para integrar?", a: "Por parte da TIP, não. Eventuais custos dependem do ERP — varia conforme o acordo." },
    { q: "Quem fica responsável pela integração?", a: "O ISP. Após receber Token e API, abre um ticket com o seu ERP para fazer a integração." },
    { q: "Quais funções a integração cobre?", a: "Grande parte da plataforma: bloqueio/desbloqueio automático, ativação do serviço, e funções específicas de cada ERP." },
  ];
  return (
    <SlideBase gradient="default">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .faq-title { animation: fadeUp 0.8s ease-out 0.1s both; }
        ${faqs.map((_, i) => `.faq-item-${i} { animation: fadeUp 0.7s ease-out ${0.4 + i * 0.1}s both; }`).join("\n")}
      `}</style>
      <div className="w-full h-full flex flex-col justify-center px-16 max-w-7xl mx-auto">
        <div className="faq-title mb-12">
          <p className="text-xs tracking-[0.4em] text-[var(--tip-red)] uppercase mb-4 font-medium">— Integração</p>
          <h2 className="font-display text-5xl md:text-6xl leading-tight" style={{ letterSpacing: "-0.035em" }}>
            Perguntas frequentes.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          {faqs.map((f, i) => (
            <div key={i} className={`faq-item-${i}`}>
              <h4 className="text-lg md:text-xl font-medium mb-2 text-white leading-snug">{f.q}</h4>
              <p className="text-zinc-400 text-base md:text-lg font-light leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  );
}

/* ========== TIMELINE CINEMATOGRÁFICA — reutilizada ========== */
function TimelineCinematica({ titulo, subtitulo, etapas, obs }: {
  titulo: string;
  subtitulo: string;
  etapas: { tag: string; titulo: string; itens: string[]; cor: "amber" | "red" | "green" }[];
  obs?: string;
}) {
  const cores = {
    amber: { dot: "#f59e0b", bg: "rgba(245,158,11,0.1)", text: "#fbbf24" },
    red:   { dot: "#e30613", bg: "rgba(227,6,19,0.12)",  text: "#ff5366" },
    green: { dot: "#22c55e", bg: "rgba(34,197,94,0.12)", text: "#4ade80" },
  };
  return (
    <SlideBase gradient="default">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes drawLine { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .tl-title { animation: fadeUp 0.8s ease-out 0.1s both; }
        .tl-line { animation: drawLine 1.5s ease-out 0.5s both; transform-origin: left; }
        ${etapas.map((_, i) => `.tl-e-${i} { animation: fadeUp 0.7s ease-out ${0.6 + i * 0.15}s both; }`).join("\n")}
        .tl-obs { animation: fadeUp 0.7s ease-out ${0.6 + etapas.length * 0.15 + 0.2}s both; }
      `}</style>
      <div className="w-full h-full flex flex-col justify-center px-16 max-w-7xl mx-auto">
        <div className="tl-title mb-16">
          <p className="text-xs tracking-[0.4em] text-[var(--tip-red)] uppercase mb-4 font-medium">— Jornada do projeto</p>
          <h2 className="font-display text-5xl md:text-7xl leading-tight" style={{ letterSpacing: "-0.035em" }}>
            {titulo}
          </h2>
          <p className="text-zinc-400 text-xl mt-3 font-light">{subtitulo}</p>
        </div>

        <div className="relative">
          {/* linha horizontal */}
          <div className="tl-line absolute top-3 left-0 right-0 h-px bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-800"></div>

          <div className="grid relative" style={{ gridTemplateColumns: `repeat(${etapas.length}, minmax(0, 1fr))`, gap: "1rem" }}>
            {etapas.map((e, i) => {
              const c = cores[e.cor];
              return (
                <div key={i} className={`tl-e-${i} relative`}>
                  {/* círculo */}
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                         style={{ background: c.bg, border: `2px solid ${c.dot}` }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: c.dot }}></div>
                    </div>
                  </div>
                  {/* tag */}
                  <div className="mt-4 text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: c.text }}>
                    {e.tag}
                  </div>
                  {/* título */}
                  <div className="font-display text-xl mt-2 leading-tight" style={{ letterSpacing: "-0.02em" }}>
                    {e.titulo}
                  </div>
                  {/* itens */}
                  <ul className="mt-3 space-y-1.5 text-xs text-zinc-400 font-light leading-snug">
                    {e.itens.map((it, j) => <li key={j}>{it}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {obs && (
          <div className="tl-obs mt-12 p-6 bg-gradient-to-r from-[var(--tip-red)]/10 to-transparent border-l-2 border-[var(--tip-red)] rounded-r-xl max-w-3xl">
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--tip-red)] mb-2 font-medium">Importante</p>
            <p className="text-base text-zinc-300 font-light leading-relaxed">{obs}</p>
          </div>
        )}
      </div>
    </SlideBase>
  );
}

function FluxoMVNO() {
  return <TimelineCinematica
    titulo="Projeto Chip MVNO"
    subtitulo="Do cadastro inicial ao go-live."
    etapas={[
      { tag: "Até 3 dias",  titulo: "Cadastro",    cor: "amber", itens: ["Cadastro do parceiro", "Cadastro dos produtos", "Reunião de início"] },
      { tag: "Aguarda ISP", titulo: "Arte",        cor: "red",   itens: ["Criação conforme gabarito", "Preenchimento de planilha", "Envio para a TIP"] },
      { tag: "+ 10 dias",   titulo: "Produção",    cor: "amber", itens: ["Aprovação da arte", "Liberação de plataformas e APIs"] },
      { tag: "Aguarda ISP", titulo: "Integração",  cor: "red",   itens: ["Ticket com o ERP", "Envio do OK para a TIP"] },
      { tag: "+ 10 dias",   titulo: "Homologação", cor: "amber", itens: ["Reunião de homologação", "Treinamentos das plataformas"] },
      { tag: "+ 40 dias",   titulo: "Entrega",     cor: "amber", itens: ["Produção dos chips", "Gravação do perfil eletrônico"] },
      { tag: "Go Live",     titulo: "Operação",    cor: "green", itens: ["Operação assistida", "Passagem para Growth"] },
    ]}
    obs="O prazo começa a contar a partir da aprovação da arte. No MVNO, o go-live pode acontecer com Chip e/ou eSIM."
  />;
}

function FluxoTelefonia() {
  return <TimelineCinematica
    titulo="Telefonia Fixa"
    subtitulo="Implantação de ponta a ponta."
    etapas={[
      { tag: "Até 3 dias",  titulo: "Cadastro",     cor: "amber", itens: ["Cadastro do parceiro", "Cadastro dos produtos", "Reunião de início"] },
      { tag: "Aguarda ISP", titulo: "Documentação", cor: "red",   itens: ["Envio dos documentos", "Preenchimento de planilha"] },
      { tag: "+ 10 dias",   titulo: "Liberação",    cor: "amber", itens: ["Plataformas de telefonia e ticket", "Liberação de APIs"] },
      { tag: "Aguarda ISP", titulo: "Integração",   cor: "red",   itens: ["Ticket com o ERP", "Envio do OK para a TIP"] },
      { tag: "+ 10 dias",   titulo: "Homologação",  cor: "amber", itens: ["Reunião de homologação", "Treinamentos das plataformas"] },
      { tag: "Go Live",     titulo: "Operação",     cor: "green", itens: ["Operação assistida", "Passagem para Growth"] },
    ]}
  />;
}

/* ========== SLIDE FINAL ========== */
function Obrigado() {
  return (
    <SlideBase gradient="red">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
        .ob-label { animation: fadeUp 0.7s ease-out 0.2s both; }
        .ob-title { animation: scaleIn 1.2s ease-out 0.6s both; }
        .ob-sub { animation: fadeUp 0.9s ease-out 1.4s both; }
      `}</style>
      <div className="w-full h-full flex flex-col items-center justify-center px-12 text-center">
        <p className="ob-label text-xs tracking-[0.5em] text-zinc-300 uppercase mb-10 font-medium">Muito obrigado</p>
        <h1 className="ob-title font-display text-7xl md:text-[8rem] leading-[0.92] mb-12 max-w-6xl"
            style={{ letterSpacing: "-0.045em" }}>
          A estratégia<br/>
          <span className="text-zinc-300">está pronta.</span>
        </h1>
        <p className="ob-sub text-2xl md:text-4xl text-white font-light max-w-3xl">
          Agora é colher <span className="font-medium">resultado.</span>
        </p>
      </div>
    </SlideBase>
  );
}
