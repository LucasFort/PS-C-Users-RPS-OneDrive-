import Link from "next/link";
import { notFound } from "next/navigation";
import { getEscola } from "@/lib/escola";
import { DIAS, dataBR, diaSemana, hojeISO, somaDias } from "@/lib/datas";
import { modeloDe, preenche, waLink } from "@/lib/mensagens";
import { PageHead } from "@/components/ui";
import Chamada from "./Chamada";

export default async function ChamadaPage({ params, searchParams }: { params: { id: string }; searchParams: { data?: string } }) {
  const { supabase, escola } = await getEscola();
  const { data: t } = await supabase.from("turmas").select("*").eq("id", params.id).eq("escola_id", escola.id).maybeSingle();
  if (!t) notFound();
  let data = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.data ?? "") ? searchParams.data! : hojeISO();
  if (!searchParams.data && (t.dias as number[]).length) for (let i = 0; i < 7 && !(t.dias as number[]).includes(diaSemana(data)); i++) data = somaDias(data, -1);
  const [{ data: alunos }, { data: ch }] = await Promise.all([
    supabase.from("alunos").select("id,nome,responsavel,whatsapp").eq("turma_id", t.id).eq("ativo", true).order("nome"),
    supabase.from("chamadas").select("presencas").eq("turma_id", t.id).eq("data", data).maybeSingle(),
  ]);
  const lista = (alunos ?? []).map((a) => ({ id: a.id, nome: a.nome,
    avisoFalta: escola.auto?.falta ? waLink(a.whatsapp, preenche(modeloDe("falta", escola.modelos), { escola: escola.nome, aluno: { nome: a.nome, responsavel: a.responsavel, turma: t.nome } })) : null }));
  return (
    <>
      <Link href={`/app/turmas/${t.id}`} className="text-sm font-bold text-accent">‹ {t.nome}</Link>
      <PageHead title={`Chamada · ${t.nome}`} sub={`${DIAS[diaSemana(data)]}, ${dataBR(data)} · ${t.hora}`} />
      <Chamada turmaId={t.id} data={data} alunos={lista} inicial={(ch?.presencas as Record<string, boolean>) ?? null} />
    </>
  );
}
