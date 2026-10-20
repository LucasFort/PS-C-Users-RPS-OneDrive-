import Link from "next/link";
export default function Marca({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-display text-xl font-black text-accent [font-stretch:85%] ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden><rect width="32" height="32" rx="9" className="fill-accent" /><path d="M9 16.5l4.5 4.5L23 11.5" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      Mensalidade em Dia
    </Link>
  );
}
