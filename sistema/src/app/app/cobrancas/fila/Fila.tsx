"use client";
import Link from "next/link";
import { useState } from "react";
import { MarcarPaga, WhatsAppButton } from "@/components/acoes";
import { MODELO_NOME, type ModeloKey } from "@/lib/mensagens";

type Item = { id: string; alunoId: string; nome: string; para: string; fone: string; valor: string; atraso: string; k: ModeloKey; texto: string; href: string };

export default function Fila({ itens }: { itens: Item[] }) {
  const [i, setI] = useState(0); const [enviado, setEnviado] = useState(false);
  if (!itens.length) return <div className="card p-6 text-center text-muted">Ninguém em atraso. 🎉 <Link href="/app/cobrancas" className="font-bold text-accent">Voltar</Link></div>;
  if (i >= itens.length) return <div className="card flex flex-col items-center gap-3 p-6 text-center"><b className="text-lg">Pronto! {itens.length} cobranças passadas.</b><Link href="/app/cobrancas" className="btn-primary">Voltar para cobranças</Link></div>;
  const it = itens[i];
  return (
    <div className="card mx-auto flex w-full max-w-xl flex-col gap-4 p-4">
      <div className="flex items-baseline justify-between"><b className="text-lg">{it.nome}</b><span className="num text-sm text-muted">{i + 1} de {itens.length}</span></div>
      <p className="text-sm text-muted">{it.valor} · <span className="text-bad">{it.atraso}</span> · para {it.para} ({it.fone})</p>
      <div className="rounded-xl bg-[#E9E3D9] p-3 dark:bg-[#0B141A]">
        <div className="ml-auto max-w-[92%] whitespace-pre-wrap break-words rounded-[10px_2px_10px_10px] bg-[#D9F7C8] px-3 py-2 text-sm text-[#14201A] shadow-sm dark:bg-[#1D4A37] dark:text-[#E8F2EC]">{it.texto}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        <WhatsAppButton href={it.href} alunoId={it.alunoId} tipo={it.k} descricao={`${MODELO_NOME[it.k].split(" (")[0]} enviada`} className="btn-wa flex-1" onSent={() => setEnviado(true)}>Enviar no WhatsApp</WhatsAppButton>
        <button type="button" className={enviado ? "btn-primary flex-1" : "btn-ghost flex-1"} onClick={() => { setI(i + 1); setEnviado(false); }}>{i + 1 < itens.length ? "Próximo →" : "Concluir"}</button>
      </div>
      <div className="flex items-center justify-between gap-2 text-sm text-muted"><span>Já pagou?</span><MarcarPaga id={it.id} /></div>
    </div>
  );
}
