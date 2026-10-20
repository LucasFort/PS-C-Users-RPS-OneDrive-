import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Turma = { id: string; nome: string; dias: number[]; hora: string; professor: string | null; valor: number; vagas: number };
export type Aluno = { id: string; nome: string; responsavel: string | null; whatsapp: string; valor: number; dia_vencimento: number; nascimento: string | null; ativo: boolean; inicio: string; turma_id: string | null; turma?: { nome: string } | null };
export type Mensalidade = {
  id: string; aluno_id: string; referencia: string; valor: number; vencimento: string; status: "aberta" | "paga" | "cancelada";
  pago_em: string | null; forma: string | null; token: string;
  aluno: { id: string; nome: string; responsavel: string | null; whatsapp: string; nascimento: string | null; turma: { nome: string } | null } | null;
};

export async function garantirMes(sb: SupabaseClient, escolaId: string, ref: string) {
  await sb.rpc("gerar_mensalidades", { p_escola: escolaId, p_ref: ref });
}

export async function mensalidadesDoMes(sb: SupabaseClient, escolaId: string, ref: string) {
  const { data, error } = await sb.from("mensalidades")
    .select("id,aluno_id,referencia,valor,vencimento,status,pago_em,forma,token,aluno:alunos(id,nome,responsavel,whatsapp,nascimento,turma:turmas(nome))")
    .eq("escola_id", escolaId).eq("referencia", ref).neq("status", "cancelada").order("vencimento");
  if (error) throw error;
  return (data ?? []).map((m) => ({ ...m, valor: Number(m.valor) })) as unknown as Mensalidade[];
}

export async function turmasDa(sb: SupabaseClient, escolaId: string) {
  const { data } = await sb.from("turmas").select("id,nome,dias,hora,professor,valor,vagas").eq("escola_id", escolaId).order("nome");
  return (data ?? []).map((t) => ({ ...t, valor: Number(t.valor) })) as Turma[];
}

export async function alunosDa(sb: SupabaseClient, escolaId: string) {
  const { data } = await sb.from("alunos").select("id,nome,responsavel,whatsapp,valor,dia_vencimento,nascimento,ativo,inicio,turma_id,turma:turmas(nome)").eq("escola_id", escolaId).order("nome");
  return (data ?? []).map((a) => ({ ...a, valor: Number(a.valor) })) as unknown as Aluno[];
}

export const linkPagamento = (token: string) => `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/p/${token}`;
