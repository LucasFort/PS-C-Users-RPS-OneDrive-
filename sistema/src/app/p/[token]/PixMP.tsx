"use client";
import { useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";
import { CopyButton } from "@/components/acoes";

type R = { qr_code: string; qr_code_base64: string } | { erro: string };

export default function PixMP({ token }: { token: string }) {
  const [r, setR] = useState<R | null>(null); const [pago, setPago] = useState(false);
  useEffect(() => {
    let vivo = true;
    fetch(`/api/pix/${token}`, { method: "POST" }).then((x) => x.json()).then((j) => vivo && setR(j)).catch(() => vivo && setR({ erro: "Não foi possível gerar o Pix agora." }));
    const t = setInterval(async () => {
      const j = await fetch(`/api/pix/${token}`, { cache: "no-store" }).then((x) => x.json()).catch(() => null);
      if (j?.status === "paga") { setPago(true); clearInterval(t); }
    }, 5000);
    return () => { vivo = false; clearInterval(t); };
  }, [token]);
  if (pago) return <div className="flex flex-col items-center gap-2 rounded-xl bg-ok-bg p-5 text-ok"><CircleCheck className="h-10 w-10" aria-hidden /><b className="text-lg">Pagamento confirmado</b><span className="text-sm">Obrigado!</span></div>;
  if (!r) return <p className="text-center text-muted">Gerando o Pix…</p>;
  if ("erro" in r) return <p className="text-center text-bad">{r.erro}</p>;
  return (
    <div className="flex flex-col items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/png;base64,${r.qr_code_base64}`} alt="QR code do Pix" width={240} height={240} className="rounded-xl bg-white p-2" />
      <p className="text-center text-sm text-muted">Abra o app do banco → <b className="text-ink">Pix → Ler QR code</b>, ou copie o código.</p>
      <code className="w-full break-all rounded-lg bg-bg p-3 text-xs">{r.qr_code}</code>
      <CopyButton texto={r.qr_code} className="btn-primary w-full">Copiar código Pix</CopyButton>
      <p className="text-center text-xs text-muted">A confirmação aparece aqui sozinha assim que o pagamento cair.</p>
    </div>
  );
}
