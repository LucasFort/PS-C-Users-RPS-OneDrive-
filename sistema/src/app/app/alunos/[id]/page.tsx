import Link from "next/link";
import { notFound } from "next/navigation";
import { getEscola } from "@/lib/escola";
import { garantirMes, linkPagamento, type Mensalidade } from "@/lib/dados";
import { MES3, hojeISO, refAtual, situacao, somaMeses } from "@/lib/datas";
import { brl, foneBonito } from "@/lib/format";
import { mensagemCobranca } from "@/lib/cobranca";
import { MODELO_NOME } from "@/lib/mensagens";
import { Note, PageHead, Pill, Tile } from "@/components/ui";
import { AcaoServidor, Confirmar, CopyButton, Desfazer, MarcarPaga, WhatsAppButton } from "@/components/acoes";
import { alternarAtivo, excluirAluno } from "../../actions";

export default async function AlunoPage({ params }: { params: { id: string } }) {
  const { supabase, escola } = await getEscola();
  const ref = refAtual(); const hoje = hojeISO();
  await garantirMes(supabase, escola.id, ref);
  const { data: a } = await supabase.from("alunos").select("*, turma:turmas(id,nome)").eq("id", params.id).eq("escola_id", escola.id).maybeSingle();
  if (!a) notFound();
  const ini = somaMeses(ref, -5);
  const [{ data: ms }, { data: chamadas }] = await Promise.all([
    supabase.from("mensalidades").select("id,aluno_id,referencia,valor,vencimento,status,pago_em,forma,token").eq("aluno_id", a.id).gte("referencia", ini).order("referencia"),
    a.turma_id ? supabase.from("chamadas").select("data,presencas").eq("turma_id", a.turma_id).gte("data", `${somaMeses(ref, -1)}-01`) : Promise.resolve({ data: [] as { data: string; presencas: Record<string, boolean> }[] }),
  ]);
  const porRef = new Map((ms ?? []).map((m) => [m.referencia, m]));
  const atual = porRef.get(ref);
  const mAtual = atual ? ({ ...atual, valor: Number(atual.valor), aluno: { id: a.id, nome: a.nome, responsavel: a.responsavel, whatsapp: a.whatsapp, nascimento: a.nascimento, turma: a.turma } } as Mensalidade) : null;
  const sAtual = mAtual ? situacao(mAtual, hoje) : null;
  const regs = (chamadas ?? []).filter((c) => a.id in (c.presencas ?? {}));
  const freq = regs.length ? Math.round((regs.filter((c) => c.presencas[a.id]).length / regs.length) * 100) : null;
  const msg = mAtual ? mensagemCobranca(escola, mAtual, hoje) : null;

  return (
    <>
      <Link href="/app/alunos" className="text-sm font-bold text-accent">‹ Alunos</Link>
      <PageHead title={a.nome} sub={`${a.turma?.nome ?? "Sem turma"}${a.responsavel ? ` · resp. ${a.responsavel}` : ""}`}
        action={<Link href={`/app/alunos/${a.id}/editar`} className="btn-ghost btn-sm">Editar</Link>} />
      {!a.ativo && <Note><b>Aluno inativo.</b> Não recebe cobranças.</Note>}
      <div className="grid grid-cols-3 gap-2.5">
        <Tile value={brl(a.valor)} label={`vence dia ${a.dia_vencimento}`} />
        <Tile value={freq == null ? "—" : `${freq}%`} label="frequência (60 dias)" tone={freq == null ? undefined : freq >= 75 ? "ok" : "warn"} />
        <Tile value={sAtual ? (sAtual.k === "paga" ? "Paga" : sAtual.k === "atrasada" ? "Atraso" : "Aberta") : "—"} label="este mês" tone={sAtual?.k === "paga" ? "ok" : sAtual?.k === "atrasada" ? "bad" : "warn"} />
      </div>
      {mAtual && sAtual && a.ativo && (
        <section className="card flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Mensalidade de {MES3[Number(ref.slice(5)) - 1]}</h2><Pill k={sAtual.k}>{sAtual.texto}</Pill></div>
          {sAtual.k === "paga" ? (
            <p className="text-sm text-muted">Paga em {new Date(mAtual.pago_em!).toLocaleDateString("pt-BR")} via {mAtual.forma === "mercado_pago" ? "Pix (automático)" : mAtual.forma}. <Desfazer id={mAtual.id} /></p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {msg && <WhatsAppButton href={msg.href} alunoId={a.id} tipo={msg.k} descricao={`${MODELO_NOME[msg.k].split(" (")[0]} enviada`} className="btn-wa">Cobrar no WhatsApp</WhatsAppButton>}
              <CopyButton texto={linkPagamento(mAtual.token)} className="btn-ghost">Copiar link de pagamento</CopyButton>
              <MarcarPaga id={mAtual.id} />
            </div>
          )}
        </section>
      )}
      <section className="flex flex-col gap-2">
        <p className="eyebrow">Últimos 6 meses</p>
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: 6 }, (_, i) => somaMeses(ref, i - 5)).map((r) => {
            const m = porRef.get(r);
            const s = m ? situacao({ status: m.status, vencimento: m.vencimento }, hoje) : null;
            const c = !m ? "bg-bg text-muted" : s?.k === "paga" ? "bg-ok-bg text-ok" : s?.k === "atrasada" ? "bg-bad-bg text-bad" : "bg-bg text-muted";
            return <div key={r} className={`flex flex-col gap-0.5 rounded-lg px-1 py-2 text-center text-xs font-bold ${c}`}><small className="text-[10px] uppercase tracking-wide">{MES3[Number(r.slice(5)) - 1]}</small>{!m ? "·" : s?.k === "paga" ? "pago" : s?.k === "atrasada" ? "deve" : m.status === "cancelada" ? "—" : "aberto"}</div>;
          })}
        </div>
      </section>
      <Note>WhatsApp: <b className="num">{foneBonito(a.whatsapp)}</b>{a.nascimento ? ` · nascimento ${a.nascimento.split("-").reverse().join("/")}` : ""} · aluno desde {a.inicio.split("-").reverse().slice(1).join("/")}</Note>
      <div className="flex flex-wrap gap-2">
        <AcaoServidor acao={alternarAtivo.bind(null, a.id, !a.ativo)}>{a.ativo ? "Inativar (parou de treinar)" : "Reativar aluno"}</AcaoServidor>
        <Confirmar acao={excluirAluno.bind(null, a.id)} confirmar="Excluir de vez">Excluir</Confirmar>
      </div>
    </>
  );
}
