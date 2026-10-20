import { brl } from "@/lib/format";

const curto = (v: number) => (v >= 1000 ? `R$ ${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : `R$ ${Math.round(v)}`);
function teto(v: number) { if (v <= 0) return 100; const m = v * 1.1, g = Math.pow(10, Math.floor(Math.log10(m))); return Math.ceil((m / g) * 2) / 2 * g; }

/** Barras: recebido x despesas por mês. */
export default function Grafico({ dados }: { dados: { rotulo: string; a: number; b: number }[] }) {
  const W = 640, H = 250, pl = 96, pr = 8, pt = 12, pb = 32, max = teto(Math.max(...dados.map((d) => Math.max(d.a, d.b)))), ih = H - pt - pb, bw = (W - pl - pr) / dados.length;
  return (
    <figure className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Recebido e despesas nos últimos meses">
        {[0, 1, 2, 3, 4].map((i) => { const y = pt + ih - (ih * i) / 4; return (<g key={i}><line x1={pl} x2={W - pr} y1={y} y2={y} className="stroke-line" /><text x={pl - 10} y={y + 6} textAnchor="end" className="fill-muted text-[17px]">{curto((max * i) / 4)}</text></g>); })}
        {dados.map((d, i) => { const cx = pl + bw * i + bw / 2, w = Math.min(26, bw * 0.3), ha = (ih * d.a) / max, hb = (ih * d.b) / max; return (
          <g key={d.rotulo}>
            <rect x={cx - w - 2} y={pt + ih - ha} width={w} height={ha} rx={3} className="fill-accent"><title>{`Recebido em ${d.rotulo}: ${brl(d.a)}`}</title></rect>
            <rect x={cx + 2} y={pt + ih - hb} width={w} height={hb} rx={3} className="fill-muted/50"><title>{`Despesas em ${d.rotulo}: ${brl(d.b)}`}</title></rect>
            <text x={cx} y={H - 6} textAnchor="middle" className="fill-muted text-[17px]">{d.rotulo}</text>
          </g>); })}
      </svg>
      <figcaption className="flex gap-4 text-xs text-muted"><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-accent align-[-1px]" />Recebido</span><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-muted/50 align-[-1px]" />Despesas</span></figcaption>
    </figure>
  );
}
