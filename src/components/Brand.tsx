export function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground num text-sm">L</span>
      <span>Ledgerline<span className="ml-1 font-normal opacity-70">Paper Trading</span></span>
    </span>
  );
}

export function DemoBanner() {
  return (
    <div className="bg-warning text-warning-foreground text-center text-xs font-medium py-1.5 px-3">
      Demo – virtual funds only. No real money, no real securities, not a brokerage.
    </div>
  );
}
