import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getEscola } from "@/lib/escola";
import { garantirMes, mensalidadesDoMes, turmasDa } from "@/lib/dados";
import { hojeISO, mesCurto, nomeRef, refAtual, situacao, somaMeses } from "@/lib/datas";
import { brl, brl0 } from "@/lib/format";
import Grafico from "@/components/Grafico";
import { Empty, Meter, Note, PageHead, Section, Tile } from "@/components/ui";
import { AcaoServidor } from "@/components/acoes";
import { excluirDespesa, salvarDespesa } from "../actions";

export default async function Financeiro({ searchParams }: { searchParams: { ref?: string } }) {
  const { supabase, escola } = await getEscola();
  const atual = refAtual();
  const ref = /^\d{4}-\d{2}$/.test(searchParams.ref ?? "") && searchParams.ref! <= atual ? searchParams.ref! : atual;
  await garantirMes(supabase, escola.id, ref);
  const ini = somaMeses(ref, -5); const hoje = hojeISO();
  const [mens, turmas, { data: hist }, { data: desp }] = await Promise.all([
    mensalidadesDoMes(supabase, escola.id, ref), turmasDa(supabase, escola.id),
    supabase.from("mensalidades").select("referencia,valor").eq("escola_id", escola.id).eq("status", "paga").gte("referencia", ini).lte("referencia", ref),
    supabase.from("despesas").select("id,descricao,categoria,valor,referencia").eq("escola_id", escola.id).gte("referencia", ini).lte("referencia", ref).order("created_at"),
  ]);
  const doMes = (desp ?? []).filter((d) => d.referencia === ref);
  const totD = doMes.reduce((s, d) => s + Number(d.valor), 0);
  const com = mens.map((m) => ({ m, s: situacao(m, hoje) }));
  const rec = com.filter((x) => x.s.k === "paga").reduce((s, x) => s + x.m.valor, 0);
  const prev = com.reduce((s, x) => s + x.m.valor, 0);
  const atr = com.filter((x) => x.s.k === "atrasada").reduce((s, x) => s + x.m.valor, 0);
  const vencido = com.filter((x) => x.m.vencimento <= hoje).reduce((s, x) => s + x.m.valor, 0);
  const inad = vencido ? Math.round((atr / vencido) * 100) : 0;
  const serie = Array.from({ length: 6 }, (_, i) => somaMeses(ref, i - 5)).map((r) => ({
    rotulo: mesCurto(r), a: (hist ?? []).filter((h) => h.referencia === r).reduce((s, h) => s + Number(h.valor), 0), b: (desp ?? []).filter((d) => d.referencia === r).reduce((s, d) => s + Number(d.valor), 0) }));
  const formas: Record<string, number> = { Pix: 0, "Pix automático": 0, Dinheiro: 0, Cartão: 0 };
  com.filter((x) => x.s.k === "paga").forEach(({ m }) => { const k = m.forma === "mercado_pago" ? "Pix automático" : m.forma === "dinheiro" ? "Dinheiro" : m.forma === "cartao" ? "Cartão" : "Pix"; formas[k] += m.valor; });
  const ft = Object.values(formas).reduce((s, v) => s + v, 0) || 1;
  const porTurma = turmas.map((t) => { const ms = com.filter((x) => x.m.aluno?.turma?.nome === t.nome); return { t, prev: ms.reduce((s, x) => s + x.m.valor, 0), rec: ms.filter((x) => x.s.k === "paga").reduce((s, x) => s + x.m.valor, 0) }; }).filter((r) => r.prev > 0);
  const q = (r: string) => `?ref=${r}`;
  return (
    <>
      <PageHead eyebrow="Financeiro" title="Entradas, saídas e lucro" />
      <div className="flex items-center gap-1">
        <Link href={q(somaMeses(ref, -1))} className="btn-ghost btn-sm" aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></Link>
        <b className="min-w-[150px] text-center capitalize">{nomeRef(ref)}</b>
        {ref < atual ? <Link href={q(somaMeses(ref, 1))} className="btn-ghost btn-sm" aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></Link> : <span className="w-[38px]" />}
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Tile tone="ok" value={brl0(rec)} label="recebido" />
        <Tile value={brl0(totD)} label="despesas" />
        <Tile tone={rec - totD >= 0 ? "ok" : "bad"} value={brl0(rec - totD)} label="lucro até agora" />
        <Tile tone={inad > 15 ? "bad" : "warn"} value={`${inad}%`} label="inadimplência" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="card flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between"><h2 className="text-[19px] font-extrabold">Recebido x despesas</h2><span className="eyebrow">6 meses</span></div>
            <Grafico dados={serie} />
            <Note>Se todos pagarem, o lucro de {nomeRef(ref).split(" ")[0]} fica em <b className="num">{brl(prev - totD)}</b>. Faltam <b className="num">{brl(prev - rec)}</b> para entrar.</Note>
          </section>
          {porTurma.length > 0 && (
            <section className="card flex flex-col gap-3 p-4">
              <h2 className="text-[19px] font-extrabold">Por turma</h2>
              {porTurma.map((r) => (
                <div key={r.t.id} className="flex flex-col gap-1">
                  <div className="flex justify-between gap-3 text-sm"><span className="truncate">{r.t.nome}</span><b className="num">{brl(r.rec)} <span className="font-medium text-muted">de {brl(r.prev)}</span></b></div>
                  <Meter pct={r.prev ? (r.rec / r.prev) * 100 : 0} />
                </div>
              ))}
            </section>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <section className="card flex flex-col gap-3 p-4">
            <h2 className="text-[19px] font-extrabold">Como os alunos pagaram</h2>
            {Object.entries(formas).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1"><div className="flex justify-between text-sm"><span>{k}</span><b className="num">{brl(v)} · {Math.round((v / ft) * 100)}%</b></div><Meter pct={(v / ft) * 100} /></div>
            ))}
            {rec === 0 && <p className="text-sm text-muted">Nenhum pagamento neste mês ainda.</p>}
          </section>
          <Section title="Despesas do mês">
            <form action={salvarDespesa} className="card flex flex-col gap-2.5 p-3.5">
              <input type="hidden" name="referencia" value={ref} />
              <input className="field" name="descricao" required placeholder="Ex.: Aluguel da quadra" aria-label="Descrição" />
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input className="field num" name="valor" required inputMode="decimal" placeholder="Valor (R$)" aria-label="Valor" />
                <select className="field" name="categoria" aria-label="Categoria">{["Aluguel", "Equipe", "Contas", "Material", "Marketing", "Outros"].map((c) => <option key={c}>{c}</option>)}</select>
                <button className="btn-primary btn-sm">Lançar</button>
              </div>
            </form>
            <div className="card overflow-hidden">
              {doMes.length ? doMes.map((d) => (
                <div key={d.id} className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 first:border-t-0">
                  <span className="flex min-w-0 flex-1 flex-col"><b className="truncate font-semibold">{d.descricao}</b><span className="text-[13px] text-muted">{d.categoria}</span></span>
                  <b className="num text-sm">{brl(d.valor)}</b>
                  <AcaoServidor acao={excluirDespesa.bind(null, d.id)} className="grid h-8 w-8 place-items-center rounded-full bg-bg text-muted"><X className="h-4 w-4" aria-label="Excluir despesa" /></AcaoServidor>
                </div>
              )) : <Empty>Nenhuma despesa lançada.</Empty>}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
