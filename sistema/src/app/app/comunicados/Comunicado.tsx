"use client";
import { useMemo, useState } from "react";
import { WhatsAppButton } from "@/components/acoes";
import { waLink } from "@/lib/mensagens";

const MODELOS: [string, string][] = [
  ["Aula cancelada", "Olá! Hoje não teremos aula por causa da chuva. Nos vemos na próxima! {escola}"],
  ["Feriado", "Olá! No feriado não haverá aulas. Voltamos normalmente no dia seguinte. {escola}"],
  ["Evento", "Olá! No sábado teremos nosso evento às 10h. Toda a família está convidada! {escola}"],
  ["Reajuste", "Olá! A partir do próximo mês as mensalidades terão um pequeno reajuste. Qualquer dúvida, estamos à disposição. {escola}"],
];
type C = { id: string; nome: string; para: string; whatsapp: string; turmaId: string; atrasado: boolean };

export default function Comunicado({ escola, contatos, turmas, paraInicial }: { escola: string; contatos: C[]; turmas: { id: string; nome: string }[]; paraInicial: string }) {
  const [txt, setTxt] = useState(MODELOS[0][1]); const [para, setPara] = useState(paraInicial); const [feitos, setFeitos] = useState<Set<string>>(new Set());
  const dest = useMemo(() => contatos.filter((c) => para === "todos" || (para === "atrasado" ? c.atrasado : c.turmaId === para)), [contatos, para]);
  const texto = txt.replace(/\{escola\}/g, escola);
  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <section className="card flex flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">{MODELOS.map(([n, t]) => <button key={n} type="button" className="rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] font-semibold text-muted" onClick={() => setTxt(t)}>{n}</button>)}</div>
        <label className="label">Mensagem<textarea className="field min-h-[120px]" value={txt} onChange={(e) => setTxt(e.target.value)} /></label>
        <label className="label">Para quem
          <select className="field" value={para} onChange={(e) => { setPara(e.target.value); setFeitos(new Set()); }}>
            <option value="todos">Todos os alunos ativos</option><option value="atrasado">Só quem está em atraso</option>
            {turmas.map((t) => <option key={t.id} value={t.id}>Turma: {t.nome}</option>)}
          </select>
        </label>
        <div className="rounded-xl bg-[#E9E3D9] p-3 dark:bg-[#0B141A]"><div className="ml-auto max-w-[92%] whitespace-pre-wrap break-words rounded-[10px_2px_10px_10px] bg-[#D9F7C8] px-3 py-2 text-sm text-[#14201A] dark:bg-[#1D4A37] dark:text-[#E8F2EC]">{texto}</div></div>
      </section>
      <section className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between"><h2 className="text-[19px] font-extrabold">Enviar ({feitos.size}/{dest.length})</h2></div>
        <div className="card overflow-hidden">
          {dest.length ? dest.map((c) => (
            <div key={c.id} className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 first:border-t-0">
              <span className="flex min-w-0 flex-1 flex-col"><b className="truncate text-sm font-semibold">{c.para}</b><span className="truncate text-xs text-muted">{c.nome}</span></span>
              <WhatsAppButton href={waLink(c.whatsapp, texto)} alunoId={c.id} tipo="comunicado" descricao={`Comunicado: ${texto.slice(0, 60)}`} className={feitos.has(c.id) ? "btn-ghost btn-sm" : "btn-wa btn-sm"} onSent={() => setFeitos(new Set(feitos).add(c.id))}>{feitos.has(c.id) ? "Enviado ✓" : "Enviar"}</WhatsAppButton>
            </div>
          )) : <p className="px-4 py-6 text-center text-muted">Ninguém neste grupo.</p>}
        </div>
      </section>
    </div>
  );
}
