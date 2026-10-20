import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { criarAssinatura } from "@/lib/mp";
import { srv } from "@/lib/srv";
import { hojeISO } from "@/lib/datas";

export async function POST() {
  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(`${site}/entrar`, 303);
  const { data: v } = await sb.from("escola_membros").select("escola_id, escola:escolas(plano_status,trial_ate)").eq("user_id", user.id).limit(1).maybeSingle();
  const escola = v?.escola as unknown as { plano_status: string; trial_ate: string } | null;
  if (!v || !escola) return NextResponse.redirect(`${site}/cadastro`, 303);
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return NextResponse.redirect(`${site}/app/assinatura?erro=config`, 303);
  try {
    const inicio = escola.trial_ate > hojeISO() ? new Date(escola.trial_ate + "T12:00:00-03:00").toISOString() : undefined;
    const a = await criarAssinatura(token, { escolaId: v.escola_id, email: user.email!, valor: Number(process.env.PLANO_PRECO ?? 49), voltaUrl: `${site}/app/assinatura?volta=1`, inicio });
    await srv.setPlano(v.escola_id, escola.plano_status as "trial", a.id);
    return NextResponse.redirect(a.init_point, 303);
  } catch (e) {
    console.error("assinatura", e);
    return NextResponse.redirect(`${site}/app/assinatura?erro=mp`, 303);
  }
}
