import { NextResponse } from "next/server";
import { srv } from "@/lib/srv";
import { buscarAssinatura } from "@/lib/mp";

export const dynamic = "force-dynamic";
const MAPA: Record<string, "ativo" | "pendente" | "cancelado"> = { authorized: "ativo", paused: "pendente", cancelled: "cancelado" };

/** Aviso do Mercado Pago sobre a assinatura do sistema (conta do dono do sistema). */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const tipo = (body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic")) as string | undefined;
  const id = String((body.data as { id?: string } | undefined)?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token || !id || !/preapproval/.test(tipo ?? "")) return NextResponse.json({ ok: true, ignorado: true });
  try {
    const a = await buscarAssinatura(token, id);
    const status = MAPA[a.status];
    if (status && a.external_reference && /^[0-9a-f-]{36}$/.test(a.external_reference)) await srv.setPlano(a.external_reference, status, a.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webhook assinatura", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
