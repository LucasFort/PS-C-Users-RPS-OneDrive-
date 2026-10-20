import type { Aluno, Turma } from "@/lib/dados";
import { salvarAluno } from "@/app/app/actions";

export default function AlunoForm({ aluno, turmas }: { aluno?: Aluno; turmas: Turma[] }) {
  return (
    <form action={salvarAluno} className="card flex max-w-2xl flex-col gap-3 p-4">
      {aluno && <input type="hidden" name="id" value={aluno.id} />}
      <label className="label">Nome do aluno<input className="field" name="nome" required defaultValue={aluno?.nome} autoFocus={!aluno} /></label>
      <label className="label">Responsável<input className="field" name="responsavel" defaultValue={aluno?.responsavel ?? ""} placeholder="Deixe vazio se o aluno for adulto" /></label>
      <label className="label">WhatsApp<input className="field num" name="whatsapp" required inputMode="tel" defaultValue={aluno?.whatsapp} placeholder="(11) 99999-8888" /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="label">Turma
          <select className="field" name="turma_id" defaultValue={aluno?.turma_id ?? turmas[0]?.id ?? ""}>
            <option value="">Sem turma</option>
            {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </label>
        <label className="label">Mensalidade (R$)<input className="field num" name="valor" required inputMode="decimal" defaultValue={aluno?.valor ?? turmas[0]?.valor ?? ""} /></label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="label">Dia do vencimento<input className="field num" name="dia_vencimento" type="number" min={1} max={31} required defaultValue={aluno?.dia_vencimento ?? 10} /></label>
        <label className="label">Nascimento<input className="field" name="nascimento" type="date" defaultValue={aluno?.nascimento ?? ""} /></label>
      </div>
      <button className="btn-primary" type="submit">{aluno ? "Salvar" : "Cadastrar aluno"}</button>
    </form>
  );
}
