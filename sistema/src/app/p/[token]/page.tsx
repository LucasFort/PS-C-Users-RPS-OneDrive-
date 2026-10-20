import type { Metadata } from "next";
import QRCode from "qrcode";
import { CircleCheck } from "lucide-react";
import { pagamentoPublico } from "@/lib/publico";
import { pixCopiaECola } from "@/lib/pix";
import { MESES, dataBR } from "@/lib/datas";
import { brl } from "@/lib/format";
import { CopyButton } from "@/components/acoes";
import PixMP from "./PixMP";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pagamento da mensalidade", robots: { index: false } };

export default async function Pagar({ params }: { params: { token: string } }) {
  const p = await pagamentoPublico(params.token);
  if (!p) return <Casca><h1 className="text-2xl font-extrabold">Link não encontrado</h1><p className="text-muted">Confira o link com a escola.</p></Casca>;
  const mes = MESES[Number(p.referencia.slice(5)) - 1];
  const cabeca = (
    <div className="flex flex-col gap-1 text-center">
      <p className="eyebrow">{p.escola}</p>
      <h1 className="text-2xl font-extrabold">Mensalidade de {mes}</h1>
      <p className="text-muted">{p.aluno} · vence {dataBR(p.vencimento)}</p>
      <div className="num mt-2 font-display text-5xl font-black [font-stretch:75%]">{brl(p.valor)}</div>
    </div>
  );
  if (p.status === "paga") return <Casca>{cabeca}<div className="flex flex-col items-center gap-2 rounded-xl bg-ok-bg p-5 text-ok"><CircleCheck className="h-10 w-10" aria-hidden /><b className="text-lg">Pagamento confirmado</b><span className="text-sm">Obrigado!</span></div></Casca>;
  if (p.status === "cancelada") return <Casca>{cabeca}<p className="text-center text-muted">Esta cobrança foi cancelada pela escola.</p></Casca>;
  if (p.tem_mp) return <Casca>{cabeca}<PixMP token={params.token} /></Casca>;
  if (!p.chave_pix) return <Casca>{cabeca}<p className="text-center text-muted">A escola ainda não cadastrou a chave Pix. Fale com a escola para pagar.</p></Casca>;
  const codigo = pixCopiaECola({ chave: p.chave_pix, nome: p.nome_pix, cidade: p.cidade, valor: p.valor, txid: `M${p.referencia.replace("-", "")}${p.mensalidade_id.replace(/-/g, "").slice(0, 12)}` });
  const qr = await QRCode.toDataURL(codigo, { margin: 1, width: 480, errorCorrectionLevel: "M" });
  return (
    <Casca>
      {cabeca}
      <div className="flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="QR code do Pix" width={240} height={240} className="rounded-xl bg-white p-2" />
        <p className="text-center text-sm text-muted">Abra o app do seu banco, escolha <b className="text-ink">Pix → Ler QR code</b>, ou copie o código abaixo.</p>
        <code className="w-full break-all rounded-lg bg-bg p-3 text-xs">{codigo}</code>
        <CopyButton texto={codigo} className="btn-primary w-full">Copiar código Pix</CopyButton>
        <p className="text-center text-xs text-muted">Pagamento direto para {p.nome_pix}. Depois de pagar, a escola confirma o recebimento.</p>
      </div>
    </Casca>
  );
}

function Casca({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-4 py-10">
      <div className="card flex flex-col gap-5 p-6">{children}</div>
      <p className="text-center text-xs text-muted">Cobrança enviada pelo <b>Mensalidade em Dia</b></p>
    </main>
  );
}
