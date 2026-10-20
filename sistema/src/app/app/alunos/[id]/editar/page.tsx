import Link from "next/link";
import { notFound } from "next/navigation";
import { getEscola } from "@/lib/escola";
import { turmasDa, type Aluno } from "@/lib/dados";
import AlunoForm from "@/components/AlunoForm";
import { PageHead } from "@/components/ui";

export default async function EditarAluno({ params }: { params: { id: string } }) {
  const { supabase, escola } = await getEscola();
  const [{ data: aluno }, turmas] = await Promise.all([supabase.from("alunos").select("*").eq("id", params.id).eq("escola_id", escola.id).maybeSingle(), turmasDa(supabase, escola.id)]);
  if (!aluno) notFound();
  return (<><Link href={`/app/alunos/${params.id}`} className="text-sm font-bold text-accent">‹ {aluno.nome}</Link><PageHead title="Editar aluno" /><AlunoForm aluno={{ ...aluno, valor: Number(aluno.valor) } as Aluno} turmas={turmas} /></>);
}
