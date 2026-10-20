import "server-only";
// Mercado Pago: API REST (https://www.mercadopago.com.br/developers/pt/reference)
const API = "https://api.mercadopago.com";

async function mp<T>(token: string, path: string, init?: RequestInit & { idempotency?: string }): Promise<T> {
  const r = await fetch(API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`, "Content-Type": "application/json",
      ...(init?.idempotency ? { "X-Idempotency-Key": init.idempotency } : {}),
    },
    cache: "no-store",
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Mercado Pago ${r.status}: ${body?.message ?? "erro"}`);
  return body as T;
}

export type PixMP = { id: number; status: string; point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string; ticket_url?: string } } };

/** Cria um Pix na conta Mercado Pago da escola para uma mensalidade. */
export function criarPix(token: string, o: { valor: number; descricao: string; mensalidadeId: string; email: string; notificationUrl: string }) {
  return mp<PixMP>(token, "/v1/payments", {
    method: "POST", idempotency: `mens-${o.mensalidadeId}-${Math.round(o.valor * 100)}`,
    body: JSON.stringify({
      transaction_amount: Number(o.valor.toFixed(2)), description: o.descricao, payment_method_id: "pix",
      payer: { email: o.email }, external_reference: o.mensalidadeId, notification_url: o.notificationUrl,
      date_of_expiration: new Date(Date.now() + 7 * 86400000).toISOString(),
    }),
  });
}
export const buscarPagamento = (token: string, id: string) => mp<PixMP & { external_reference?: string; transaction_amount: number }>(token, `/v1/payments/${encodeURIComponent(id)}`);

export type Preapproval = { id: string; status: string; init_point: string; external_reference?: string };
/** Assinatura mensal do sistema (cobrada na conta Mercado Pago do dono do sistema). */
export function criarAssinatura(token: string, o: { escolaId: string; email: string; valor: number; voltaUrl: string; inicio?: string }) {
  return mp<Preapproval>(token, "/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: "Mensalidade em Dia · plano Completo", external_reference: o.escolaId, payer_email: o.email, back_url: o.voltaUrl,
      auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: o.valor, currency_id: "BRL", ...(o.inicio ? { start_date: o.inicio } : {}) },
      status: "pending",
    }),
  });
}
export const buscarAssinatura = (token: string, id: string) => mp<Preapproval>(token, `/preapproval/${encodeURIComponent(id)}`);
