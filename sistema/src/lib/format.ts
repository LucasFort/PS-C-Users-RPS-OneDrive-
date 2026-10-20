export const brl = (v: number | string | null | undefined) => Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const brl0 = (v: number | string | null | undefined) => Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const primeiroNome = (n?: string | null) => String(n ?? "").trim().split(/\s+/)[0] ?? "";
export function iniciais(n: string) { const p = n.trim().split(/\s+/); return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase(); }
/** Só dígitos, com 55 na frente quando faltar. */
export function foneWa(f: string) { let d = String(f).replace(/\D/g, ""); if (d.length >= 10 && d.length <= 11) d = "55" + d; return d; }
export function foneBonito(f: string) {
  const d = String(f).replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return f;
}
