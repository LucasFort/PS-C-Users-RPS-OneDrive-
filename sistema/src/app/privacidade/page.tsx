import type { Metadata } from "next";
import Marca from "@/components/Marca";
export const metadata: Metadata = { title: "Política de privacidade" };
export default function Privacidade() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-extrabold [&_p]:text-muted">
      <Marca />
      <h1 className="text-3xl font-black">Política de privacidade</h1>
      <p>Última atualização: outubro de 2026. Esta política segue a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
      <h2>Quais dados tratamos</h2><p>Dados da conta (nome da escola, e-mail, WhatsApp e cidade) e os dados que a escola cadastra sobre seus alunos (nome, responsável, WhatsApp, data de nascimento, turma, mensalidades e presença).</p>
      <h2>Para que usamos</h2><p>Exclusivamente para prestar o serviço: organizar cobranças, gerar páginas de pagamento, registrar presença e mostrar relatórios para a própria escola. Não vendemos nem compartilhamos dados para publicidade.</p>
      <h2>Papéis</h2><p>A escola é a controladora dos dados dos seus alunos; o Mensalidade em Dia atua como operador, tratando esses dados conforme as instruções da escola.</p>
      <h2>Segurança</h2><p>Os dados ficam em banco de dados com acesso restrito por escola. Tokens de pagamento ficam guardados apenas no servidor. A comunicação é sempre criptografada (HTTPS).</p>
      <h2>Seus direitos</h2><p>A escola pode corrigir ou excluir dados a qualquer momento pelo próprio sistema, ou pedir a exclusão completa da conta pelo suporte.</p>
    </main>
  );
}
