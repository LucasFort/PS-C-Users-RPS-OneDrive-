import { DIAS } from "@/lib/datas";
import type { Turma } from "@/lib/dados";
import { salvarTurma } from "@/app/app/actions";

export default function TurmaForm({ turma }: { turma?: Turma }) {
  return (
    <form action={salvarTurma} className="card flex max-w-2xl flex-col gap-3 p-4">
      {turma && <input type="hidden" name="id" value={turma.id} />}
      <label className="label">Nome da turma<input className="field" name="nome" required defaultValue={turma?.nome} autoFocus={!turma} placeholder="Ex.: Sub-9, Funcional noite, Balé infantil" /></label>
      <fieldset className="label"><legend className="mb-1.5">Dias da semana</legend>
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <label key={d} className="cursor-pointer">
              <input type="checkbox" name="dias" value={d} defaultChecked={turma?.dias.includes(d)} className="peer sr-only" />
              <span className="block rounded-lg border border-line bg-bg px-3 py-2 text-[13px] font-bold text-muted peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent">{DIAS[d]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <label className="label">Horário<input className="field" name="hora" type="time" defaultValue={turma?.hora ?? "18:00"} /></label>
        <label className="label">Professor<input className="field" name="professor" defaultValue={turma?.professor ?? ""} /></label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="label">Mensalidade (R$)<input className="field num" name="valor" inputMode="decimal" required defaultValue={turma?.valor ?? ""} /></label>
        <label className="label">Vagas<input className="field num" name="vagas" type="number" min={1} defaultValue={turma?.vagas ?? 20} /></label>
      </div>
      <button className="btn-primary" type="submit">{turma ? "Salvar" : "Criar turma"}</button>
    </form>
  );
}
