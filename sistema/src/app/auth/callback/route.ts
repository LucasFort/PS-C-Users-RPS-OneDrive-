import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const destino = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  if (code) await createClient().auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(destino, url.origin));
}
