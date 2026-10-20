import { getEscola } from "@/lib/escola";
import { MODELOS, MODELO_NOME, type ModeloKey } from "@/lib/mensagens";
import { SEGMENTOS } from "@/lib/segmentos";
import { Note, PageHead } from "@/components/ui";
import { salvarAjustes, salvarModelos, salvarMpToken } from "../actions";

export default async function Ajustes({ searchParams }: { searchParams: { salvo?: string; erro?: string } }) {
  const { supabase, escola } = await getEscola();
  const { data: temMp } = await supabase.rpc("tem_mp_token", { p_escola: escola.id });
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return (
    <>
      <PageHead eyebrow="Mais" title="Ajustes" sub="Dados da escola, Pix e textos das mensagens." />
      {searchParams.salvo && <Note><b>Salvo.</b></Note>}
      {searchParams.erro === "token" && <p className="rounded-lg bg-bad-bg px-3 py-2.5 text-sm text-bad">Esse não parece um token de produção do Mercado Pago. Ele começa com <b>APP_USR-</b>.</p>}
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <form action={salvarAjustes} className="card flex flex-col gap-3 p-4">
          <h2 className="text-[19px] font-extrabold">Escola e Pix</h2>
          <label className="label">Nome da escola<input className="field" name="nome" required defaultValue={escola.nome} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="label">Tipo<select className="field" name="tipo" defaultValue={escola.tipo}>{Object.entries(SEGMENTOS).map(([k, s]) => <option key={k} value={k}>{s.nome}</option>)}</select></label>
            <label className="label">Cidade<input className="field" name="cidade" defaultValue={escola.cidade ?? ""} /></label>
          </div>
          <label className="label">WhatsApp da escola<input className="field num" name="whatsapp" inputMode="tel" defaultValue={escola.whatsapp ?? ""} /></label>
          <label className="label">Chave Pix<input className="field" name="chave_pix" defaultValue={escola.chave_pix ?? ""} placeholder="E-mail, CPF/CNPJ, aleatória ou +5511999998888" />
            <span className="text-xs font-normal">Usada na página de pagamento quando o Mercado Pago não está conectado.</span></label>
          <label className="label">Nome que aparece no Pix<input className="field" name="nome_pix" defaultValue={escola.nome_pix ?? escola.nome} /></label>
          <button className="btn-primary">Salvar</button>
        </form>
        <form action={salvarMpToken} id="mercadopago" className="card flex flex-col gap-3 p-4">
          <h2 className="text-[19px] font-extrabold">Mercado Pago (baixa automática)</h2>
          <p className="text-sm text-muted">Conecte a conta Mercado Pago da escola para o Pix ser <b className="text-ink">confirmado sozinho</b>: quando o aluno paga, a mensalidade vira “paga” e o recibo fica registrado.</p>
          <Note>{temMp ? <><b>Conectado.</b> Os pagamentos já dão baixa automática.</> : <><b>Não conectado.</b> A página de pagamento usa a sua chave Pix e você marca “Recebi” na mão.</>}</Note>
          <label className="label">Access Token de produção<input className="field font-mono text-[13px]" name="mp_token" type="password" autoComplete="off" placeholder={temMp ? "•••••••• (salvo). Cole outro para trocar" : "APP_USR-..."} /></label>
          <details className="text-[13px] text-muted"><summary className="cursor-pointer font-bold text-accent">Onde encontro o token?</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5"><li>Entre em mercadopago.com.br/developers com a conta da escola.</li><li>“Suas integrações” → Criar aplicação (pagamentos online, Pix).</li><li>Em “Credenciais de produção”, copie o <b>Access Token</b> e cole aqui.</li></ol>
          </details>
          <div className="flex gap-2"><button className="btn-primary flex-1">{temMp ? "Trocar token" : "Conectar"}</button>{temMp && <button name="mp_token" value="" className="btn-ghost">Desconectar</button>}</div>
          <p className="text-xs text-muted">O token fica guardado só no servidor e não aparece mais aqui depois de salvo. Avisos de pagamento: <span className="break-all font-mono">{site}/api/webhooks/mercadopago</span></p>
        </form>
      </div>
      <form action={salvarModelos} id="mensagens" className="card flex flex-col gap-3 p-4">
        <h2 className="text-[19px] font-extrabold">Textos das mensagens</h2>
        <Note>Use <b>{"{responsavel}"}</b>, <b>{"{aluno}"}</b>, <b>{"{do_aluno}"}</b>, <b>{"{turma}"}</b>, <b>{"{escola}"}</b>, <b>{"{mes}"}</b>, <b>{"{valor}"}</b>, <b>{"{vencimento}"}</b> e <b>{"{link}"}</b> (página de pagamento). Para alunos adultos (sem responsável), a mensagem fala direto com o aluno.</Note>
        <div className="grid gap-3 lg:grid-cols-2">
          {(Object.keys(MODELOS) as ModeloKey[]).map((k) => <label key={k} className="label">{MODELO_NOME[k]}<textarea className="field min-h-[120px] text-sm" name={k} defaultValue={escola.modelos?.[k] || MODELOS[k]} /></label>)}
        </div>
        <button className="btn-primary self-start">Salvar textos</button>
      </form>
    </>
  );
}
