"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Empty, Pill } from "@/components/ui";
import type { SituacaoKey } from "@/lib/datas";

type Linha = { id: string; nome: string; responsavel: string | null; turma: string; turmaId: string; valor: string; ativo: boolean; sit: { k: SituacaoKey | "inativo"; texto: string } };

export default function BuscaAlunos({ alunos, turmas }: { alunos: Linha[]; turmas: { id: string; nome: string }[] }) {
  const [q, setQ] = useState(""); const [t, setT] = useState(""); const [f, setF] = useState("ativos");
  const lista = useMemo(() => alunos.filter((a) => {
    if (f === "inativos" ? a.ativo : !a.ativo) return false;
    if (f === "atrasada" && a.sit.k !== "atrasada") return false;
    if (t && a.turmaId !== t) return false;
    const s = q.trim().toLowerCase();
    return !s || `${a.nome} ${a.responsavel ?? ""} ${a.turma}`.toLowerCase().includes(s);
  }), [alunos, q, t, f]);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <input className="field min-w-0 flex-[1_1_200px] bg-surface" type="search" placeholder="Buscar aluno ou responsável" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
        <select className="field w-auto bg-surface" value={t} onChange={(e) => setT(e.target.value)} aria-label="Turma">
          <option value="">Todas as turmas</option>{turmas.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
        </select>
      </div>
      <div className="flex gap-1.5 overflow-x-auto" role="group" aria-label="Filtrar">
        {[["ativos", "Ativos"], ["atrasada", "Em atraso"], ["inativos", "Inativos"]].map(([k, l]) => (
          <button key={k} type="button" aria-pressed={f === k} onClick={() => setF(k)}
            className={`flex-none rounded-full border px-3 py-1.5 text-[13px] font-semibold ${f === k ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted"}`}>{l}</button>
        ))}
      </div>
      <div className="card overflow-hidden">
        {lista.length ? lista.map((a) => (
          <Link key={a.id} href={`/app/alunos/${a.id}`} className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0 hover:bg-bg">
            <Avatar nome={a.nome} apagado={!a.ativo} />
            <span className="flex min-w-0 flex-1 flex-col"><b className="truncate font-semibold">{a.nome}</b><span className="truncate text-[13px] text-muted">{a.turma}{a.responsavel ? ` · resp. ${a.responsavel.split(" ")[0]}` : ""}</span></span>
            <span className="flex flex-col items-end gap-1"><b className="num text-sm">{a.valor}</b><Pill k={a.sit.k}>{a.sit.texto}</Pill></span>
          </Link>
        )) : <Empty>{alunos.length ? "Nenhum aluno encontrado." : "Nenhum aluno ainda."}</Empty>}
      </div>
    </>
  );
}
