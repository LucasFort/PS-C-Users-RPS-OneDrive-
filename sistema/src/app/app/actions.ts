"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getEscola } from "@/lib/escola";
import { createClient } from "@/lib/supabase/server";
import { MODELOS } from "@/lib/mensagens";
import { refAtual } from "@/lib/datas";

const num = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(/\./g, "").replace(",", ".")) || 0;
const txt = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const tudo = () => revalidatePath("/app", "layout");

export async function marcarPaga(id: string, forma: "pix" | "dinheiro" | "cartao") {
  const { supabase, escola } = await getEscola();
  const { data } = await supabase.from("mensalidades").update({ status: "paga", pago_em: new Date().toISOString(), forma })
    .eq("id", id).eq("escola_id", escola.id).eq("status", "aberta").select("aluno_id,valor").maybeSingle();
  if (data) await supabase.from("envios").insert({ escola_id: escola.id, aluno_id: data.aluno_id, tipo: "pagamento", descricao: `Pagamento registrado (${forma}) · R$ ${Number(data.valor).toFixed(2).replace(".", ",")}` });
  tudo();
}

export async function desfazerPagamento(id: string) {
  const { supabase, escola } = await getEscola();
  await supabase.from("mensalidades").update({ status: "aberta", pago_em: null, forma: null }).eq("id", id).eq("escola_id", escola.id);
  tudo();
}

export async function registrarEnvio(alunoId: string | null, tipo: string, descricao: string) {
  const { supabase, escola } = await getEscola();
  await supabase.from("envios").insert({ escola_id: escola.id, aluno_id: alunoId, tipo, descricao: descricao.slice(0, 200) });
}

export async function salvarAluno(fd: FormData) {
  const { supabase, escola } = await getEscola();
  const id = txt(fd.get("id"));
  const row = {
    escola_id: escola.id, nome: txt(fd.get("nome")), responsavel: txt(fd.get("responsavel")) || null, whatsapp: txt(fd.get("whatsapp")),
    turma_id: txt(fd.get("turma_id")) || null, valor: num(fd.get("valor")), dia_vencimento: Math.min(31, Math.max(1, num(fd.get("dia_vencimento")) || 10)),
    nascimento: txt(fd.get("nascimento")) || null,
  };
  if (!row.nome || !row.whatsapp || !row.valor) throw new Error("Preencha nome, WhatsApp e mensalidade.");
  if (id) {
    await supabase.from("alunos").update(row).eq("id", id).eq("escola_id", escola.id);
    // Mensalidade do mês ainda em aberto acompanha o novo valor/vencimento (o link de pagamento continua o mesmo)
    const ref = refAtual(); const [y, m] = ref.split("-").map(Number); const ult = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const venc = `${ref}-${String(Math.min(row.dia_vencimento, ult)).padStart(2, "0")}`;
    await supabase.from("mensalidades").update({ valor: row.valor, vencimento: venc }).eq("aluno_id", id).eq("referencia", ref).eq("status", "aberta");
  } else {
    const { data } = await supabase.from("alunos").insert(row).select("id").single();
    if (data) await supabase.from("envios").insert({ escola_id: escola.id, aluno_id: data.id, tipo: "cadastro", descricao: "Aluno cadastrado" });
  }
  await supabase.rpc("gerar_mensalidades", { p_escola: escola.id, p_ref: refAtual() });
  tudo();
  redirect(id ? `/app/alunos/${id}` : "/app/alunos?novo=1");
}

export async function alternarAtivo(id: string, ativo: boolean) {
  const { supabase, escola } = await getEscola();
  await supabase.from("alunos").update({ ativo }).eq("id", id).eq("escola_id", escola.id);
  if (!ativo) await supabase.from("mensalidades").update({ status: "cancelada" }).eq("aluno_id", id).eq("referencia", refAtual()).eq("status", "aberta");
  else { await supabase.from("mensalidades").update({ status: "aberta" }).eq("aluno_id", id).eq("referencia", refAtual()).eq("status", "cancelada"); await supabase.rpc("gerar_mensalidades", { p_escola: escola.id, p_ref: refAtual() }); }
  tudo();
}

export async function excluirAluno(id: string) {
  const { supabase, escola } = await getEscola();
  await supabase.from("alunos").delete().eq("id", id).eq("escola_id", escola.id);
  tudo(); redirect("/app/alunos");
}

