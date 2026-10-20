import Link from "next/link";
import { notFound } from "next/navigation";
import { getEscola } from "@/lib/escola";
import type { Turma } from "@/lib/dados";
import TurmaForm from "@/components/TurmaForm";
import { PageHead } from "@/components/ui";
import { Confirmar } from "@/components/acoes";
import { excluirTurma } from "../../../actions";

export default async function EditarTurma({ params }: { params: { id: string } }) {
  const { supabase, escola } = await getEscola();
  const { data: t } = await supabase.from("turmas").select("*").eq("id", params.id).eq("escola_id", escola.id).maybeSingle();
  if (!t) notFound();
  return (
    <>
      <Link href={`/app/turmas/${t.id}`} className="text-sm font-bold text-accent">‹ {t.nome}</Link>
      <PageHead title="Editar turma" />
      <TurmaForm turma={{ ...t, valor: Number(t.valor) } as Turma} />
      <div><Confirmar acao={excluirTurma.bind(null, t.id)} confirmar="Excluir turma (os alunos ficam sem turma)">Excluir turma</Confirmar></div>
    </>
  );
}
