import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "./supabase/server";
import { hojeISO } from "./datas";

export type Escola = {
  id: string; nome: string; tipo: string; whatsapp: string | null; cidade: string | null; chave_pix: string | null; nome_pix: string | null;
  plano_status: "trial" | "ativo" | "pendente" | "cancelado"; trial_ate: string; mp_preapproval_id: string | null;
  modelos: Record<string, string>; auto: Record<string, boolean>;
};

/** Escola do usuário logado. Sem login vai para /entrar; logado sem escola vai para /cadastro. */
export const getEscola = cache(async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  let { data: vinculo } = await supabase.from("escola_membros").select("escola_id").eq("user_id", user.id).limit(1).maybeSingle();
  // Cadastro com confirmação de e-mail: os dados da escola vieram no metadata e a escola é criada no primeiro acesso
  const md = user.user_metadata ?? {};
  if (!vinculo && md.escola_nome) {
    const { data: id } = await supabase.rpc("criar_escola", { p_nome: md.escola_nome, p_tipo: md.escola_tipo ?? "futebol", p_whatsapp: md.escola_whatsapp ?? null, p_cidade: md.escola_cidade ?? null });
    if (id) vinculo = { escola_id: id as string };
  }
  if (!vinculo) redirect("/cadastro?etapa=escola");
  const { data: escola } = await supabase.from("escolas").select("*").eq("id", vinculo.escola_id).single();
  if (!escola) redirect("/cadastro?etapa=escola");
  return { supabase, user, escola: escola as Escola };
});

export function acessoLiberado(e: Pick<Escola, "plano_status" | "trial_ate">) {
  if (e.plano_status === "ativo") return true;
  return e.trial_ate >= hojeISO();
}
export function diasDeTeste(e: Pick<Escola, "trial_ate">) {
  return Math.max(0, Math.round((Date.parse(e.trial_ate + "T12:00:00Z") - Date.parse(hojeISO() + "T12:00:00Z")) / 86400000));
}
