import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente do servidor para as funções srv_* do banco.
 * Usa a chave secreta do Supabase (SUPABASE_SECRET_KEY, role service_role) ou, como alternativa, SERVER_SECRET.
 */
function cliente() {
  const chave = process.env.SUPABASE_SECRET_KEY;
  const segredo = process.env.SERVER_SECRET ?? "";
  if (!chave && !segredo) throw new Error("Configure SUPABASE_SECRET_KEY no Vercel");
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  return { sb, p_secret: segredo };
}

/** Chamadas que só o servidor pode fazer (o banco confere a chave). */
export const srv = {
  async mpToken(escolaId: string) {
    const { sb, p_secret } = cliente();
    const { data, error } = await sb.rpc("srv_mp_token", { p_secret, p_escola: escolaId });
    if (error) throw error; return (data as string | null) ?? null;
  },
  async marcarPaga(mensalidadeId: string, mpPaymentId: string) {
    const { sb, p_secret } = cliente();
    const { data, error } = await sb.rpc("srv_marcar_paga", { p_secret, p_mensalidade: mensalidadeId, p_mp_payment: mpPaymentId });
    if (error) throw error; return Boolean(data);
  },
  async setMpPayment(mensalidadeId: string, mpPaymentId: string) {
    const { sb, p_secret } = cliente();
    const { error } = await sb.rpc("srv_set_mp_payment", { p_secret, p_mensalidade: mensalidadeId, p_mp_payment: mpPaymentId });
    if (error) throw error;
  },
  async setPlano(escolaId: string, status: "trial" | "ativo" | "pendente" | "cancelado", preapprovalId: string | null) {
    const { sb, p_secret } = cliente();
    const { error } = await sb.rpc("srv_set_plano", { p_secret, p_escola: escolaId, p_status: status, p_preapproval: preapprovalId });
    if (error) throw error;
  },
};