/** Linhas: Nome; Responsável; WhatsApp; Valor; Dia; Turma (separador ; ou tab) */
export async function importarAlunos(_: unknown, fd: FormData): Promise<{ ok: number; erros: string[] }> {
  const { supabase, escola } = await getEscola();
  const { data: turmas } = await supabase.from("turmas").select("id,nome,valor").eq("escola_id", escola.id);
  const porNome = new Map((turmas ?? []).map((t) => [t.nome.toLowerCase(), t]));
  const linhas = txt(fd.get("lista")).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const erros: string[] = []; const rows: Record<string, unknown>[] = [];
  for (const [i, l] of linhas.entries()) {
    const c = l.split(/\t|;/).map((x) => x.trim());
    if (i === 0 && /nome/i.test(c[0] ?? "") && /whats|telefone|fone/i.test(l)) continue;
    const [nome, resp, fone, valor, dia, turmaNome] = c;
    let turma = turmaNome ? porNome.get(turmaNome.toLowerCase()) : undefined;
    if (turmaNome && !turma) {
      const { data } = await supabase.from("turmas").insert({ escola_id: escola.id, nome: turmaNome, valor: num(valor ?? "") }).select("id,nome,valor").single();
      if (data) { turma = data; porNome.set(turmaNome.toLowerCase(), data); }
    }
    const v = num(valor ?? "") || Number(turma?.valor ?? 0);
    if (!nome || !fone || String(fone).replace(/\D/g, "").length < 10 || !v) { erros.push(`Linha ${i + 1}: confira nome, WhatsApp e valor (“${l.slice(0, 60)}”)`); continue; }
    rows.push({ escola_id: escola.id, nome, responsavel: resp || null, whatsapp: fone, valor: v, dia_vencimento: Math.min(31, Math.max(1, num(dia ?? "") || 10)), turma_id: turma?.id ?? null });
  }
  if (rows.length) await supabase.from("alunos").insert(rows);
  await supabase.rpc("gerar_mensalidades", { p_escola: escola.id, p_ref: refAtual() });
  tudo();
  return { ok: rows.length, erros };
}

export async function salvarTurma(fd: FormData) {
  const { supabase, escola } = await getEscola();
  const id = txt(fd.get("id"));
  const row = { escola_id: escola.id, nome: txt(fd.get("nome")), dias: fd.getAll("dias").map(Number).sort(), hora: txt(fd.get("hora")) || "18:00", professor: txt(fd.get("professor")) || null, valor: num(fd.get("valor")), vagas: num(fd.get("vagas")) || 20 };
  if (!row.nome) throw new Error("Dê um nome para a turma.");
  if (id) await supabase.from("turmas").update(row).eq("id", id).eq("escola_id", escola.id);
  else await supabase.from("turmas").insert(row);
  tudo(); redirect("/app/turmas");
}

export async function excluirTurma(id: string) {
  const { supabase, escola } = await getEscola();
  await supabase.from("turmas").delete().eq("id", id).eq("escola_id", escola.id);
  tudo(); redirect("/app/turmas");
}

export async function salvarChamada(turmaId: string, data: string, presencas: Record<string, boolean>) {
  const { supabase, escola } = await getEscola();
  await supabase.from("chamadas").upsert({ escola_id: escola.id, turma_id: turmaId, data, presencas }, { onConflict: "turma_id,data" });
  const faltas = Object.values(presencas).filter((v) => !v).length;
  await supabase.from("envios").insert({ escola_id: escola.id, tipo: "chamada", descricao: `Chamada salva: ${Object.keys(presencas).length - faltas} presentes, ${faltas} faltas` });
  tudo();
}

export async function salvarDespesa(fd: FormData) {
  const { supabase, escola } = await getEscola();
  const row = { escola_id: escola.id, descricao: txt(fd.get("descricao")), categoria: txt(fd.get("categoria")) || "Outros", valor: num(fd.get("valor")), referencia: txt(fd.get("referencia")) || refAtual() };
  if (!row.descricao || !row.valor) throw new Error("Preencha descrição e valor.");
  await supabase.from("despesas").insert(row);
  tudo();
}

export async function excluirDespesa(id: string) {
  const { supabase, escola } = await getEscola();
  await supabase.from("despesas").delete().eq("id", id).eq("escola_id", escola.id);
  tudo();
}

export async function salvarAjustes(fd: FormData) {
  const { supabase, escola } = await getEscola();
  await supabase.from("escolas").update({
    nome: txt(fd.get("nome")) || escola.nome, tipo: txt(fd.get("tipo")) || escola.tipo, whatsapp: txt(fd.get("whatsapp")) || null,
    cidade: txt(fd.get("cidade")) || null, chave_pix: txt(fd.get("chave_pix")) || null, nome_pix: txt(fd.get("nome_pix")) || null,
  }).eq("id", escola.id);
  tudo(); redirect("/app/ajustes?salvo=1");
}

export async function salvarModelos(fd: FormData) {
  const { supabase, escola } = await getEscola();
  const modelos: Record<string, string> = {};
  for (const k of Object.keys(MODELOS)) { const v = txt(fd.get(k)); if (v && v !== MODELOS[k as keyof typeof MODELOS]) modelos[k] = v; }
  await supabase.from("escolas").update({ modelos }).eq("id", escola.id);
  tudo(); redirect("/app/ajustes?salvo=1#mensagens");
}

export async function salvarMpToken(fd: FormData) {
  const { supabase, escola } = await getEscola();
  const token = txt(fd.get("mp_token"));
  if (token && !/^APP_USR-/.test(token)) redirect("/app/ajustes?erro=token#mercadopago");
  await supabase.rpc("salvar_mp_token", { p_escola: escola.id, p_token: token });
  tudo(); redirect("/app/ajustes?salvo=1#mercadopago");
}

export async function alternarAuto(k: string) {
  const { supabase, escola } = await getEscola();
  const auto = { ...escola.auto, [k]: !escola.auto?.[k] };
  await supabase.from("escolas").update({ auto }).eq("id", escola.id);
  tudo();
}

export async function sair() {
  await createClient().auth.signOut();
  redirect("/entrar");
}
