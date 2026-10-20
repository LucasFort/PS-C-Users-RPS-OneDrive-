import { createServerClient } from "@supabase/ssr";
import { createClient as createBareClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Cliente com a sessão do usuário logado (respeita as regras de cada escola). */
export function createClient() {
  const store = cookies();
  return createServerClient(URL, KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* chamado de Server Component */ }
      },
    },
  });
}

/** Cliente sem sessão (para RPCs públicas e as do servidor com SERVER_SECRET). */
export function createAnonClient() {
  return createBareClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
