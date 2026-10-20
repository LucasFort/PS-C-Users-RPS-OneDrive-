"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Users, CalendarCheck, BarChart3, Menu } from "lucide-react";

const ITENS = [
  { href: "/app", label: "Início", icon: Home, exato: true },
  { href: "/app/cobrancas", label: "Cobranças", icon: Wallet },
  { href: "/app/alunos", label: "Alunos", icon: Users },
  { href: "/app/turmas", label: "Turmas", icon: CalendarCheck },
  { href: "/app/financeiro", label: "Financeiro", icon: BarChart3 },
  { href: "/app/mais", label: "Mais", icon: Menu },
];
const MAIS = ["/app/mais", "/app/automacoes", "/app/comunicados", "/app/envios", "/app/ajustes", "/app/assinatura"];

export default function Nav({ escola, tipo }: { escola: string; tipo: string }) {
  const p = usePathname();
  const ativo = (h: string, exato?: boolean) => (exato ? p === h : h === "/app/mais" ? MAIS.some((m) => p.startsWith(m)) : p.startsWith(h));
  return (
    <nav aria-label="Seções" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:inset-y-0 lg:right-auto lg:w-56 lg:border-r lg:border-t-0 lg:pb-0">
      <div className="hidden px-5 pb-4 pt-6 lg:block">
        <b className="block font-display text-xl font-black text-accent [font-stretch:85%]">Mensalidade em Dia</b>
        <span className="block truncate text-xs text-muted">{escola}</span>
        <span className="block text-[11px] text-muted">{tipo}</span>
      </div>
      <div className="grid grid-cols-6 lg:flex lg:flex-col lg:gap-1 lg:px-3">
        {ITENS.map(({ href, label, icon: Icon, exato }) => {
          const on = ativo(href, exato);
          return (
            <Link key={href} href={href} aria-current={on ? "page" : undefined}
              className={`flex flex-col items-center gap-1 px-0.5 pb-2.5 pt-2 text-[10.5px] font-semibold lg:flex-row lg:gap-3 lg:rounded-lg lg:px-3 lg:py-2.5 lg:text-[15px] ${on ? "text-accent lg:bg-accent-soft" : "text-muted hover:text-ink"}`}>
              <Icon className="h-[22px] w-[22px] flex-none" aria-hidden />{label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
