export const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
export const MES3 = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
export const DIAS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

/** Data de hoje em São Paulo, no formato AAAA-MM-DD. */
export function hojeISO(agora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
}
export const refDe = (iso: string) => iso.slice(0, 7);
export const refAtual = () => refDe(hojeISO());
export function nomeRef(ref: string) { const [y, m] = ref.split("-").map(Number); return `${MESES[m - 1]} de ${y}`; }
export function mesCurto(ref: string) { return MES3[Number(ref.slice(5, 7)) - 1]; }
export function somaMeses(ref: string, n: number) {
  const [y, m] = ref.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
export function diasEntre(a: string, b: string) { return Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000); }
export function somaDias(iso: string, n: number) { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
export const dataBR = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
export const diaSemana = (iso: string) => new Date(iso + "T12:00:00Z").getUTCDay();

export type SituacaoKey = "paga" | "atrasada" | "vence" | "aberta" | "cancelada";
export function situacao(m: { status: string; vencimento: string }, hoje = hojeISO()): { k: SituacaoKey; texto: string; dias: number } {
  if (m.status === "paga") return { k: "paga", texto: "Paga", dias: 0 };
  if (m.status === "cancelada") return { k: "cancelada", texto: "Cancelada", dias: 0 };
  const d = diasEntre(m.vencimento, hoje);
  if (d > 0) return { k: "atrasada", texto: `${d} ${d === 1 ? "dia" : "dias"} de atraso`, dias: d };
  if (d === 0) return { k: "vence", texto: "Vence hoje", dias: 0 };
  if (d >= -3) return { k: "vence", texto: `Vence em ${-d} ${d === -1 ? "dia" : "dias"}`, dias: d };
  return { k: "aberta", texto: `Vence dia ${Number(m.vencimento.slice(8, 10))}`, dias: d };
}
