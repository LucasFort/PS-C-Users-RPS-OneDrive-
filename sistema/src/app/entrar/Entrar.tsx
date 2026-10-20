"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Entrar({ volta }: { volta?: string }) {
  const router = useRouter(); const [erro, setErro] = useState(""); const [msg, setMsg] = useState(""); const [pend, setPend] = useState(false);
  async function entrar(fd: FormData) {
    setPend(true); setErro("");
    const { error } = await createClient().auth.signInWithPassword({ email: String(fd.get("email")), password: String(fd.get("senha")) });
    setPend(false);
    if (error) return setErro(error.message.includes("confirm") ? "Confirme seu e-mail pelo link que enviamos antes de entrar." : "E-mail ou senha incorretos.");
    router.replace(volta?.startsWith("/app") ? volta : "/app"); router.refresh();
  }
  async function esqueci(email: string) {
    if (!email) return setErro("Digite seu e-mail acima e toque de novo em “Esqueci a senha”.");
    await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/nova-senha` });
    setMsg("Se o e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.");
  }
  return (
    <form action={entrar} className="flex flex-col gap-3">
      <label className="label">E-mail<input className="field" name="email" type="email" required autoComplete="email" id="email" /></label>
      <label className="label">Senha<input className="field" name="senha" type="password" required autoComplete="current-password" /></label>
      {erro && <p className="rounded-lg bg-bad-bg px-3 py-2 text-sm text-bad">{erro}</p>}
      {msg && <p className="rounded-lg bg-ok-bg px-3 py-2 text-sm text-ok">{msg}</p>}
      <button className="btn-primary" disabled={pend}>{pend ? "Entrando…" : "Entrar"}</button>
      <button type="button" className="text-sm font-bold text-accent" onClick={() => esqueci((document.getElementById("email") as HTMLInputElement).value)}>Esqueci a senha</button>
    </form>
  );
}
