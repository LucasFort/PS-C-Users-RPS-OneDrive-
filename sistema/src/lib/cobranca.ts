import type { Escola } from "./escola";
import type { Mensalidade } from "./dados";
import { diasEntre, hojeISO, situacao, somaDias } from "./datas";
import { modeloDe, preenche, waLink, type ModeloKey } from "./mensagens";

const link = (token: string) => `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/p/${token}`;

/** Mensagem certa para a situação da mensalidade (lembrete, no dia, atraso ou último aviso). */
export function mensagemCobranca(escola: Pick<Escola, "nome" | "modelos">, m: Mensalidade, hoje = hojeISO()) {
  const s = situacao(m, hoje);
  const k: ModeloKey = s.k === "paga" ? "recibo" : s.k === "atrasada" ? (s.dias >= 7 ? "ultimo" : "atraso") : s.k === "vence" && s.dias === 0 ? "cobranca" : "lembrete";
  const texto = preenche(modeloDe(k, escola.modelos), {
    escola: escola.nome, aluno: m.aluno ? { nome: m.aluno.nome, responsavel: m.aluno.responsavel, turma: m.aluno.turma?.nome } : undefined,
    valor: m.valor, referencia: m.referencia, vencimento: m.vencimento, link: link(m.token),
  });
  return { k, texto, href: waLink(m.aluno?.whatsapp ?? "", texto) };
}

export type ItemRegua = { k: ModeloKey; m?: Mensalidade; aluno: { id: string; nome: string; responsavel: string | null; whatsapp: string; turma?: string | null }; texto: string; href: string };

/** O que a régua manda em um dia (lembrete -3, no dia, +3, +7 e aniversários). */
export function reguaDoDia(escola: Pick<Escola, "nome" | "modelos" | "auto">, mens: Mensalidade[], alunos: { id: string; nome: string; responsavel: string | null; whatsapp: string; nascimento: string | null; ativo: boolean; turma?: { nome: string } | null }[], dia = hojeISO()): ItemRegua[] {
  const A = escola.auto ?? {}; const out: ItemRegua[] = [];
  const passo: Record<number, ModeloKey> = { [-3]: "lembrete", 0: "cobranca", 3: "atraso", 7: "ultimo" };
  for (const m of mens) {
    if (m.status !== "aberta" || !m.aluno) continue;
    const k = passo[diasEntre(m.vencimento, dia)];
    if (!k || !A[k]) continue;
    const texto = preenche(modeloDe(k, escola.modelos), { escola: escola.nome, aluno: { nome: m.aluno.nome, responsavel: m.aluno.responsavel, turma: m.aluno.turma?.nome }, valor: m.valor, referencia: m.referencia, vencimento: m.vencimento, link: link(m.token) });
    out.push({ k, m, aluno: { ...m.aluno, turma: m.aluno.turma?.nome }, texto, href: waLink(m.aluno.whatsapp, texto) });
  }
  if (A.aniversario) for (const a of alunos) {
    if (!a.ativo || !a.nascimento || a.nascimento.slice(5) !== dia.slice(5)) continue;
    const texto = preenche(modeloDe("aniversario", escola.modelos), { escola: escola.nome, aluno: { nome: a.nome, responsavel: a.responsavel, turma: a.turma?.nome } });
    out.push({ k: "aniversario", aluno: { ...a, turma: a.turma?.nome }, texto, href: waLink(a.whatsapp, texto) });
  }
  return out;
}

export const proximosDias = (n: number, hoje = hojeISO()) => Array.from({ length: n }, (_, i) => somaDias(hoje, i));
