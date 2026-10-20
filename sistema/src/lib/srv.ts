import "server-only";
import { createAnonClient } from "./supabase/server";

const segredo = () => {
  const s = process.env.SERVER_SECRET;
  if (!s) throw new Error("SERVER_SECRET não configurado");
  return s;
};

/** Chamadas que só o servidor pode fazer (o banco confere o segredo). */
export const srv = {
  async mpToken(escolaId: string) {
    const { data, error } = await createAnonClient().rpc("srv_mp_token", { p_secret: segredo(), p_escola: escolaId });
    if (error) throw error; return (data as string | null) ?? null;
  },
  async marcarPaga(mensalidadeId: string, mpPaymentId: string) {
    const { data, error } = await createAnonClient().rpc("srv_marcar_paga", { p_secret: segredo(), p_mensalidade: mensalidadeId, p_mp_payment: mpPaymentId });
    if (error) throw error; return Boolean(data);
  },
  async setMpPayment(mensalidadeId: string, mpPaymentId: string) {
    const { error } = await createAnonClient().rpc("srv_set_mp_payment", { p_secret: segredo(), p_mensalidade: mensalidadeId, p_mp_payment: mpPaymentId });
    if (error) throw error;
  },
  async setPlano(escolaId: string, status: "trial" | "ativo" | "pendente" | "cancelado", preapprovalId: string | null) {
    const { error } = await createAnonClient().rpc("srv_set_plano", { p_secret: segredo(), p_escola: escolaId, p_status: status, p_preapproval: preapprovalId });
    if (error) throw error;
  },
};
