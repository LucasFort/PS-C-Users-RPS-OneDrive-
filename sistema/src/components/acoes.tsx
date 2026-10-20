"use client";
import { useState, useTransition } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { desfazerPagamento, marcarPaga, registrarEnvio } from "@/app/app/actions";

export function WhatsAppButton({ href, alunoId, tipo, descricao, children = "WhatsApp", className = "btn-wa btn-sm", onSent }:
  { href: string; alunoId: string | null; tipo: string; descricao: string; children?: React.ReactNode; className?: string; onSent?: () => void }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}
      onClick={() => { registrarEnvio(alunoId, tipo, descricao).catch(() => {}); onSent?.(); }}>
      <MessageCircle className="h-4 w-4" aria-hidden />{children}
    </a>
  );
}

export function CopyButton({ texto, children = "Copiar", className = "btn-ghost btn-sm" }: { texto: string; children?: React.ReactNode; className?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className={className} onClick={async () => {
      try { await navigator.clipboard.writeText(texto); } catch {
        const t = document.createElement("textarea"); t.value = texto; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
      }
      setOk(true); setTimeout(() => setOk(false), 1800);
    }}>
      {ok ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}{ok ? "Copiado" : children}
    </button>
  );
}

export function MarcarPaga({ id }: { id: string }) {
  const [aberto, setAberto] = useState(false);
  const [pend, start] = useTransition();
  if (!aberto) return <button type="button" className="btn-ghost btn-sm" onClick={() => setAberto(true)}>Recebi</button>;
  return (
    <span className="inline-flex flex-wrap gap-1.5" role="group" aria-label="Como recebeu">
      {(["pix", "dinheiro", "cartao"] as const).map((f) => (
        <button key={f} type="button" disabled={pend} className="btn-ghost btn-sm" onClick={() => start(() => marcarPaga(id, f))}>
          {f === "pix" ? "Pix" : f === "dinheiro" ? "Dinheiro" : "Cartão"}
        </button>
      ))}
      <button type="button" className="btn-sm text-muted" onClick={() => setAberto(false)}>Cancelar</button>
    </span>
  );
}

export function Desfazer({ id }: { id: string }) {
  const [pend, start] = useTransition();
  return <button type="button" disabled={pend} className="btn-sm text-muted underline" onClick={() => start(() => desfazerPagamento(id))}>Desfazer</button>;
}

export function Confirmar({ acao, children, confirmar = "Confirmar", className = "btn-danger btn-sm" }: { acao: () => Promise<void>; children: React.ReactNode; confirmar?: string; className?: string }) {
  const [p, setP] = useState(false); const [pend, start] = useTransition();
  return p
    ? <span className="inline-flex gap-1.5"><button type="button" disabled={pend} className={className} onClick={() => start(() => acao())}>{confirmar}</button><button type="button" className="btn-ghost btn-sm" onClick={() => setP(false)}>Cancelar</button></span>
    : <button type="button" className={className} onClick={() => setP(true)}>{children}</button>;
}

export function AcaoServidor({ acao, children, className = "btn-ghost btn-sm" }: { acao: () => Promise<void>; children: React.ReactNode; className?: string }) {
  const [pend, start] = useTransition();
  return <button type="button" disabled={pend} className={className} onClick={() => start(() => acao())}>{children}</button>;
}
