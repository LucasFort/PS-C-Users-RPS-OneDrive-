import "server-only";
import { createAnonClient } from "./supabase/server";

export type Publico = { mensalidade_id: string; escola_id: string; escola: string; aluno: string; referencia: string; valor: number; vencimento: string; status: string; chave_pix: string | null; nome_pix: string; cidade: string | null; tem_mp: boolean };

export async function pagamentoPublico(token: string): Promise<Publico | null> {
  if (!/^[a-f0-9]{24}$/.test(token)) return null;
  const { data } = await createAnonClient().rpc("pagamento_publico", { p_token: token });
  const r = (data as Publico[] | null)?.[0];
  return r ? { ...r, valor: Number(r.valor) } : null;
}
