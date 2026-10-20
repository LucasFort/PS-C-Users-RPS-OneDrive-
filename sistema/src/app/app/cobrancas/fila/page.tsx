import { getEscola } from "@/lib/escola";
import { garantirMes, mensalidadesDoMes } from "@/lib/dados";
import { hojeISO, refAtual, situacao } from "@/lib/datas";
import { brl } from "@/lib/format";
import { mensagemCobranca } from "@/lib/cobranca";
import { PageHead } from "@/components/ui";
import Fila from "./Fila";

export default async function FilaPage() {
  const { supabase, escola } = await getEscola();
  const ref = refAtual(); const hoje = hojeISO();
  await garantirMes(supabase, escola.id, ref);
  const itens = (await mensalidadesDoMes(supabase, escola.id, ref))
    .map((m) => ({ m, s: situacao(m, hoje) })).filter((x) => x.s.k === "atrasada").sort((a, b) => b.s.dias - a.s.dias)
    .map(({ m, s }) => { const msg = mensagemCobranca(escola, m, hoje); return { id: m.id, alunoId: m.aluno_id, nome: m.aluno?.nome ?? "", para: m.aluno?.responsavel || m.aluno?.nome || "", fone: m.aluno?.whatsapp ?? "", valor: brl(m.valor), atraso: s.texto, k: msg.k, texto: msg.texto, href: msg.href }; });
  return (
    <>
      <PageHead eyebrow="Cobranças" title="Cobrar atrasados" sub="Toque em enviar, mande no WhatsApp e volte para o próximo." />
      <Fila itens={itens} />
    </>
  );
}
