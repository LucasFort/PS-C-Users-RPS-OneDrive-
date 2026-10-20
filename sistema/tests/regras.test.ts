import { test } from "node:test";
import assert from "node:assert/strict";
import { crc16, pixCopiaECola } from "../src/lib/pix";
import { diasEntre, hojeISO, situacao, somaMeses } from "../src/lib/datas";
import { foneWa, foneBonito } from "../src/lib/format";
import { preenche, MODELOS } from "../src/lib/mensagens";
import { mensagemCobranca, reguaDoDia } from "../src/lib/cobranca";

test("Pix: CRC do exemplo oficial do Banco Central", () => {
  const ex = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304";
  assert.equal(crc16(ex), "1D3D");
  assert.equal(pixCopiaECola({ chave: "123e4567-e12b-12d1-a456-426655440000", nome: "Fulano de Tal", cidade: "BRASILIA" }), ex + "1D3D");
});

test("Pix: valor com 2 casas, nome sem acento e limitado", () => {
  const c = pixCopiaECola({ chave: "a@b.com", nome: "Escolinha São João da Bola de Ouro", cidade: "São Paulo", valor: 150 });
  assert.match(c, /5406150\.00/);
  assert.match(c, /5925Escolinha Sao Joao da Bol/);
  assert.match(c, /6009Sao Paulo/);
  assert.equal(c.slice(-4), crc16(c.slice(0, -4)));
});

test("Datas: situação da mensalidade", () => {
  const hoje = "2026-10-20";
  assert.equal(situacao({ status: "aberta", vencimento: "2026-10-10" }, hoje).k, "atrasada");
  assert.equal(situacao({ status: "aberta", vencimento: "2026-10-10" }, hoje).dias, 10);
  assert.equal(situacao({ status: "aberta", vencimento: "2026-10-20" }, hoje).texto, "Vence hoje");
  assert.equal(situacao({ status: "aberta", vencimento: "2026-10-22" }, hoje).k, "vence");
  assert.equal(situacao({ status: "aberta", vencimento: "2026-10-30" }, hoje).k, "aberta");
  assert.equal(situacao({ status: "paga", vencimento: "2026-10-01" }, hoje).k, "paga");
  assert.equal(somaMeses("2026-12", 1), "2027-01");
  assert.equal(somaMeses("2026-01", -1), "2025-12");
  assert.equal(diasEntre("2026-02-27", "2026-03-01"), 2);
  assert.match(hojeISO(new Date("2026-10-21T02:30:00Z")), /2026-10-20/); // 23h30 em SP ainda é dia 20
});

test("Telefone para WhatsApp", () => {
  assert.equal(foneWa("(11) 98765-4321"), "5511987654321");
  assert.equal(foneWa("5511987654321"), "5511987654321");
  assert.equal(foneBonito("11987654321"), "(11) 98765-4321");
});

test("Mensagem: criança fala com o responsável, adulto direto", () => {
  const crianca = preenche(MODELOS.cobranca, { escola: "Bola de Ouro", aluno: { nome: "Miguel Santos", responsavel: "Patrícia Santos" }, valor: 150, referencia: "2026-10", vencimento: "2026-10-20", link: "https://x/p/1" });
  assert.match(crianca, /^Olá, Patrícia! Hoje vence a mensalidade de Miguel referente a outubro: R\$\s?150,00/);
  assert.match(crianca, /https:\/\/x\/p\/1/);
  const adulto = preenche(MODELOS.cobranca, { escola: "X", aluno: { nome: "Rafael Lima", responsavel: null }, valor: 99, referencia: "2026-10", vencimento: "2026-10-20" });
  assert.match(adulto, /^Olá, Rafael! Hoje vence a mensalidade referente a outubro/);
});

const esc = { nome: "Bola de Ouro", modelos: {}, auto: { lembrete: true, cobranca: true, atraso: true, ultimo: true, aniversario: true } };
const m = (venc: string, status: "aberta" | "paga" = "aberta") => ({ id: venc, aluno_id: "a" + venc, referencia: venc.slice(0, 7), valor: 150, vencimento: venc, status, pago_em: null, forma: null, token: "t".repeat(24),
  aluno: { id: "a" + venc, nome: "Miguel Santos", responsavel: "Patrícia", whatsapp: "11987654321", nascimento: null, turma: { nome: "Sub-9" } } });

test("Cobrança: escolhe o modelo pela situação", () => {
  const hoje = "2026-10-20";
  assert.equal(mensagemCobranca(esc, m("2026-10-23"), hoje).k, "lembrete");
  assert.equal(mensagemCobranca(esc, m("2026-10-20"), hoje).k, "cobranca");
  assert.equal(mensagemCobranca(esc, m("2026-10-15"), hoje).k, "atraso");
  assert.equal(mensagemCobranca(esc, m("2026-10-10"), hoje).k, "ultimo");
  assert.match(mensagemCobranca(esc, m("2026-10-20"), hoje).href, /^https:\/\/wa\.me\/5511987654321\?text=/);
});

test("Régua: só os dias certos, respeita o que está desligado e ignora pagas", () => {
  const hoje = "2026-10-20";
  const mens = [m("2026-10-23"), m("2026-10-20"), m("2026-10-17"), m("2026-10-13"), m("2026-10-19"), m("2026-10-20", "paga")];
  const alunos = [{ id: "x", nome: "Ana Lima", responsavel: null, whatsapp: "11911112222", nascimento: "2015-10-20", ativo: true, turma: null }];
  const r = reguaDoDia(esc, mens, alunos, hoje);
  assert.deepEqual(r.map((i) => i.k).sort(), ["aniversario", "atraso", "cobranca", "lembrete", "ultimo"]);
  const semAtraso = reguaDoDia({ ...esc, auto: { ...esc.auto, atraso: false } }, mens, alunos, hoje);
  assert.ok(!semAtraso.some((i) => i.k === "atraso"));
});
