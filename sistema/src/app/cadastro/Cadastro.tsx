"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SEGMENTOS } from "@/lib/segmentos";
import { rastrear } from "@/components/MetaPixel";

export default function Cadastro({ logado }: { logado: boolean }) {
  const router = useRouter(); const [erro, setErro] = useState(""); const [pend, setPend] = useState(false); const [confirmar, setConfirmar] = useState("");
  async function enviar(fd: FormData) {
    setPend(true); setErro("");
    const sb = createClient();
    const escola = { escola_nome: String(fd.get("escola")).trim(), escola_tipo: String(fd.get("tipo")), escola_whatsapp: String(fd.get("whatsapp")).trim(), escola_cidade: String(fd.get("cidade")).trim() };
    if (!logado) {
      const email = String(fd.get("email")).trim();
      const { data, error } = await sb.auth.signUp({ email, password: String(fd.get("senha")), options: { data: escola, emailRedirectTo: `${location.origin}/auth/callback` } });
      if (error) { setPend(false); return setErro(error.message.includes("registered") ? "Esse e-mail já tem conta. Entre com ele." : error.message.includes("Password") ? "A senha precisa ter pelo menos 6 caracteres." : "Não foi possível criar a conta. Confira os dados."); }
      rastrear("CompleteRegistration");
      if (!data.session) { setPend(false); return setConfirmar(email); }
    }
    const { error } = await sb.rpc("criar_escola", { p_nome: escola.escola_nome, p_tipo: escola.escola_tipo, p_whatsapp: escola.escola_whatsapp, p_cidade: escola.escola_cidade });
    setPend(false);
    if (error) return setErro("Conta criada, mas não deu para salvar a escola. Tente de novo.");
    router.replace("/app"); router.refresh();
  }
  if (confirmar) return <p className="rounded-lg bg-ok-bg p-4 text-ok">Quase lá! Enviamos um link para <b>{confirmar}</b>. Abra o e-mail e toque no link para entrar.</p>;
  return (
    <form action={enviar} className="flex flex-col gap-3">
      <label className="label">Nome da escola ou academia<input className="field" name="escola" required autoFocus /></label>
      <label className="label">Tipo<select className="field" name="tipo" defaultValue="futebol">{Object.entries(SEGMENTOS).map(([k, s]) => <option key={k} value={k}>{s.nome} ({s.ex})</option>)}</select></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="label">WhatsApp<input className="field num" name="whatsapp" inputMode="tel" required placeholder="(11) 99999-8888" /></label>
        <label className="label">Cidade<input className="field" name="cidade" required /></label>
      </div>
      {!logado && (<>
        <label className="label">Seu e-mail<input className="field" name="email" type="email" required autoComplete="email" /></label>
        <label className="label">Crie uma senha<input className="field" name="senha" type="password" required minLength={6} autoComplete="new-password" /></label>
      </>)}
      {erro && <p className="rounded-lg bg-bad-bg px-3 py-2 text-sm text-bad">{erro}</p>}
      <button className="btn-primary" disabled={pend}>{pend ? "Criando…" : logado ? "Salvar e começar" : "Criar conta grátis"}</button>
      <p className="text-center text-xs text-muted">Ao criar a conta você concorda com os <a href="/termos" className="underline">Termos de uso</a> e a <a href="/privacidade" className="underline">Política de privacidade</a>.</p>
    </form>
  );
}
