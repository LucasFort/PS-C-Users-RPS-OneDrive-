import Link from "next/link";
import { getEscola } from "@/lib/escola";
import { alunosDa, garantirMes, mensalidadesDoMes, turmasDa } from "@/lib/dados";
import { hojeISO, refAtual, situacao } from "@/lib/datas";
import { brl } from "@/lib/format";
import { Note, PageHead } from "@/components/ui";
import BuscaAlunos from "./BuscaAlunos";

export default async function Alunos({ searchParams }: { searchParams: { novo?: string } }) {
  const { supabase, escola } = await getEscola();
  const ref = refAtual(); await garantirMes(supabase, escola.id, ref);
  const [alunos, turmas, mens] = await Promise.all([alunosDa(supabase, escola.id), turmasDa(supabase, escola.id), mensalidadesDoMes(supabase, escola.id, ref)]);
  const porAluno = new Map(mens.map((m) => [m.aluno_id, m])); const hoje = hojeISO();
  const linhas = alunos.map((a) => {
    const m = porAluno.get(a.id);
    return { id: a.id, nome: a.nome, responsavel: a.responsavel, turma: a.turma?.nome ?? "Sem turma", turmaId: a.turma_id ?? "", valor: brl(a.valor), ativo: a.ativo,
      sit: !a.ativo ? { k: "inativo" as const, texto: "Inativo" } : m ? situacao(m, hoje) : { k: "aberta" as const, texto: `Vence dia ${a.dia_vencimento}` } };
  });
  const ativos = alunos.filter((a) => a.ativo).length;
  return (
    <>
      <PageHead title="Alunos" sub={`${ativos} ativos · ${alunos.length - ativos} inativos`}
        action={<div className="flex gap-2"><Link href="/app/alunos/importar" className="btn-ghost btn-sm">Importar lista</Link><Link href="/app/alunos/novo" className="btn-primary btn-sm">+ Novo aluno</Link></div>} />
      {searchParams.novo && <Note><b>Aluno cadastrado.</b> A mensalidade deste mês já foi criada em Cobranças.</Note>}
      <BuscaAlunos alunos={linhas} turmas={turmas.map((t) => ({ id: t.id, nome: t.nome }))} />
    </>
  );
}
