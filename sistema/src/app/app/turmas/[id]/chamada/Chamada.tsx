"use client";
import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui";
import { WhatsAppButton } from "@/components/acoes";
import { salvarChamada } from "../../../actions";

type A = { id: string; nome: string; avisoFalta: string | null };

export default function Chamada({ turmaId, data, alunos, inicial }: { turmaId: string; data: string; alunos: A[]; inicial: Record<string, boolean> | null }) {
  const [m, setM] = useState<Record<string, boolean>>(() => Object.fromEntries(alunos.map((a) => [a.id, inicial?.[a.id] ?? true])));
  const [salvo, setSalvo] = useState(!!inicial); const [pend, start] = useTransition();
  const pres = Object.values(m).filter(Boolean).length;
  const faltosos = alunos.filter((a) => !m[a.id]);
  if (!alunos.length) return <div className="card p-6 text-center text-muted">Nenhum aluno ativo nesta turma.</div>;
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <div className="card overflow-hidden">
        {alunos.map((a) => (
          <div key={a.id} className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 first:border-t-0">
            <Avatar nome={a.nome} /><b className="min-w-0 flex-1 truncate font-semibold">{a.nome}</b>
            <span className="flex flex-none overflow-hidden rounded-lg border border-line" role="group" aria-label={`Presença de ${a.nome}`}>
              <button type="button" aria-pressed={m[a.id]} onClick={() => { setM({ ...m, [a.id]: true }); setSalvo(false); }} className={`px-3 py-1.5 text-xs font-bold ${m[a.id] ? "bg-ok-bg text-ok" : "bg-surface text-muted"}`}>Presente</button>
              <button type="button" aria-pressed={!m[a.id]} onClick={() => { setM({ ...m, [a.id]: false }); setSalvo(false); }} className={`px-3 py-1.5 text-xs font-bold ${!m[a.id] ? "bg-bad-bg text-bad" : "bg-surface text-muted"}`}>Falta</button>
            </span>
          </div>
        ))}
      </div>
      <p className="num text-center text-sm text-muted">{pres} presentes · {alunos.length - pres} faltas</p>
      <button type="button" className="btn-primary" disabled={pend} onClick={() => start(async () => { await salvarChamada(turmaId, data, m); setSalvo(true); })}>{pend ? "Salvando…" : salvo ? "Chamada salva ✓" : "Salvar chamada"}</button>
      {salvo && faltosos.some((a) => a.avisoFalta) && (
        <div className="card flex flex-col gap-2 p-3.5">
          <b className="text-sm">Avisar quem faltou</b>
          {faltosos.map((a) => a.avisoFalta && (
            <div key={a.id} className="flex items-center justify-between gap-2"><span className="truncate text-sm">{a.nome}</span><WhatsAppButton href={a.avisoFalta} alunoId={a.id} tipo="falta" descricao="Aviso de falta enviado">Avisar</WhatsAppButton></div>
          ))}
        </div>
      )}
    </div>
  );
}
