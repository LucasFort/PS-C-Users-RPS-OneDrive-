import Link from "next/link";
import { notFound } from "next/navigation";
import { getEscola } from "@/lib/escola";
import { DIAS } from "@/lib/datas";
import { brl } from "@/lib/format";
import { Avatar, Empty, PageHead, Tile } from "@/components/ui";

export default async function TurmaPage({ params }: { params: { id: string } }) {
  const { supabase, escola } = await getEscola();
  const [{ data: t }, { data: alunos }] = await Promise.all([
    supabase.from("turmas").select("*").eq("id", params.id).eq("escola_id", escola.id).maybeSingle(),
    supabase.from("alunos").select("id,nome,responsavel,valor").eq("turma_id", params.id).eq("ativo", true).order("nome"),
  ]);
  if (!t) notFound();
  return (
    <>
      <Link href="/app/turmas" className="text-sm font-bold text-accent">‹ Turmas</Link>
      <PageHead title={t.nome} sub={`${(t.dias as number[]).map((d) => DIAS[d]).join(", ") || "Sem dias"} · ${t.hora}${t.professor ? ` · ${t.professor}` : ""}`}
        action={<Link href={`/app/turmas/${t.id}/editar`} className="btn-ghost btn-sm">Editar</Link>} />
      <div className="grid grid-cols-3 gap-2.5">
        <Tile value={`${alunos?.length ?? 0}/${t.vagas}`} label="alunos" />
        <Tile value={brl(t.valor)} label="mensalidade" />
        <Tile value={brl((alunos ?? []).reduce((s, a) => s + Number(a.valor), 0))} label="previsto por mês" tone="ok" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/app/turmas/${t.id}/chamada`} className="btn-primary">Fazer chamada</Link>
        <Link href={`/app/comunicados?para=${t.id}`} className="btn-ghost">Aviso para a turma</Link>
      </div>
      <div className="card overflow-hidden">
        {alunos?.length ? alunos.map((a) => (
          <Link key={a.id} href={`/app/alunos/${a.id}`} className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0 hover:bg-bg">
            <Avatar nome={a.nome} /><span className="flex min-w-0 flex-1 flex-col"><b className="truncate font-semibold">{a.nome}</b>{a.responsavel && <span className="text-[13px] text-muted">resp. {a.responsavel}</span>}</span><b className="num text-sm">{brl(a.valor)}</b>
          </Link>
        )) : <Empty>Nenhum aluno nesta turma.</Empty>}
      </div>
    </>
  );
}
