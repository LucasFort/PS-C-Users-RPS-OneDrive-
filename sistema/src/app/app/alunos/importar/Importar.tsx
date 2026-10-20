"use client";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { importarAlunos } from "../../actions";

const EXEMPLO = "Miguel Santos; Patrícia Santos; (11) 98765-4321; 150; 10; Sub-9\nRafael Lima; ; (11) 91234-5678; 99; 5; Musculação";

function Enviar() { const { pending } = useFormStatus(); return <button className="btn-primary" disabled={pending}>{pending ? "Importando…" : "Importar alunos"}</button>; }

export default function Importar() {
  const [r, acao] = useFormState(importarAlunos, null);
  return (
    <form action={acao} className="card flex max-w-3xl flex-col gap-3 p-4">
      <p className="text-sm text-muted">Ordem das colunas: <b className="text-ink">Nome; Responsável; WhatsApp; Mensalidade; Dia do vencimento; Turma</b>. Separe com ponto e vírgula ou cole direto do Excel/Google Planilhas. Turmas que não existem são criadas.</p>
      <textarea className="field min-h-[220px] font-mono text-[13px]" name="lista" required placeholder={EXEMPLO} />
      <Enviar />
      {r && (
        <div className="rounded-lg bg-bg p-3 text-sm">
          <b className={r.ok ? "text-ok" : "text-bad"}>{r.ok} aluno(s) importado(s).</b>
          {r.erros.length > 0 && <ul className="mt-2 list-disc pl-5 text-bad">{r.erros.slice(0, 15).map((e) => <li key={e}>{e}</li>)}</ul>}
          {r.ok > 0 && <p className="mt-2"><Link href="/app/alunos" className="font-bold text-accent">Ver alunos</Link></p>}
        </div>
      )}
    </form>
  );
}
