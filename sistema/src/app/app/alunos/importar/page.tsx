import Link from "next/link";
import { PageHead } from "@/components/ui";
import Importar from "./Importar";

export default function ImportarPage() {
  return (
    <>
      <Link href="/app/alunos" className="text-sm font-bold text-accent">‹ Alunos</Link>
      <PageHead title="Importar alunos" sub="Copie da sua planilha ou do caderno e cole aqui. Um aluno por linha." />
      <Importar />
    </>
  );
}
