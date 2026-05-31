import type { Slide } from "@/lib/kickoff-slides";

export default function SlideRenderer({ slide, nomeCliente }: { slide: Slide; nomeCliente: string }) {
  const containerClass = "w-full h-full flex flex-col items-center justify-center text-center bg-black text-white relative overflow-hidden";

  switch (slide.id) {
    case "bem-vindo":
      return (
        <div className={containerClass + " px-12"}>
          <h1 className="font-display text-5xl md:text-7xl leading-tight mb-8">Bem-vindo ao Universo TIP Brasil!</h1>
          <div className="w-24 h-1 bg-[var(--tip-red)] mb-8"></div>
          <p className="text-2xl md:text-4xl">
            A <span className="text-[var(--tip-red)] font-bold">{nomeCliente}</span> agora faz parte
          </p>
          <p className="text-2xl md:text-4xl mt-2">deste universo de parceiros.</p>
          <p className="mt-12 text-lg text-[var(--text-muted)] italic">
            Estamos prontos para trilhar juntos uma jornada de crescimento e transformação.
          </p>
        </div>
      );

    case "hero":
      return (
        <div className={containerClass + " px-12"}>
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0608] to-black"></div>
          <div className="relative z-10">
            <div className="font-display text-5xl mb-8">
              <span className="text-white">TIP</span>{" "}
              <span className="text-white">BRASIL</span>
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-tight max-w-5xl">
              Você deu o passo e agora pertence ao Universo TIP Brasil
            </h2>
            <p className="mt-8 text-xl text-[var(--text-muted)]">{nomeCliente}</p>
          </div>
        </div>
      );

    case "nosso-time":
      return (
        <div className={containerClass + " px-12 justify-start pt-16"}>
          <div className="max-w-5xl w-full">
            <h2 className="font-display text-5xl md:text-6xl mb-12 text-left">Nosso Time</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 text-left">
                <h3 className="font-display text-2xl mb-4 text-[var(--tip-red)]">Onboard Técnico</h3>
                <p className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] mb-3">Responsabilidades</p>
                <ul className="space-y-2 text-base">
                  <li>• Envio das Informações para Início do Projeto</li>
                  <li>• Liberação de acessos de Plataformas e APIs</li>
                  <li>• Homologação da Integração</li>
                  <li>• Treinamentos da Plataforma</li>
                </ul>
              </div>
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 text-left">
                <h3 className="font-display text-2xl mb-4 text-[var(--tip-red)]">Onboard Administrativo</h3>
                <p className="font-condensed text-xs tracking-[2px] uppercase text-[var(--text-muted)] mb-3">Responsabilidades</p>
                <ul className="space-y-2 text-base">
                  <li>• Cadastro da Parceira e Produtos contratados</li>
                  <li>• Cobrança das Informações para continuidade do projeto</li>
                  <li>• Iniciar Produção do Projeto</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );

    case "importante":
      return (
        <div className={containerClass + " px-12"}>
          <div className="max-w-4xl">
            <div className="inline-block bg-black border-2 border-[var(--tip-red)] px-8 py-2 mb-8 rounded-lg">
              <span className="font-display text-3xl text-white">IMPORTANTE</span>
            </div>
            <div className="bg-[var(--tip-red)] rounded-3xl p-10 text-left text-white">
              <p className="text-xl md:text-2xl leading-relaxed mb-6">
                Para acelerarmos o <strong>RESULTADO</strong> e <strong>ENTREGA</strong> é muito importante que <strong>RESPONDA</strong> e <strong>ENVIE</strong> rapidamente as informações solicitadas.
              </p>
              <p className="text-xl md:text-2xl leading-relaxed">
                A <strong>ENTREGA</strong> do <strong>PROJETO</strong> pode ser <strong>COMPROMETIDA</strong> caso falte informações ou demora no envio.
              </p>
            </div>
          </div>
        </div>
      );

    case "faq-integracao":
      return (
        <div className={containerClass + " px-12 justify-start pt-16 bg-[var(--tip-red)]"}>
          <div className="max-w-6xl w-full">
            <h2 className="font-display text-5xl md:text-6xl mb-10 text-left text-black">FAQ INTEGRAÇÃO</h2>
            <div className="bg-white text-black rounded-3xl p-10">
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 text-left">
                <FAQ q="A TIP Brasil quem faz a Integração?" a="Não, a TIP Brasil entrega as APIs e Token para que o ERP integre, pois é o ERP que escreve na plataforma da TIP Brasil." />
                <FAQ q="Após Integração como sei que está funcionando?" a="Vamos marcar uma reunião de homologação para testar juntos." />
                <FAQ q="Quais ERPs estão integrados?" a="70% dos ERPs do mercado de Provedores de Internet, porém caso o seu não esteja, é muito simples a integração e o nosso time está à disposição." />
                <FAQ q="Quais funções existe na Integração feita entre ERP e TIP?" a="Hoje nossas APIs possuem funções diversas de toda a plataforma. A grande maioria dos ERPs já possuem a parte financeira de bloqueio e desbloqueio automático, ou seja, aquele cliente inadimplente será bloqueado automaticamente. Também a ativação do serviço vendido, mas cada ERP integra de acordo com sua particularidade. Ideal é verificar com o seu ERP quais funções estão integradas." />
                <FAQ q="Quem fica responsável pela Integração?" a="O ISP, após liberação do Token e API por parte da TIP, o ISP precisa abrir um ticket com seu ERP para que ele possa fazer a integração." />
                <FAQ q="Tem custo a Integração?" a="Por parte da TIP não tem nenhum custo e sabemos que muitos ERPs do mercado não cobram nada, porém vai do ERP e do acordo que possui." />
              </div>
            </div>
          </div>
        </div>
      );

    case "fluxo-mvno2":
      return (
        <div className={containerClass + " px-12 justify-start pt-12"}>
          <div className="max-w-6xl w-full">
            <h2 className="font-display text-4xl mb-2">Projeto CHIP MVNO</h2>
            <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8">Fluxo de implantação</p>
            <FluxoChip />
            <div className="mt-6 bg-[var(--bg-surface)] border-l-4 border-[var(--tip-red)] p-4 rounded-r-lg text-left">
              <p className="text-sm">
                <strong className="text-[var(--tip-red)]">Importante:</strong> No MVNO o <strong>Go Live</strong> pode acontecer com a entrega do Chip e/ou eSIM. O projeto começa a contar o prazo a partir da <strong>Aprovação da Arte</strong>.
              </p>
            </div>
          </div>
        </div>
      );

    case "fluxo-telefonia":
      return (
        <div className={containerClass + " px-12 justify-start pt-12"}>
          <div className="max-w-6xl w-full">
            <h2 className="font-display text-4xl mb-2">Projeto Telefonia Fixa</h2>
            <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--text-muted)] mb-8">Fluxo de implantação</p>
            <FluxoTelefonia />
          </div>
        </div>
      );

    case "obrigado":
      return (
        <div className={containerClass + " px-12"}>
          <div className="max-w-4xl">
            <div className="font-display text-4xl mb-12">
              <span className="text-white">TIP</span>{" "}
              <span className="text-white">BRASIL</span>
            </div>
            <div className="inline-block bg-black border-2 border-[var(--tip-red)] px-8 py-2 mb-8 rounded-lg">
              <span className="font-display text-3xl text-white">MUITO OBRIGADO</span>
            </div>
            <div className="bg-[var(--tip-red)] rounded-3xl p-12 text-white">
              <p className="font-display text-4xl md:text-5xl leading-tight">A estratégia está pronta.</p>
              <p className="font-display text-4xl md:text-5xl leading-tight mt-3">AGORA é colher RESULTADO</p>
            </div>
          </div>
        </div>
      );

    default:
      return <div className={containerClass}>Slide não encontrado: {slide.id}</div>;
  }
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <h4 className="font-bold text-base mb-2">{q}</h4>
      <p className="text-sm text-zinc-700 leading-relaxed">{a}</p>
    </div>
  );
}

