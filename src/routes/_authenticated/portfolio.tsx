import { createFileRoute } from "@tanstack/react-router";
import { useHoldings } from "@/hooks/use-account";
import { TICKERS, useLivePrices, fmt } from "@/lib/market";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — Ledgerline Paper Trading" }, { name: "description", content: "Your virtual holdings." }] }),
  component: Portfolio,
});

function Portfolio() {
  const { data = [], isLoading } = useHoldings();
  const prices = useLivePrices();
  return (
    <div className="panel overflow-x-auto">
      <div className="border-b px-4 py-3 font-semibold">Holdings</div>
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr><th className="px-4 py-2">Symbol</th><th>Qty</th><th>Avg cost</th><th>Last</th><th>Value</th><th className="pr-4">P&L</th></tr>
        </thead>
        <tbody className="num">
          {data.map((h) => {
            const last = prices[h.symbol]?.price ?? 0;
            const pnl = (last - Number(h.avg_cost)) * Number(h.quantity);
            return (
              <tr key={h.id} className="border-t">
                <td className="px-4 py-2.5 font-sans font-medium">{h.symbol} <span className="text-xs font-normal text-muted-foreground">{TICKERS.find((t) => t.symbol === h.symbol)?.name}</span></td>
                <td>{Number(h.quantity)}</td>
                <td>{Number(h.avg_cost).toFixed(2)}</td>
                <td>{last.toFixed(2)}</td>
                <td>{fmt(last * Number(h.quantity))}</td>
                <td className={`pr-4 ${pnl >= 0 ? "text-gain" : "text-loss"}`}>{fmt(pnl)}</td>
              </tr>
            );
          })}
          {!isLoading && data.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center font-sans text-muted-foreground">No holdings yet. Place a trade from the Trade page.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
