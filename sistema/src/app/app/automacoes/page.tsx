import { getEscola } from "@/lib/escola";
import { alunosDa, garantirMes, mensalidadesDoMes } from "@/lib/dados";
import { DIAS, dataBR, diaSemana, hojeISO, refAtual } from "@/lib/datas";
import { reguaDoDia, proximosDias } from "@/lib/cobranca";
import { MODELO_NOME, type ModeloKey } from "@/lib/mensagens";
import { Note, PageHead, Section } from "@/components/ui";
import { AcaoServidor, WhatsAppButton } from "@/components/acoes";
import { alternarAuto } from "../actions";

const REGRAS: [ModeloKey, string, string, string][] = [
  ["lembrete", "−3", "dias antes", "Lembra o valor e a data, com o link do Pix."],
  ["cobranca", "0", "no dia", "Manda o Pix no dia que vence."],
  ["atraso", "+3", "dias depois", "Só para quem ainda não pagou."],
  ["ultimo", "+7", "dias depois", "Mensagem firme e educada."],
  ["aniversario", "🎂", "no dia", "Parabéns para o aluno."],
  ["falta", "✕", "na chamada", "Aparece para avisar quem faltou."],
];

export default async function Automacoes() {
  const { supabase, escola } = await getEscola();
  const ref = refAtual(); const hoje = hojeISO();
  await garantirMes(supabase, escola.id, ref);
  const [mens, alunos, { data: env }] = await Promise.all([mensalidadesDoMes(supabase, escola.id, ref), alunosDa(supabase, escola.id),
    supabase.from("envios").select("aluno_id,tipo").eq("escola_id", escola.id).gte("created_at", hoje + "T03:00:00Z")]);
  const jaFoi = new Set((env ?? []).map((e) => `${e.aluno_id}:${e.tipo}`));
  const hojeItens = reguaDoDia(escola, mens, alunos, hoje);
  const prox = proximosDias(8, hoje).slice(1).map((d) => ({ d, itens: reguaDoDia(escola, mens.filter((m) => m.status === "aberta"), alunos, d) })).filter((x) => x.itens.length);
  return (
    <>
      <PageHead eyebrow="Mais" title="Régua de cobrança" sub="O sistema separa quem precisa receber mensagem em cada dia. Você só toca em enviar." />
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <Section title={`Hoje (${hojeItens.length})`}>
          <div className="card overflow-hidden">
            {hojeItens.length ? hojeItens.map((i) => {
              const foi = jaFoi.has(`${i.aluno.id}:${i.k}`);
              return (
                <div key={i.aluno.id + i.k} className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0">
                  <span className="flex min-w-0 flex-1 flex-col"><b className="truncate font-semibold">{i.aluno.nome}</b><span className="text-[13px] text-muted">{MODELO_NOME[i.k].split(" (")[0]}{foi ? " · enviado ✓" : ""}</span></span>
                  <WhatsAppButton href={i.href} alunoId={i.aluno.id} tipo={i.k} descricao={`${MODELO_NOME[i.k].split(" (")[0]} enviada`} className={foi ? "btn-ghost btn-sm" : "btn-wa btn-sm"}>{foi ? "Reenviar" : "Enviar"}</WhatsAppButton>
                </div>
              );
            }) : <p className="px-4 py-6 text-center text-muted">Nada para hoje. ✅</p>}
          </div>
          {prox.length > 0 && (
            <div className="card flex flex-col divide-y divide-line">
              <p className="eyebrow px-3.5 pt-3">Próximos dias</p>
              {prox.map(({ d, itens }) => (
                <div key={d} className="flex flex-col gap-1.5 px-3.5 py-2.5">
                  <div className="flex justify-between text-sm font-bold"><span>{DIAS[diaSemana(d)]}, {dataBR(d)}</span><span className="num font-semibold text-muted">{itens.length} mensage{itens.length > 1 ? "ns" : "m"}</span></div>
                  <div className="flex flex-wrap gap-1.5">{itens.slice(0, 6).map((i) => <span key={i.aluno.id + i.k} className="rounded-md bg-bg px-2 py-0.5 text-xs text-muted"><b className="text-ink">{MODELO_NOME[i.k].split(" (")[0]}:</b> {i.aluno.nome.split(" ")[0]}</span>)}{itens.length > 6 && <span className="text-xs text-muted">+{itens.length - 6}</span>}</div>
                </div>
              ))}
            </div>
          )}
        </Section>
        <Section title="Regras ligadas">
          <div className="card overflow-hidden">
            {REGRAS.map(([k, w, ws, d]) => {
              const on = !!escola.auto?.[k];
              return (
                <div key={k} className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0">
                  <span className="w-14 flex-none rounded-lg bg-bg px-1 py-1.5 text-center font-display text-[15px] font-extrabold [font-stretch:80%]">{w}<small className="block font-sans text-[10px] font-bold uppercase tracking-wide text-muted">{ws}</small></span>
                  <span className="flex min-w-0 flex-1 flex-col"><b className="font-semibold">{MODELO_NOME[k].split(" (")[0]}</b><span className="text-[13px] text-muted">{d}</span></span>
                  <AcaoServidor acao={alternarAuto.bind(null, k)} className={`relative h-7 w-12 flex-none rounded-full transition ${on ? "bg-accent" : "bg-line"}`}>
                    <span className="sr-only">{on ? "Desligar" : "Ligar"} {MODELO_NOME[k]}</span>
                    <i className={`absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-surface shadow transition ${on ? "translate-x-5" : ""}`} aria-hidden />
                  </AcaoServidor>
                </div>
              );
            })}
          </div>
          <Note><b>Envio com 1 toque:</b> cada mensagem abre no seu WhatsApp já escrita, com o link do Pix. O envio totalmente automático (sem tocar) chega numa próxima versão.</Note>
        </Section>
      </div>
    </>
  );
}
