import type { Metadata } from "next";
import Link from "next/link";
import Marca from "@/components/Marca";
import { createClient } from "@/lib/supabase/server";
import Cadastro from "./Cadastro";
export const metadata: Metadata = { title: "Teste grátis por 30 dias" };
export const dynamic = "force-dynamic";
export default async function Page() {
  const { data: { user } } = await createClient().auth.getUser();
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-4 py-10">
      <Marca className="self-center" />
      <div className="card flex flex-col gap-4 p-6">
        <div><h1 className="text-2xl font-extrabold">{user ? "Dados da sua escola" : "Teste grátis por 30 dias"}</h1><p className="text-sm text-muted">Sem cartão de crédito. Leva 1 minuto.</p></div>
        <Cadastro logado={!!user} />
      </div>
      {!user && <p className="text-center text-sm text-muted">Já tem conta? <Link href="/entrar" className="font-bold text-accent">Entrar</Link></p>}
    </main>
  );
}
