import { getEscola } from "@/lib/escola";
import { alunosDa, garantirMes, mensalidadesDoMes, turmasDa } from "@/lib/dados";
import { hojeISO, refAtual, situacao } from "@/lib/datas";
import { PageHead } from "@/components/ui";
import Comunicado from "./Comunicado";

export default async function Comunicados({ searchParams }: { searchParams: { para?: string } }) {
  const { supabase, escola } = await getEscola();
  const ref = refAtual(); await garantirMes(supabase, escola.id, ref);
  const [alunos, turmas, mens] = await Promise.all([alunosDa(supabase, escola.id), turmasDa(supabase, escola.id), mensalidadesDoMes(supabase, escola.id, ref)]);
  const hoje = hojeISO();
  const atrasados = new Set(mens.filter((m) => situacao(m, hoje).k === "atrasada").map((m) => m.aluno_id));
  const contatos = alunos.filter((a) => a.ativo).map((a) => ({ id: a.id, nome: a.nome, para: a.responsavel || a.nome, whatsapp: a.whatsapp, turmaId: a.turma_id ?? "", atrasado: atrasados.has(a.id) }));
  return (
    <>
      <PageHead eyebrow="Mais" title="Comunicados" sub="Escreva uma vez e mande para cada contato com 1 toque." />
      <Comunicado escola={escola.nome} contatos={contatos} turmas={turmas.map((t) => ({ id: t.id, nome: t.nome }))} paraInicial={searchParams.para ?? "todos"} />
    </>
  );
}
