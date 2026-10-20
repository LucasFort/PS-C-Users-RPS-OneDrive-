import Link from "next/link";
import { ArrowRight, CircleCheck, Circle } from "lucide-react";
import { getEscola } from "@/lib/escola";
import { alunosDa, garantirMes, mensalidadesDoMes, turmasDa } from "@/lib/dados";
import { DIAS, MESES, diaSemana, hojeISO, refAtual, situacao } from "@/lib/datas";
import { brl, brl0, primeiroNome } from "@/lib/format";
import { mensagemCobranca, reguaDoDia } from "@/lib/cobranca";
import { MODELO_NOME } from "@/lib/mensagens";
import { Avatar, Empty, PageHead, Pill, Section, TextLink, Tile } from "@/components/ui";
import { WhatsAppButton } from "@/components/acoes";

export default async function Inicio() {
  const { supabase, escola } = await getEscola();
  const ref = refAtual(); const hoje = hojeISO();
  await garantirMes(supabase, escola.id, ref);
  const [mens, turmas, alunos] = await Promise.all([mensalidadesDoMes(supabase, escola.id, ref), turmasDa(supabase, escola.id), alunosDa(supabase, escola.id)]);
  const { data: enviadosHoje } = await supabase.from("envios").select("aluno_id,tipo").eq("escola_id", escola.id).gte("created_at", hoje + "T03:00:00Z");
  const jaFoi = new Set((enviadosHoje ?? []).map((e) => `${e.aluno_id}:${e.tipo}`));

  const com = mens.map((m) => ({ m, s: situacao(m, hoje) }));
  const rec = com.filter((x) => x.s.k === "paga").reduce((t, x) => t + x.m.valor, 0);
  const total = com.reduce((t, x) => t + x.m.valor, 0);
  const atrasadas = com.filter((x) => x.s.k === "atrasada").sort((a, b) => b.s.dias - a.s.dias);
  const aVencer = com.filter((x) => x.s.k === "vence" || x.s.k === "aberta");
  const pct = total ? Math.round((rec / total) * 100) : 0;
  const regua = reguaDoDia(escola, mens, alunos, hoje).filter((i) => !jaFoi.has(`${i.aluno.id}:${i.k}`));
  const aulasHoje = turmas.filter((t) => t.dias.includes(diaSemana(hoje))).sort((a, b) => a.hora.localeCompare(b.hora));

  const passos = [
    { ok: !!escola.chave_pix, txt: "Cadastre sua chave Pix", href: "/app/ajustes" },
    { ok: turmas.length > 0, txt: "Crie suas turmas", href: "/app/turmas/nova" },
    { ok: alunos.length > 0, txt: "Cadastre ou importe seus alunos", href: "/app/alunos/importar" },
  ];
  const comecando = passos.some((p) => !p.ok);

  return (
    <>
      <PageHead eyebrow={`${DIAS[diaSemana(hoje)]}, ${hoje.slice(8)}/${hoje.slice(5, 7)}`} title={comecando ? "Vamos deixar tudo pronto" : "Veja como está o mês"} />
      {comecando && (
        <section className="card flex flex-col gap-2 p-4">
          <h2 className="text-lg font-extrabold">Primeiros passos</h2>
          {passos.map((p) => (
            <Link key={p.txt} href={p.href} className="flex items-center gap-3 rounded-lg px-1 py-2 hover:bg-bg">
              {p.ok ? <CircleCheck className="h-5 w-5 text-ok" aria-hidden /> : <Circle className="h-5 w-5 text-muted" aria-hidden />}
              <span className={p.ok ? "text-muted line-through" : "font-semibold"}>{p.txt}</span>
              {!p.ok && <ArrowRight className="ml-auto h-4 w-4 text-muted" aria-hidden />}
            </Link>
          ))}
        </section>
      )}
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="flex flex-col gap-3.5 rounded-xl bg-accent p-5 text-accent-ink" aria-label="Recebido no mês">
            <span className="text-[11px] font-bold uppercase tracking-[0.09em] opacity-80">Recebido em {MESES[Number(ref.slice(5)) - 1]}</span>
            <div><div className="num font-display text-[44px] font-black leading-none [font-stretch:75%]">{brl(rec)}</div><div className="num font-semibold opacity-85">de {brl(total)} previstos · {pct}%</div></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/25"><i className="block h-full rounded-full bg-current" style={{ width: `${pct}%` }} /></div>
          </section>
          <div className="grid grid-cols-3 gap-2.5">
            <Tile tone="ok" value={`${com.filter((x) => x.s.k === "paga").length}/${com.length}`} label="pagaram" />
            <Tile tone="bad" value={brl0(atrasadas.reduce((t, x) => t + x.m.valor, 0))} label={`${atrasadas.length} em atraso`} />
            <Tile tone="warn" value={brl0(aVencer.reduce((t, x) => t + x.m.valor, 0))} label={`${aVencer.length} a vencer`} />
          </div>
          <Section title="Em atraso" action={atrasadas.length > 0 && <TextLink href="/app/cobrancas?f=atrasada">Ver todas</TextLink>}>
            <div className="card overflow-hidden">
              {atrasadas.length ? atrasadas.slice(0, 8).map(({ m, s }) => {
                const msg = mensagemCobranca(escola, m, hoje);
                return (
                  <div key={m.id} className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0">
                    <Avatar nome={m.aluno?.nome ?? "?"} />
                    <Link href={`/app/alunos/${m.aluno_id}`} className="flex min-w-0 flex-1 flex-col"><b className="truncate font-semibold">{m.aluno?.nome}</b><span className="truncate text-[13px] text-muted">{brl(m.valor)} · <span className="text-bad">{s.texto}</span></span></Link>
                    <WhatsAppButton href={msg.href} alunoId={m.aluno_id} tipo={msg.k} descricao={`${MODELO_NOME[msg.k].split(" (")[0]} enviada`}>Cobrar</WhatsAppButton>
                  </div>
                );
              }) : <Empty>{mens.length ? "Ninguém atrasado este mês. 🎉" : "As mensalidades aparecem aqui quando você cadastrar alunos."}</Empty>}
            </div>
            {atrasadas.length > 1 && <Link href="/app/cobrancas/fila" className="btn-primary">Cobrar todos os atrasados ({atrasadas.length})</Link>}
          </Section>
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <section className="card flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-3"><h2 className="text-[19px] font-extrabold">Para enviar hoje</h2><TextLink href="/app/automacoes">Régua</TextLink></div>
            {regua.length ? (
              <>
                <p className="text-sm text-muted">A régua separou <b className="text-ink">{regua.length} mensage{regua.length > 1 ? "ns" : "m"}</b>. Toque para enviar cada uma:</p>
                <div className="flex flex-col divide-y divide-line">
                  {regua.slice(0, 6).map((i) => (
                    <div key={i.aluno.id + i.k} className="flex items-center gap-3 py-2">
                      <span className="flex min-w-0 flex-1 flex-col"><b className="truncate text-sm font-semibold">{i.aluno.nome}</b><span className="text-xs text-muted">{MODELO_NOME[i.k].split(" (")[0]}</span></span>
                      <WhatsAppButton href={i.href} alunoId={i.aluno.id} tipo={i.k} descricao={`${MODELO_NOME[i.k].split(" (")[0]} enviada`}>Enviar</WhatsAppButton>
                    </div>
                  ))}
                </div>
                {regua.length > 6 && <TextLink href="/app/automacoes">Ver as {regua.length}</TextLink>}
              </>
            ) : <p className="text-sm text-muted">Nada pendente para hoje. ✅</p>}
          </section>
          <Section title="Aulas de hoje" action={<TextLink href="/app/turmas">Agenda</TextLink>}>
            <div className="card overflow-hidden">
              {aulasHoje.length ? aulasHoje.map((t) => (
                <Link key={t.id} href={`/app/turmas/${t.id}/chamada`} className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0 hover:bg-bg">
                  <span className="num grid h-9 w-9 place-items-center rounded-lg bg-accent-soft font-display text-sm font-extrabold text-accent">{t.hora.slice(0, 2)}h</span>
                  <span className="flex min-w-0 flex-1 flex-col"><b className="truncate font-semibold">{t.nome}</b><span className="truncate text-[13px] text-muted">{t.hora}{t.professor ? ` · ${t.professor}` : ""} · {alunos.filter((a) => a.ativo && a.turma_id === t.id).length} alunos</span></span>
                  <span className="btn-ghost btn-sm">Chamada</span>
                </Link>
              )) : <Empty>Sem aulas hoje.</Empty>}
            </div>
          </Section>
          {aVencer.length > 0 && (
            <Section title="Próximos vencimentos">
              <div className="card overflow-hidden">
                {aVencer.slice(0, 5).map(({ m, s }) => (
                  <Link key={m.id} href={`/app/alunos/${m.aluno_id}`} className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0 hover:bg-bg">
                    <Avatar nome={m.aluno?.nome ?? "?"} />
                    <span className="flex min-w-0 flex-1 flex-col"><b className="truncate font-semibold">{m.aluno?.nome}</b><span className="text-[13px] text-muted">{primeiroNome(m.aluno?.turma?.nome) || "Sem turma"}</span></span>
                    <span className="flex flex-col items-end gap-1"><b className="num text-sm">{brl(m.valor)}</b><Pill k={s.k}>{s.texto}</Pill></span>
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}
