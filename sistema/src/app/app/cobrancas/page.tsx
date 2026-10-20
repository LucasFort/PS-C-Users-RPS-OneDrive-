import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getEscola } from "@/lib/escola";
import { garantirMes, linkPagamento, mensalidadesDoMes } from "@/lib/dados";
import { hojeISO, nomeRef, refAtual, situacao, somaMeses, type SituacaoKey } from "@/lib/datas";
import { brl } from "@/lib/format";
import { mensagemCobranca } from "@/lib/cobranca";
import { MODELO_NOME } from "@/lib/mensagens";
import { Avatar, Empty, PageHead, Pill } from "@/components/ui";
import { CopyButton, Desfazer, MarcarPaga, WhatsAppButton } from "@/components/acoes";

const FILTROS: [string, string][] = [["todas", "Todas"], ["atrasada", "Em atraso"], ["abertas", "A vencer"], ["paga", "Pagas"]];

export default async function Cobrancas({ searchParams }: { searchParams: { ref?: string; f?: string } }) {
  const { supabase, escola } = await getEscola();
  const atual = refAtual();
  const ref = /^\d{4}-\d{2}$/.test(searchParams.ref ?? "") ? searchParams.ref! : atual;
  const f = searchParams.f ?? "todas";
  if (ref <= atual) await garantirMes(supabase, escola.id, ref);
  const hoje = hojeISO();
  const todas = (await mensalidadesDoMes(supabase, escola.id, ref)).map((m) => ({ m, s: situacao(m, hoje) }));
  const ok = (k: SituacaoKey) => f === "todas" || (f === "abertas" ? k === "vence" || k === "aberta" : k === f);
  const lista = todas.filter((x) => ok(x.s.k)).sort((a, b) => (a.s.k === "paga" ? 1 : 0) - (b.s.k === "paga" ? 1 : 0) || b.s.dias - a.s.dias);
  const nAtr = todas.filter((x) => x.s.k === "atrasada").length;
  const q = (o: Record<string, string>) => "?" + new URLSearchParams({ ref, f, ...o }).toString();

  return (
    <>
      <PageHead eyebrow="Mensalidades" title="Cobranças" sub={`${todas.length} mensalidades · ${todas.filter((x) => x.s.k === "paga").length} pagas`}
        action={nAtr > 0 ? <Link href="/app/cobrancas/fila" className="btn-primary btn-sm">Cobrar atrasados ({nAtr})</Link> : undefined} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link href={q({ ref: somaMeses(ref, -1) })} className="btn-ghost btn-sm" aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></Link>
          <b className="min-w-[150px] text-center capitalize">{nomeRef(ref)}</b>
          <Link href={q({ ref: somaMeses(ref, 1) })} className="btn-ghost btn-sm" aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="flex gap-1.5 overflow-x-auto" role="group" aria-label="Filtrar">
          {FILTROS.map(([k, t]) => (
            <Link key={k} href={q({ f: k })} aria-current={f === k ? "true" : undefined}
              className={`flex-none rounded-full border px-3 py-1.5 text-[13px] font-semibold ${f === k ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted"}`}>{t}</Link>
          ))}
        </div>
      </div>
      <div className="card overflow-hidden">
        {lista.length ? lista.map(({ m, s }) => {
          const msg = mensagemCobranca(escola, m, hoje);
          return (
            <div key={m.id} className="flex flex-wrap items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0">
              <Avatar nome={m.aluno?.nome ?? "?"} />
              <Link href={`/app/alunos/${m.aluno_id}`} className="flex min-w-[140px] flex-1 flex-col">
                <b className="truncate font-semibold">{m.aluno?.nome}</b>
                <span className="truncate text-[13px] text-muted">{m.aluno?.turma?.nome ?? "Sem turma"} · vence {m.vencimento.slice(8)}/{m.vencimento.slice(5, 7)}</span>
              </Link>
              <span className="flex flex-col items-end gap-1"><b className="num text-sm">{brl(m.valor)}</b><Pill k={s.k}>{s.k === "paga" && m.forma ? `Paga · ${m.forma === "mercado_pago" ? "Pix automático" : m.forma}` : s.texto}</Pill></span>
              <span className="flex w-full flex-wrap justify-end gap-1.5 sm:w-auto">
                {s.k === "paga" ? <Desfazer id={m.id} /> : (
                  <>
                    <WhatsAppButton href={msg.href} alunoId={m.aluno_id} tipo={msg.k} descricao={`${MODELO_NOME[msg.k].split(" (")[0]} enviada`} />
                    <CopyButton texto={linkPagamento(m.token)}>Link</CopyButton>
                    <MarcarPaga id={m.id} />
                  </>
                )}
              </span>
            </div>
          );
        }) : <Empty>{todas.length ? "Nada neste filtro." : ref > atual ? "As mensalidades deste mês são criadas quando ele começar." : "Nenhuma mensalidade. Cadastre alunos para começar."}</Empty>}
      </div>
    </>
  );
}
