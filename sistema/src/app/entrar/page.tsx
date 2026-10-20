import type { Metadata } from "next";
import Link from "next/link";
import Marca from "@/components/Marca";
import Entrar from "./Entrar";
export const metadata: Metadata = { title: "Entrar" };
export default function Page({ searchParams }: { searchParams: { volta?: string } }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-5 px-4 py-10">
      <Marca className="self-center" />
      <div className="card flex flex-col gap-4 p-6"><h1 className="text-2xl font-extrabold">Entrar</h1><Entrar volta={searchParams.volta} /></div>
      <p className="text-center text-sm text-muted">Ainda não tem conta? <Link href="/cadastro" className="font-bold text-accent">Teste 30 dias grátis</Link></p>
    </main>
  );
}
