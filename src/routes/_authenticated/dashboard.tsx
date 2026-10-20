import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TICKERS, history, useLivePrices, fmt } from "@/lib/market";
import { canBuy } from "@/lib/rules";
import { useAccount, useHoldings } from "@/hooks/use-account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Trade — Ledgerline Paper Trading" }, { name: "description", content: "Your practice trading desk." }] }),
  component: Dashboard,
});

function Dashboard() {
  const prices = useLivePrices();
  const [sel, setSel] = useState(TICKERS[0].symbol);
  const { data: acct } = useAccount();
  const { data: holdings = [] } = useHoldings();
  const ticker = TICKERS.find((t) => t.symbol === sel)!;
  const chart = useMemo(() => history(ticker), [ticker]);
  const live = prices[sel];
  const cash = Number(acct?.profile?.virtual_balance ?? 0);
  const bonus = Number(acct?.profile?.bonus ?? 0);
  const invested = holdings.reduce((s, h) => s + Number(h.quantity) * (prices[h.symbol]?.price ?? 0), 0);
  const cost = holdings.reduce((s, h) => s + Number(h.quantity) * Number(h.avg_cost), 0);
  const pnl = invested - cost;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Net liquidation" value={fmt(cash + invested)} />
          <Stat label="Cash" value={fmt(cash)} />
          <Stat label="Unrealized P&L" value={fmt(pnl)} tone={pnl >= 0 ? "gain" : "loss"} />
          <Stat label="Practice bonus" value={fmt(bonus)} />
        </div>
        <div className="panel p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-lg font-semibold">{ticker.symbol} <span className="text-sm font-normal text-muted-foreground">{ticker.name}</span></div>
              <Change price={live.price} open={live.open} big />
            </div>
            <span className="text-xs text-muted-foreground">Simulated price</span>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis domain={["auto", "auto"]} width={50} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={() => ""} />
                <Area dataKey="price" stroke="var(--primary)" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <OrderTicket symbol={sel} price={live.price} cash={cash} owned={Number(holdings.find((h) => h.symbol === sel)?.quantity ?? 0)} />
      </div>
      <div className="panel h-fit">
        <div className="border-b px-4 py-3 text-sm font-semibold">Watchlist</div>
        <ul>
          {TICKERS.map((t) => (
            <li key={t.symbol}>
              <button onClick={() => setSel(t.symbol)} className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-muted ${sel === t.symbol ? "bg-accent" : ""}`}>
                <div>
                  <div className="font-medium">{t.symbol}</div>
                  <div className="text-xs text-muted-foreground">{t.name}</div>
                </div>
                <div className="text-right">
                  <div className="num">{prices[t.symbol].price.toFixed(2)}</div>
                  <Change price={prices[t.symbol].price} open={prices[t.symbol].open} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "gain" | "loss" }) {
  return (
    <div className="panel p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`num mt-1 text-lg ${tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : ""}`}>{value}</div>
    </div>
  );
}

function Change({ price, open, big }: { price: number; open: number; big?: boolean }) {
  const d = price - open;
  const pct = (d / open) * 100;
  return (
    <span className={`num ${big ? "text-2xl" : "text-xs"} ${d >= 0 ? "text-gain" : "text-loss"}`}>
      {big && <span className="mr-2 text-foreground">{price.toFixed(2)}</span>}
      {d >= 0 ? "+" : ""}{d.toFixed(2)} ({pct.toFixed(2)}%)
    </span>
  );
}

function OrderTicket({ symbol, price, cash, owned }: { symbol: string; price: number; cash: number; owned: number }) {
  const [qty, setQty] = useState("10");
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const q = Number(qty);
  async function place(side: "buy" | "sell") {
    if (side === "buy" && !canBuy(cash, q, price)) return toast.error("Not enough virtual cash");
    if (side === "sell" && q > owned) return toast.error("Not enough shares");
    setBusy(true);
    const { error } = await supabase.rpc("place_trade", { _symbol: symbol, _side: side, _qty: q, _price: price });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`${side === "buy" ? "Bought" : "Sold"} ${q} ${symbol} @ ${price.toFixed(2)}`);
    qc.invalidateQueries();
  }
  return (
    <div className="panel flex flex-wrap items-end gap-4 p-4">
      <div>
        <div className="text-xs text-muted-foreground">Order · {symbol}</div>
        <Input className="num mt-1 w-28" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
      </div>
      <div className="text-sm">
        <div className="text-xs text-muted-foreground">Est. total</div>
        <div className="num mt-2">{fmt(q * price || 0)}</div>
      </div>
      <div className="text-sm">
        <div className="text-xs text-muted-foreground">You own</div>
        <div className="num mt-2">{owned}</div>
      </div>
      <div className="ml-auto flex gap-2">
        <Button disabled={busy} onClick={() => place("buy")}>Buy</Button>
        <Button disabled={busy} variant="destructive" onClick={() => place("sell")}>Sell</Button>
      </div>
    </div>
  );
}
