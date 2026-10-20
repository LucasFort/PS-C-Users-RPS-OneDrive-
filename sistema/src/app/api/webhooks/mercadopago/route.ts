import { NextResponse } from "next/server";
import { srv } from "@/lib/srv";
import { buscarPagamento } from "@/lib/mp";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f-]{36}$/;

/** Aviso do Mercado Pago (conta da escola). Sempre confere o pagamento na API antes de dar baixa. */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const escola = url.searchParams.get("e") ?? "";
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const tipo = (body.type ?? body.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic")) as string | undefined;
  const id = String((body.data as { id?: string } | undefined)?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (tipo !== "payment" || !/^\d+$/.test(id) || !UUID.test(escola)) return NextResponse.json({ ok: true, ignorado: true });
  try {
    const token = await srv.mpToken(escola);
    if (!token) return NextResponse.json({ ok: true, ignorado: "sem token" });
    const pg = await buscarPagamento(token, id);
    if (pg.status === "approved" && pg.external_reference && UUID.test(pg.external_reference)) await srv.marcarPaga(pg.external_reference, String(pg.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webhook mp", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
