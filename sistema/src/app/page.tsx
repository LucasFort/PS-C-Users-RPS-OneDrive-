import Link from "next/link";
import { BarChart3, BellRing, CalendarCheck, CheckCircle2, MessageCircle, QrCode, Users, Wallet } from "lucide-react";
import Marca from "@/components/Marca";
import { SEGMENTOS } from "@/lib/segmentos";

const preco = process.env.PLANO_PRECO ?? "49";
const wa = process.env.NEXT_PUBLIC_WHATSAPP_VENDAS;
const waHref = wa ? `https://wa.me/${wa.replace(/\D/g, "")}?text=${encodeURIComponent("Oi! Vi o anúncio do Mensalidade em Dia e quero saber mais.")}` : null;

const RECURSOS = [
  { I: MessageCircle, t: "Cobrança no WhatsApp", d: "A mensagem sai pronta, com o valor e o link do Pix. Você toca em enviar." },
  { I: QrCode, t: "Pix com baixa automática", d: "Conecte o Mercado Pago e a mensalidade vira “paga” sozinha quando o Pix cai." },
  { I: BellRing, t: "Régua de cobrança", d: "Lembrete antes de vencer, no dia, 3 e 7 dias depois. O sistema separa quem precisa receber." },
  { I: Wallet, t: "Quem pagou e quem deve", d: "Uma tela com o mês inteiro: recebido, atrasado e a vencer." },
  { I: CalendarCheck, t: "Turmas e chamada", d: "Agenda da semana, presença em 2 toques e frequência de cada aluno." },
  { I: BarChart3, t: "Financeiro e lucro", d: "Lance as despesas e veja o lucro do mês e dos últimos 6 meses." },
];
const FAQ = [
  ["Preciso de cartão para testar?", "Não. Você usa 30 dias grátis sem cadastrar cartão. Só assina se gostar."],
  ["Meus alunos precisam baixar algum app?", "Não. Eles recebem a mensagem no WhatsApp e pagam pelo Pix do banco que já usam."],
  ["O dinheiro passa pelo sistema?", "Não. O Pix vai direto para a sua chave ou para a sua conta Mercado Pago. O sistema só organiza e confirma."],
  ["Já tenho os alunos numa planilha. Dá trabalho?", "Não. Você copia da planilha e cola no sistema: os alunos e as turmas são criados de uma vez."],
  ["Posso cancelar quando quiser?", "Pode. Sem fidelidade e sem multa. Seus dados continuam salvos."],
  ["Funciona no celular?", "Sim. Foi feito para usar no celular, e também funciona no computador."],
];

