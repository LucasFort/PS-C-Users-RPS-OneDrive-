import Link from "next/link";
export default function NotFound() {
  return <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center"><h1 className="text-3xl font-black">Página não encontrada</h1><p className="text-muted">O endereço pode estar errado ou a página foi removida.</p><Link href="/" className="btn-primary">Ir para o início</Link></main>;
}
