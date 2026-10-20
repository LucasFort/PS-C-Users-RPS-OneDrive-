import Link from "next/link";
import { getEscola } from "@/lib/escola";
import { alunosDa, turmasDa } from "@/lib/dados";
import { DIAS, diaSemana, hojeISO, somaDias } from "@/lib/datas";
import { brl } from "@/lib/format";
import { Empty, Meter, PageHead, Section } from "@/components/ui";

export default async function Turmas() {
  const { supabase, escola } = await getEscola();
  const hoje = hojeISO();
  const [turmas, alunos, { data: chamadas }] = await Promise.all([turmasDa(supabase, escola.id), alunosDa(supabase, escola.id),
    supabase.from("chamadas").select("turma_id,presencas").eq("escola_id", escola.id).gte("data", somaDias(hoje, -30))]);
  const freq = (id: string) => { let t = 0, p = 0; (chamadas ?? []).filter((c) => c.turma_id === id).forEach((c) => Object.values(c.presencas as Record<string, boolean>).forEach((v) => { t++; if (v) p++; })); return t ? Math.round((p / t) * 100) : null; };
  const hj = diaSemana(hoje);
  return (
    <>
      <PageHead title="Turmas" sub={`${turmas.length} turmas · ${alunos.filter((a) => a.ativo).length} alunos ativos`} action={<Link href="/app/turmas/nova" className="btn-primary btn-sm">+ Nova turma</Link>} />
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {turmas.length ? turmas.map((t) => {
            const n = alunos.filter((a) => a.ativo && a.turma_id === t.id).length; const oc = Math.round((n / (t.vagas || 1)) * 100); const f = freq(t.id);
            return (
              <Link key={t.id} href={`/app/turmas/${t.id}`} className="card flex flex-col gap-2.5 p-3.5 hover:border-accent">
                <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-base font-extrabold">{t.nome}</h3><span className="text-[13px] text-muted">{t.dias.map((d) => DIAS[d]).join(", ") || "Sem dias"} · {t.hora}{t.professor ? ` · ${t.professor}` : ""}</span></div><b className="num text-sm">{brl(t.valor)}</b></div>
                <Meter pct={oc} tone={oc >= 90 ? "warn" : undefined} />
                <div className="flex justify-between text-[13px] text-muted"><span><b className="num text-ink">{n}</b>/{t.vagas} vagas</span><span>Frequência <b className="num text-ink">{f == null ? "—" : `${f}%`}</b></span></div>
              </Link>
            );
          }) : <div className="card"><Empty>Nenhuma turma ainda. <Link href="/app/turmas/nova" className="font-bold text-accent">Criar a primeira</Link></Empty></div>}
        </div>
        <Section title="Agenda da semana">
          <div className="card flex flex-col divide-y divide-line px-4">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const ts = turmas.filter((t) => t.dias.includes(d)).sort((a, b) => a.hora.localeCompare(b.hora));
              return (
                <div key={d} className="flex items-baseline gap-3 py-2.5">
                  <b className={`w-9 flex-none text-[13px] uppercase tracking-wide ${d === hj ? "text-accent" : "text-muted"}`}>{DIAS[d]}</b>
                  <div className="flex flex-wrap gap-1.5">{ts.length ? ts.map((t) => <span key={t.id} className="rounded-md bg-bg px-2 py-1 text-[13px]"><b className="num">{t.hora}</b> {t.nome}</span>) : <span className="text-[13px] text-muted">—</span>}</div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </>
  );
}