export default function Home() {
  return (
    <div className="bg-surface">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Marca />
        <nav className="flex items-center gap-2"><Link href="/entrar" className="btn-ghost btn-sm">Entrar</Link><Link href="/cadastro" className="btn-primary btn-sm hidden sm:inline-flex">Testar grátis</Link></nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-6 lg:grid-cols-[1.1fr_1fr] lg:pt-12">
        <div className="flex flex-col gap-5">
          <p className="eyebrow text-accent">Para escolinhas, academias e cursos</p>
          <h1 className="text-[40px] font-black leading-[1.02] sm:text-[56px] [font-stretch:80%]">Pare de cobrar mensalidade um por um no WhatsApp.</h1>
          <p className="max-w-xl text-lg text-muted">O Mensalidade em Dia prepara a cobrança com Pix, mostra quem pagou e quem deve, lembra quem atrasou e ainda faz a chamada das turmas. Tudo no celular.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/cadastro" className="btn-primary px-6 py-4 text-base">Testar 30 dias grátis</Link>
            {waHref && <a href={waHref} className="btn-ghost px-6 py-4 text-base" target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5" aria-hidden />Falar no WhatsApp</a>}
          </div>
          <p className="text-sm text-muted">Sem cartão de crédito · depois R$ {preco}/mês · cancele quando quiser</p>
        </div>
        <div className="mx-auto w-full max-w-[300px]">
          <div className="rounded-[38px] border-[10px] border-ink bg-ink shadow-2xl">
            <video className="aspect-[9/16] w-full rounded-[28px] bg-bg object-cover" src="/demo.mp4" poster="/demo-poster.jpg" autoPlay muted loop playsInline aria-label="Demonstração do sistema no celular" />
          </div>
        </div>
      </section>

      <section className="bg-bg">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-14 md:grid-cols-3">
          {[["Horas cobrando", "Mandar mensagem para cada aluno, todo mês, conferir extrato e anotar no caderno."], ["Dinheiro atrasado", "Com 80 alunos a R$150, se 20% atrasam, são R$2.400 parados todo mês."], ["Constrangimento", "Ninguém gosta de cobrar. Com a régua, a mensagem educada sai no dia certo."]].map(([t, d]) => (
            <div key={t} className="card flex flex-col gap-2 p-5"><h2 className="text-xl font-extrabold">{t}</h2><p className="text-muted">{d}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16">
        <div className="max-w-2xl"><p className="eyebrow">Como funciona</p><h2 className="text-[34px] font-black leading-tight [font-stretch:80%]">Em 3 passos você para de correr atrás de pagamento</h2></div>
        <ol className="grid gap-4 md:grid-cols-3">
          {[["Cole sua lista de alunos", "Copie da planilha ou cadastre um por um. As turmas são criadas junto."], ["Toque em cobrar", "A mensagem com o valor e o link do Pix abre no seu WhatsApp, pronta para enviar."], ["Acompanhe quem pagou", "Com o Mercado Pago conectado, a baixa é automática. Sem ele, você marca “Recebi” em 1 toque."]].map(([t, d], i) => (
            <li key={t} className="card flex flex-col gap-2 p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-accent font-display font-black text-accent-ink">{i + 1}</span><h3 className="text-lg font-extrabold">{t}</h3><p className="text-muted">{d}</p></li>
          ))}
        </ol>
      </section>

      <section className="bg-bg">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16">
          <div className="max-w-2xl"><p className="eyebrow">Tudo num lugar só</p><h2 className="text-[34px] font-black leading-tight [font-stretch:80%]">O que vem no sistema</h2></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RECURSOS.map(({ I, t, d }) => (
              <div key={t} className="card flex flex-col gap-2 p-5"><I className="h-7 w-7 text-accent" aria-hidden /><h3 className="text-lg font-extrabold">{t}</h3><p className="text-muted">{d}</p></div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-muted"><Users className="h-4 w-4" aria-hidden />Feito para:</span>
            {Object.values(SEGMENTOS).map((s) => <span key={s.nome} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm">{s.ex}</span>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 lg:grid-cols-2" id="preco">
        <div className="flex flex-col gap-3"><p className="eyebrow">Preço</p><h2 className="text-[34px] font-black leading-tight [font-stretch:80%]">Menos que uma mensalidade por mês</h2>
          <p className="text-lg text-muted">Se o sistema fizer um único aluno pagar em dia, ele já se pagou. O resto é tempo livre e dinheiro entrando na data certa.</p></div>
        <div className="card flex flex-col gap-3 border-2 border-accent p-6">
          <h3 className="text-xl font-extrabold">Plano Completo</h3>
          <div className="num font-display text-5xl font-black [font-stretch:75%]">R$ {preco}<small className="font-sans text-base font-semibold text-muted"> /mês</small></div>
          <ul className="flex flex-col gap-2">{["Alunos e turmas sem limite", "Cobrança no WhatsApp com Pix", "Baixa automática pelo Mercado Pago", "Régua de cobrança e comunicados", "Chamada, frequência e financeiro"].map((x) => <li key={x} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-ok" aria-hidden />{x}</li>)}</ul>
          <Link href="/cadastro" className="btn-primary py-4 text-base">Começar 30 dias grátis</Link>
          <p className="text-center text-xs text-muted">Sem cartão no teste · sem fidelidade</p>
        </div>
      </section>

      <section className="bg-bg">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-16">
          <h2 className="text-[34px] font-black leading-tight [font-stretch:80%]">Perguntas frequentes</h2>
          {FAQ.map(([q, a]) => (
            <details key={q} className="card group p-4"><summary className="cursor-pointer list-none font-bold marker:hidden">{q}<span className="float-right text-muted group-open:rotate-45">+</span></summary><p className="mt-2 text-muted">{a}</p></details>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center">
        <h2 className="text-[34px] font-black leading-tight [font-stretch:80%]">Comece hoje e cobre o mês que vem no automático</h2>
        <Link href="/cadastro" className="btn-primary px-8 py-4 text-base">Testar 30 dias grátis</Link>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted">
          <span>© {new Date().getFullYear()} Mensalidade em Dia</span>
          <nav className="flex gap-4"><Link href="/termos">Termos de uso</Link><Link href="/privacidade">Privacidade</Link>{waHref && <a href={waHref} target="_blank" rel="noopener noreferrer">Suporte</a>}</nav>
        </div>
      </footer>
      {waHref && <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp" className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-wa text-white shadow-lg"><MessageCircle className="h-7 w-7" aria-hidden /></a>}
    </div>
  );
}
