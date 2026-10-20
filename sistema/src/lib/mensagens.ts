import { brl, foneWa, primeiroNome } from "./format";
import { MESES, dataBR } from "./datas";

export const MODELOS = {
  lembrete: "Olá, {responsavel}! 👋\nPassando para lembrar que a mensalidade{do_aluno} ({turma}) vence em {vencimento}, no valor de {valor}.\n\nPague pelo Pix aqui: {link}\n\nObrigado! {escola}",
  cobranca: "Olá, {responsavel}! Hoje vence a mensalidade{do_aluno} referente a {mes}: {valor}.\n\nPague pelo Pix aqui: {link}\n\nQualquer dúvida é só responder.",
  atraso: "Olá, {responsavel}, tudo bem?\nA mensalidade{do_aluno} referente a {mes} ({valor}) venceu em {vencimento} e ainda não aparece como paga.\n\nPix: {link}\n\nSe já pagou, pode desconsiderar. Obrigado!",
  ultimo: "Olá, {responsavel}. A mensalidade{do_aluno} de {mes} ({valor}) está com 7 dias de atraso. Consegue regularizar hoje?\n\nPix: {link}\n\nSe precisar combinar outra data, é só responder.",
  recibo: "Pagamento confirmado ✅\nRecebemos {valor} da mensalidade{do_aluno} referente a {mes}. Obrigado, {responsavel}!",
  aniversario: "Feliz aniversário, {aluno}! 🎉\nToda a equipe da {escola} deseja um dia incrível. Até a próxima aula!",
  boasvindas: "Seja bem-vindo(a) à {escola}, {responsavel}! 💪\nA matrícula{do_aluno} na turma {turma} está confirmada. Qualquer dúvida, é só chamar aqui.",
  falta: "Olá, {responsavel}! Registramos falta{do_aluno} na aula de {turma} hoje. Está tudo bem? Até a próxima aula!",
} as const;
export type ModeloKey = keyof typeof MODELOS;
export const MODELO_NOME: Record<ModeloKey, string> = {
  lembrete: "Lembrete (3 dias antes)", cobranca: "Cobrança (no dia)", atraso: "Atraso (3 dias depois)", ultimo: "Último aviso (7 dias depois)",
  recibo: "Recibo de pagamento", aniversario: "Aniversário", boasvindas: "Boas-vindas", falta: "Aviso de falta",
};

export type CtxMensagem = {
  escola: string;
  aluno?: { nome: string; responsavel?: string | null; turma?: string | null };
  valor?: number; referencia?: string; vencimento?: string; link?: string;
};

export function preenche(modelo: string, c: CtxMensagem) {
  const a = c.aluno;
  const map: Record<string, string> = {
    escola: c.escola,
    responsavel: a ? primeiroNome(a.responsavel || a.nome) : "",
    aluno: a ? primeiroNome(a.nome) : "",
    do_aluno: a?.responsavel ? " de " + primeiroNome(a.nome) : "",
    turma: a?.turma ?? "",
    valor: c.valor != null ? brl(c.valor) : "",
    mes: c.referencia ? MESES[Number(c.referencia.slice(5, 7)) - 1] : "",
    vencimento: c.vencimento ? dataBR(c.vencimento) : "",
    link: c.link ?? "",
  };
  return modelo.replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
}

export const modeloDe = (k: ModeloKey, custom?: Record<string, string> | null) => (custom?.[k]?.trim() ? custom[k] : MODELOS[k]);
export const waLink = (fone: string, texto: string) => `https://wa.me/${foneWa(fone)}?text=${encodeURIComponent(texto)}`;
