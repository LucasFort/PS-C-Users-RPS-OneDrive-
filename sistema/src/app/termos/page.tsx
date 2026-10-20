import type { Metadata } from "next";
import Marca from "@/components/Marca";
export const metadata: Metadata = { title: "Termos de uso" };
export default function Termos() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-extrabold [&_p]:text-muted">
      <Marca />
      <h1 className="text-3xl font-black">Termos de uso</h1>
      <p>Última atualização: outubro de 2026.</p>
      <h2>1. O serviço</h2><p>O Mensalidade em Dia é um sistema online para escolas, academias e professores organizarem alunos, turmas e cobranças de mensalidade. O sistema prepara mensagens e páginas de pagamento; os pagamentos vão direto para a chave Pix ou para a conta Mercado Pago do cliente.</p>
      <h2>2. Teste e assinatura</h2><p>Novas contas têm 30 dias grátis. Depois, o uso depende da assinatura mensal, cobrada de forma recorrente pelo Mercado Pago. O cancelamento pode ser feito a qualquer momento e vale para o ciclo seguinte.</p>
      <h2>3. Responsabilidades do cliente</h2><p>O cliente é responsável pelos dados cadastrados, por ter autorização para contatar seus alunos e responsáveis pelo WhatsApp e pelo conteúdo das mensagens enviadas. O envio pelo WhatsApp é feito pelo próprio cliente, a partir do aparelho dele.</p>
      <h2>4. Disponibilidade</h2><p>Buscamos manter o sistema disponível o tempo todo, mas podem ocorrer interrupções para manutenção ou por falhas de terceiros (provedores de hospedagem, WhatsApp, bancos e Mercado Pago).</p>
      <h2>5. Contato</h2><p>Dúvidas sobre estes termos podem ser enviadas pelo canal de suporte informado no site.</p>
    </main>
  );
}
