import Link from "next/link";
import type { ReactNode } from "react";
import type { SituacaoKey } from "@/lib/datas";

export function PageHead({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="text-[28px] font-extrabold leading-tight">{title}</h1>
        {sub && <p className="mt-1 text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const PILL: Record<SituacaoKey | "inativo", string> = {
  paga: "bg-ok-bg text-ok", atrasada: "bg-bad-bg text-bad", vence: "bg-warn-bg text-warn", aberta: "bg-bg text-muted", cancelada: "bg-bg text-muted", inativo: "bg-bg text-muted",
};
export const Pill = ({ k, children }: { k: SituacaoKey | "inativo"; children: ReactNode }) => <span className={`pill ${PILL[k]}`}>{children}</span>;

export function Tile({ label, value, tone }: { label: string; value: ReactNode; tone?: "ok" | "bad" | "warn" }) {
  const c = tone === "ok" ? "text-ok" : tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : "";
  return (
    <div className="card flex min-w-0 flex-col gap-0.5 p-3">
      <b className={`num truncate font-display text-xl font-extrabold [font-stretch:80%] ${c}`}>{value}</b>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export function Avatar({ nome, apagado }: { nome: string; apagado?: boolean }) {
  const p = nome.trim().split(/\s+/);
  const ini = ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
  return <span className={`grid h-9 w-9 flex-none place-items-center rounded-full font-display text-sm font-extrabold ${apagado ? "bg-bg text-muted" : "bg-accent-soft text-accent"}`}>{ini}</span>;
}

export const Empty = ({ children }: { children: ReactNode }) => <p className="px-4 py-6 text-center text-muted">{children}</p>;

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3"><h2 className="text-[19px] font-extrabold">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

export const TextLink = ({ href, children }: { href: string; children: ReactNode }) => <Link href={href} className="text-sm font-bold text-accent">{children}</Link>;

export function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-lg bg-bg px-3 py-2.5 text-[13px] text-muted [&_b]:text-ink">{children}</p>;
}

export function Meter({ pct, tone }: { pct: number; tone?: "warn" | "bad" }) {
  const c = tone === "warn" ? "bg-warn" : tone === "bad" ? "bg-bad" : "bg-accent";
  return <div className="h-2 overflow-hidden rounded-full bg-bg"><i className={`block h-full rounded-full ${c}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} /></div>;
}