function FluxoChip() {
  const etapas = [
    { dias: "Até 3 dias", cor: "bg-amber-500", titulo: "Cadastro inicial", itens: ["Cadastro do Parceiro", "Cadastro dos Produtos", "Reunião de Início", "Envio das Informações Iniciais ao ISP"] },
    { dias: "Aguard. ISP", cor: "bg-red-600", titulo: "Criação da Arte", itens: ["Criação da Arte conforme Gabarito e Nome Perfil", "Preenchimento da Planilha", "Envio para a TIP Brasil"] },
    { dias: "+ 10 dias", cor: "bg-amber-500", titulo: "Produção", itens: ["Arte Aprovada: Início da Produção", "Liberação das Plataformas (MVNO, Ticket e Cursos) e APIs"] },
    { dias: "Aguard. ISP", cor: "bg-red-600", titulo: "Integração", itens: ["Abertura de Ticket com o ERP para Integração", "Envio OK para TIP, integração pronta"] },
    { dias: "+ 10 dias", cor: "bg-amber-500", titulo: "Homologação", itens: ["Reunião de Homologação da Integração", "Treinamento Plataforma MVNO", "Treinamento Plataforma de Ticket", "Envio da Avaliação"] },
    { dias: "+ 40 dias", cor: "bg-amber-500", titulo: "Entrega", itens: ["Produção Chips Finalizada", "Gravação do Perfil Eletrônico", "Entrega ao Parceiro"] },
    { dias: "Go Live", cor: "bg-green-600", titulo: "Operação", itens: ["Início Operação Assistida", "Passagem para o Growth"] },
  ];
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-left text-sm">
      {etapas.map((e, i) => (
        <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4">
          <div className={`inline-block ${e.cor} text-white text-xs font-bold px-2 py-1 rounded mb-2`}>{e.dias}</div>
          <div className="font-display text-base mb-2">{e.titulo}</div>
          <ul className="space-y-1 text-xs text-[var(--text-muted)]">
            {e.itens.map((it, j) => <li key={j}>• {it}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FluxoTelefonia() {
  const etapas = [
    { dias: "Até 3 dias", cor: "bg-amber-500", titulo: "Cadastro inicial", itens: ["Cadastro do Parceiro", "Cadastro dos Produtos", "Reunião de Início", "Envio das Informações Iniciais ao ISP"] },
    { dias: "Aguard. ISP", cor: "bg-red-600", titulo: "Documentação", itens: ["Envio da documentação solicitada", "Preenchimento da Planilha", "Envio para a TIP Brasil"] },
    { dias: "+ 10 dias", cor: "bg-amber-500", titulo: "Liberação", itens: ["Liberação das Plataformas (Telefonia, Ticket e Cursos)", "Liberação das APIs"] },
    { dias: "Aguard. ISP", cor: "bg-red-600", titulo: "Integração ERP", itens: ["Abertura de Ticket com o ERP", "Envio OK para TIP, integração pronta"] },
    { dias: "+ 10 dias", cor: "bg-amber-500", titulo: "Homologação", itens: ["Reunião de Homologação", "Treinamento Plataforma Telefonia", "Treinamento Plataforma de Ticket", "Envio da Avaliação"] },
    { dias: "Go Live", cor: "bg-green-600", titulo: "Operação", itens: ["Início Operação Assistida", "Passagem para o Growth"] },
  ];
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-left text-sm">
      {etapas.map((e, i) => (
        <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4">
          <div className={`inline-block ${e.cor} text-white text-xs font-bold px-2 py-1 rounded mb-2`}>{e.dias}</div>
          <div className="font-display text-base mb-2">{e.titulo}</div>
          <ul className="space-y-1 text-xs text-[var(--text-muted)]">
            {e.itens.map((it, j) => <li key={j}>• {it}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
