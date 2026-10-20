import type { Metadata, Viewport } from "next";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "Mensalidade em Dia · cobrança automática para escolas e academias", template: "%s · Mensalidade em Dia" },
  description: "Cobre mensalidades pelo WhatsApp com Pix, veja quem pagou e quem deve, faça chamada e acompanhe o lucro. Teste 30 dias grátis.",
  openGraph: { title: "Mensalidade em Dia", description: "Cobrança de mensalidades pelo WhatsApp com Pix para escolinhas, academias e cursos.", locale: "pt_BR", type: "website" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#1E7449" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&family=Figtree:wght@400;500;600;700&display=swap" />
        <style dangerouslySetInnerHTML={{ __html: `:root{--font-display:"Archivo";--font-body:"Figtree"}` }} />
      </head>
      <body>{children}<MetaPixel /></body>
    </html>
  );
}
