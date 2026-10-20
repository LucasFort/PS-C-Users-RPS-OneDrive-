import { getEscola, diasDeTeste, acessoLiberado } from "@/lib/escola";
import { Note, PageHead } from "@/components/ui";

const preco = process.env.PLANO_PRECO ?? "49";

export default async function Assinatura({ searchParams }: { searchParams: { volta?: string; erro?: string } }) {
  const { escola } = await getEscola();
  const dias = diasDeTeste(escola);
  const status = escola.plano_status === "ativo" ? "Assinatura ativa" : acessoLiberado(escola) ? `Teste grátis: faltam ${dias} ${dias === 1 ? "dia" : "dias"}` : "Teste encerrado";
  return (
    <>
      <PageHead eyebrow="Mais" title="Assinatura" sub={status} />
      {searchParams.volta && escola.plano_status !== "ativo" && <Note><b>Recebemos seu retorno do Mercado Pago.</b> A confirmação pode levar alguns minutos; atualize esta página em seguida.</Note>}
      {searchParams.erro && <p className="rounded-lg bg-bad-bg px-3 py-2.5 text-sm text-bad">Não foi possível abrir o pagamento agora. Tente de novo em alguns minutos ou fale com o suporte.</p>}
      <section className="card flex max-w-xl flex-col gap-3 border-2 border-accent p-5">
        <div className="flex items-baseline justify-between"><h2 className="text-xl font-extrabold">Plano Completo</h2>{escola.plano_status === "ativo" && <span className="pill bg-ok-bg text-ok">Ativo</span>}</div>
        <div className="num font-display text-4xl font-black [font-stretch:75%]">R$ {preco}<small className="font-sans text-sm font-semibold text-muted"> /mês</small></div>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Alunos e turmas sem limite</li><li>Cobrança no WhatsApp com 1 toque e link de Pix</li><li>Baixa automática pelo Mercado Pago</li>
          <li>Régua de cobrança, aniversários e comunicados</li><li>Chamada, frequência e financeiro com lucro do mês</li>
        </ul>
        {escola.plano_status === "ativo" ? (
          <p className="text-sm text-muted">Para trocar o cartão ou cancelar, acesse <b>mercadopago.com.br → Assinaturas</b>. Seus dados continuam salvos.</p>
        ) : (
          <form action="/api/assinatura" method="post"><button className="btn-primary w-full">Assinar por R$ {preco}/mês</button></form>
        )}
        <p className="text-xs text-muted">Pagamento recorrente pelo Mercado Pago (cartão de crédito). Sem fidelidade: cancele quando quiser.</p>
      </section>
    </>
  );
}
