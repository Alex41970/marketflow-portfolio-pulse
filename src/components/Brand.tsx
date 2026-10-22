import { useBrand } from "@/lib/useBrand";

export function Brand({ className = "" }: { className?: string }) {
  const BRAND = useBrand();
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground num text-sm">{BRAND.mark}</span>
      <span className="text-[15px]">{BRAND.name}<span className="ml-1 font-normal opacity-70">{BRAND.suffix}</span></span>
    </span>
  );
}

export function DemoBanner() {
  return (
    <div className="bg-warning px-3 py-1 text-center text-[11px] font-medium text-warning-foreground">
      DEMO ENVIRONMENT · Virtual funds only · Simulated prices · Not a brokerage
    </div>
  );
}

export function Sparkline({ data, up, w = 80, h = 24 }: { data: number[]; up: boolean; w?: number; h?: number }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");
  return (
    <svg width={w} height={h} className={up ? "text-gain" : "text-loss"} aria-hidden>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function SimTag() {
  return <span className="rounded-sm border px-1 py-px text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Simulated</span>;
}
