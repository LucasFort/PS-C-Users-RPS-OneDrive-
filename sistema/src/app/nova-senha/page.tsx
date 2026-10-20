"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function NovaSenha() {
  const router = useRouter(); const [erro, setErro] = useState("");
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <form className="card flex flex-col gap-3 p-6" action={async (fd) => {
        const { error } = await createClient().auth.updateUser({ password: String(fd.get("senha")) });
        if (error) return setErro("Não foi possível trocar a senha. Peça um novo link."); router.replace("/app");
      }}>
        <h1 className="text-2xl font-extrabold">Nova senha</h1>
        <label className="label">Nova senha<input className="field" name="senha" type="password" minLength={6} required autoComplete="new-password" /></label>
        {erro && <p className="text-sm text-bad">{erro}</p>}
        <button className="btn-primary">Salvar senha</button>
      </form>
    </main>
  );
}
