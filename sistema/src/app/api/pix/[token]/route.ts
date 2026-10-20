import { NextResponse } from "next/server";
import { pagamentoPublico } from "@/lib/publico";
import { srv } from "@/lib/srv";
import { criarPix } from "@/lib/mp";
import { MESES } from "@/lib/datas";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const p = await pagamentoPublico(params.token);
  return NextResponse.json({ status: p?.status ?? "inexistente" }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(_: Request, { params }: { params: { token: string } }) {
  const p = await pagamentoPublico(params.token);
  if (!p || p.status !== "aberta") return NextResponse.json({ erro: "Cobrança indisponível." }, { status: 404 });
  if (!p.tem_mp) return NextResponse.json({ erro: "Pix automático não configurado." }, { status: 400 });
  try {
    const token = await srv.mpToken(p.escola_id);
    if (!token) return NextResponse.json({ erro: "Pix automático não configurado." }, { status: 400 });
    const site = process.env.NEXT_PUBLIC_SITE_URL!;
    const pix = await criarPix(token, {
      valor: p.valor, descricao: `Mensalidade ${MESES[Number(p.referencia.slice(5)) - 1]} · ${p.aluno} · ${p.escola}`.slice(0, 120),
      mensalidadeId: p.mensalidade_id, email: `pagador.${p.mensalidade_id.slice(0, 8)}@mensalidadeemdia.com.br`,
      notificationUrl: `${site}/api/webhooks/mercadopago?e=${p.escola_id}`,
    });
    await srv.setMpPayment(p.mensalidade_id, String(pix.id));
    const td = pix.point_of_interaction?.transaction_data;
    if (!td?.qr_code || !td.qr_code_base64) throw new Error("Pix sem QR");
    return NextResponse.json({ qr_code: td.qr_code, qr_code_base64: td.qr_code_base64 });
  } catch (e) {
    console.error("pix", e);
    return NextResponse.json({ erro: "Não foi possível gerar o Pix agora. Tente de novo em instantes." }, { status: 502 });
  }
}
