import Link from "next/link";
import { ChevronRight, CreditCard, History, Megaphone, Settings, Zap } from "lucide-react";
import { getEscola } from "@/lib/escola";
import { PageHead } from "@/components/ui";
import { sair } from "../actions";

const ITENS = [
  { href: "/app/automacoes", t: "Régua de cobrança", d: "Lembretes, atrasos e aniversários do dia", I: Zap },
  { href: "/app/comunicados", t: "Comunicados", d: "Avise todos os alunos ou uma turma", I: Megaphone },
  { href: "/app/envios", t: "Histórico", d: "Tudo que foi enviado e registrado", I: History },
  { href: "/app/ajustes", t: "Ajustes", d: "Escola, chave Pix, Mercado Pago e mensagens", I: Settings },
  { href: "/app/assinatura", t: "Assinatura", d: "Seu plano e pagamento", I: CreditCard },
];

export default async function Mais() {
  const { escola, user } = await getEscola();
  return (
    <>
      <PageHead title="Mais" sub={`${escola.nome} · ${user.email}`} />
      <div className="card overflow-hidden">
        {ITENS.map(({ href, t, d, I }) => (
          <Link key={href} href={href} className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0 hover:bg-bg">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-soft text-accent"><I className="h-5 w-5" aria-hidden /></span>
            <span className="flex min-w-0 flex-1 flex-col"><b className="font-semibold">{t}</b><span className="truncate text-[13px] text-muted">{d}</span></span>
            <ChevronRight className="h-5 w-5 text-muted" aria-hidden />
          </Link>
        ))}
      </div>
      <form action={sair}><button className="btn-ghost w-full">Sair da conta</button></form>
    </>
  );
}
