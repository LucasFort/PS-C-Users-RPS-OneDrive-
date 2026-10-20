import { headers } from "next/headers";
import Link from "next/link";
import Nav from "@/components/Nav";
import { acessoLiberado, diasDeTeste, getEscola } from "@/lib/escola";
import { SEGMENTOS, type Segmento } from "@/lib/segmentos";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { escola } = await getEscola();
  const path = headers().get("x-pathname") ?? "";
  const liberado = acessoLiberado(escola);
  const livre = path.startsWith("/app/assinatura") || path.startsWith("/app/ajustes");
  const dias = diasDeTeste(escola);
  return (
    <>
      <Nav escola={escola.nome} tipo={SEGMENTOS[escola.tipo as Segmento]?.nome ?? ""} />
      <div className="lg:pl-56">
      <header className="sticky top-0 z-10 border-b border-line bg-surface pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <small className="block text-[11px] font-semibold uppercase tracking-wider text-muted">Mensalidade em Dia</small>
            <strong className="block truncate font-display text-lg font-extrabold [font-stretch:85%]">{escola.nome}</strong>
          </div>
          {escola.plano_status !== "ativo" && liberado && (
            <Link href="/app/assinatura" className="pill flex-none bg-warn-bg px-3 py-1.5 text-warn">
              Teste grátis: {dias} {dias === 1 ? "dia" : "dias"}
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-28 pt-5 lg:pb-10">
        {liberado || livre ? children : (
          <div className="card mx-auto mt-6 flex max-w-md flex-col gap-3 p-6 text-center">
            <h1 className="text-2xl font-extrabold">Seu teste grátis terminou</h1>
            <p className="text-muted">Seus alunos e dados continuam salvos. Assine para continuar cobrando pelo WhatsApp.</p>
            <Link href="/app/assinatura" className="btn-primary">Assinar por R$ {process.env.PLANO_PRECO ?? "49"}/mês</Link>
          </div>
        )}
      </main>
      </div>
    </>
  );
}
