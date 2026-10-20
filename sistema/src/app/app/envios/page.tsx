import { getEscola } from "@/lib/escola";
import { Empty, PageHead } from "@/components/ui";

export default async function Envios() {
  const { supabase, escola } = await getEscola();
  const { data } = await supabase.from("envios").select("id,tipo,descricao,created_at,aluno:alunos(nome)").eq("escola_id", escola.id).order("created_at", { ascending: false }).limit(150);
  return (
    <>
      <PageHead eyebrow="Mais" title="Histórico" sub="Últimos 150 registros." />
      <div className="card overflow-hidden">
        {data?.length ? data.map((e) => (
          <div key={e.id} className="flex gap-3 border-t border-line px-3.5 py-3 first:border-t-0">
            <span className={`grid h-8 w-8 flex-none place-items-center rounded-full text-xs font-extrabold ${e.tipo === "recibo" || e.tipo === "pagamento" ? "bg-ok-bg text-ok" : "bg-accent-soft text-accent"}`}>{e.tipo === "recibo" || e.tipo === "pagamento" ? "✓" : "•"}</span>
            <div className="min-w-0"><p className="text-sm"><b>{(e.aluno as unknown as { nome: string } | null)?.nome ?? "Escola"}</b> · {e.descricao}</p><small className="text-xs text-muted">{new Date(e.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</small></div>
          </div>
        )) : <Empty>Nada registrado ainda.</Empty>}
      </div>
    </>
  );
}
