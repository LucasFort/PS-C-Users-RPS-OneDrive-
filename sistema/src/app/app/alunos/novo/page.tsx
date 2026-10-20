import Link from "next/link";
import { getEscola } from "@/lib/escola";
import { turmasDa } from "@/lib/dados";
import AlunoForm from "@/components/AlunoForm";
import { PageHead } from "@/components/ui";

export default async function NovoAluno() {
  const { supabase, escola } = await getEscola();
  const turmas = await turmasDa(supabase, escola.id);
  return (<><Link href="/app/alunos" className="text-sm font-bold text-accent">‹ Alunos</Link><PageHead title="Novo aluno" /><AlunoForm turmas={turmas} /></>);
}
