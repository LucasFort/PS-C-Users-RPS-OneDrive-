import Link from "next/link";
import TurmaForm from "@/components/TurmaForm";
import { PageHead } from "@/components/ui";
export default function NovaTurma() { return (<><Link href="/app/turmas" className="text-sm font-bold text-accent">‹ Turmas</Link><PageHead title="Nova turma" /><TurmaForm /></>); }
