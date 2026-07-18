import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import { LABELS, GABARITO_CHIP, GABARITO_SIM } from "@/lib/pos-kickoff";

export const dynamic = "force-dynamic";

export default async function PosKickoff({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data: k } = await supabase
    .from("kickoffs")
    .select("id, nome_cliente, produtos, command_url, token_publico, fichas(produto)")
    .eq("token_publico", token)
    .single();
  if (!k) notFound();

  const produtos: string[] = k.produtos || [];
  const feitas = new Set<string>(((k as any).fichas || []).map((f: any) => f.produto));

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "auto", zIndex: 50, background: "#000" }}>
      <style>{CSS}</style>

      <div className="pk-top">
        <div className="pk-brand"><b>TIP</b> BRASIL</div>
        <div className="pk-cli">{k.nome_cliente}</div>
      </div>

      <div className="pk-split">
        <section className="pk-pane pk-left">
          <p className="pk-eyebrow">Pós Kickoff</p>
          <h1 className="pk-strong">Agora é<br /><span className="r">com vocês</span></h1>
          <p className="pk-lead">O que precisamos de você pra seguir com cada produto</p>

          {produtos.map((pid) => {
            const feita = feitas.has(pid);
            return (
              <div className="pk-group" key={pid}>
                <div className="pk-head"><span className="pk-dot" />{LABELS[pid] || pid}</div>
                <div className="pk-cards">
                  <div className="pk-card">
                    <div className="pk-step-row">
                      <span className="pk-step">Ficha</span>
                      {feita && <span className="pk-badge">Concluído ✓</span>}
                    </div>
                    <h3>{feita ? "Ficha preenchida" : "Preencha a ficha"}</h3>
                    <p>{feita ? "Dados recebidos. Você pode revisar ou alterar quando precisar" : "Dados da empresa e do projeto pra abrirmos o cadastro e iniciar a produção"}</p>
                    <a className={`pk-btn ${feita ? "" : "red"}`} href={`/p/${token}/ficha/${pid}`}>
                      {feita ? "Ver / alterar ficha →" : "Preencher ficha →"}
                    </a>
                  </div>

                  {GABARITO_CHIP.has(pid) && (
                    <div className="pk-card">
                      <div className="pk-step">Gabarito do chip</div>
                      <h3>{GABARITO_SIM.titulo}</h3>
                      <p>{GABARITO_SIM.desc}</p>
                      <ul className="pk-reject">
                        {GABARITO_SIM.rejeitar.map((r, i) => <li key={i}>✕ {r}</li>)}
                      </ul>
                      <a className="pk-btn" href={GABARITO_SIM.link} target="_blank">Baixar gabarito e instruções ↓</a>
                      <div className="pk-designer">{GABARITO_SIM.designer}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <section className="pk-pane pk-right">
          <div className="pk-rt-head">
            <div>
              <p className="pk-eyebrow" style={{ marginBottom: 6 }}>Acompanhamento</p>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em" }}>Em tempo real</div>
            </div>
            {k.command_url && <a className="pk-btn ghost" href={k.command_url} target="_blank">Abrir em nova aba ↗</a>}
          </div>
          {k.command_url
            ? <iframe className="pk-frame" src={k.command_url} title="Acompanhamento do projeto" />
            : <div className="pk-empty">Acompanhamento ainda não configurado</div>}
        </section>
      </div>
    </div>
  );
}

const CSS = `
  .pk-top{display:flex;align-items:center;justify-content:space-between;padding:22px 5vw;border-bottom:.5px solid rgba(255,255,255,.08);color:#fff;font-family:-apple-system,"SF Pro Display","Inter",system-ui,sans-serif}
  .pk-brand{font-weight:700;letter-spacing:-.02em;font-size:15px}.pk-brand b{color:#FF1A2E}
  .pk-cli{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.5)}
  .pk-split{display:grid;grid-template-columns:1fr 1fr;min-height:calc(100vh - 67px);font-family:-apple-system,"SF Pro Display","Inter",system-ui,sans-serif;color:#fff}
  .pk-pane{padding:64px 5vw}
  .pk-left{border-right:.5px solid rgba(255,255,255,.08)}
  .pk-right{background:#070707;padding:0;display:flex;flex-direction:column}
  .pk-eyebrow{font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:#FF1A2E;font-weight:600;margin-bottom:20px}
  .pk-strong{font-size:clamp(38px,5vw,72px);line-height:.92;font-weight:800;letter-spacing:-.045em}
  .pk-strong .r{color:#FF1A2E}
  .pk-lead{margin-top:22px;font-size:clamp(16px,1.5vw,19px);color:rgba(255,255,255,.5);max-width:34ch}
  .pk-group{margin-top:44px}
  .pk-group + .pk-group{margin-top:36px;padding-top:36px;border-top:.5px solid rgba(255,255,255,.08)}
  .pk-head{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
  .pk-dot{width:8px;height:8px;border-radius:50%;background:#FF1A2E}
  .pk-cards{margin-top:20px;display:flex;flex-direction:column;gap:16px}
  .pk-card{background:#0e0e0e;border:.5px solid rgba(255,255,255,.08);border-radius:22px;padding:28px}
  .pk-step-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
  .pk-step{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.38)}
  .pk-badge{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#22c55e;background:rgba(34,197,94,.12);border:.5px solid rgba(34,197,94,.4);padding:4px 10px;border-radius:100px}
  .pk-card h3{font-size:clamp(20px,2vw,26px);font-weight:600;letter-spacing:-.03em;line-height:1.05}
  .pk-card p{margin-top:10px;font-size:15px;color:rgba(255,255,255,.5);line-height:1.5}
  .pk-reject{margin-top:16px;display:flex;flex-direction:column;gap:7px}
  .pk-reject li{list-style:none;font-size:13px;color:rgba(255,255,255,.38);line-height:1.35}
  .pk-btn{margin-top:22px;display:inline-flex;align-items:center;gap:8px;background:#fff;color:#000;font-weight:600;font-size:15px;padding:13px 24px;border-radius:100px;text-decoration:none}
  .pk-btn.red{background:#E60012;color:#fff}
  .pk-btn.ghost{background:transparent;color:#fff;border:.5px solid rgba(255,255,255,.25);margin-top:0;padding:10px 18px;font-size:13px}
  .pk-designer{margin-top:16px;padding-top:16px;border-top:.5px solid rgba(255,255,255,.08);font-size:13px;color:rgba(255,255,255,.38)}
  .pk-rt-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:24px 5vw;border-bottom:.5px solid rgba(255,255,255,.08)}
  .pk-frame{flex:1;width:100%;border:0;background:#fff;min-height:480px}
  .pk-empty{flex:1;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.38);font-size:14px}
  @media(max-width:900px){.pk-split{grid-template-columns:1fr}.pk-left{border-right:0;border-bottom:.5px solid rgba(255,255,255,.08)}.pk-pane{padding:48px 7vw}.pk-right{padding:0}}
`;
