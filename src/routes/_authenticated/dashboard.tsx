import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TICKERS, RANGES, useQuotes, quoteOf, fmt, fmtP, pct, signed, dpOf, tickerOf, type Range } from "@/lib/market";
import { canBuy } from "@/lib/rules";
import { useAccount, useHoldings, useOrders, useTransactions } from "@/hooks/use-account";
import { LazyChart } from "@/components/ws/LazyChart";
import { News, OrderBook, PanelHead, TimeSales, Watchlist } from "@/components/ws/Panels";
import { SimTag } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Workstation — Trade" }, { name: "description", content: "Simulated trading workstation." }] }),
  component: Dashboard,
});

function useLimitFills() {
  const quotes = useQuotes();
  const { data: orders = [] } = useOrders();
  const qc = useQueryClient();
  const busy = useRef(new Set<string>());
  useEffect(() => {
    for (const o of orders) {
      if (o.status !== "working" || busy.current.has(o.id)) continue;
      const p = quoteOf(quotes, o.symbol).price;
      const lim = Number(o.limit_price);
      if ((o.side === "buy" && p <= lim) || (o.side === "sell" && p >= lim)) {
        busy.current.add(o.id);
        void (async () => {
          const { error } = await supabase.rpc("place_trade", { _symbol: o.symbol, _side: o.side, _qty: Number(o.quantity), _price: lim });
          await supabase.from("orders").update({ status: error ? "cancelled" : "filled", filled_at: new Date().toISOString() }).eq("id", o.id);
          if (error) toast.error(`Limit ${o.side} ${o.symbol} cancelled: ${error.message}`);
          else toast.success(`Limit ${o.side} ${Number(o.quantity)} ${o.symbol} filled @ ${fmtP(lim, dpOf(o.symbol))}`);
          qc.invalidateQueries();
        })();
      }
    }
  }, [quotes, orders, qc]);
}

function SymbolSearch({ onSel }: { onSel: (s: string) => void }) {
  const [v, setV] = useState("");
  const res = v ? TICKERS.filter((t) => (t.symbol + t.name).toLowerCase().includes(v.toLowerCase())).slice(0, 6) : [];
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="Symbol search" className="h-7 w-48 pl-7 text-xs" />
      {res.length > 0 && (
        <div className="absolute z-20 mt-1 w-64 rounded-sm border bg-popover shadow-lg">
          {res.map((t) => (
            <button key={t.symbol} onClick={() => { onSel(t.symbol); setV(""); }} className="flex w-full justify-between px-3 py-2 text-left text-xs hover:bg-muted">
              <span className="font-semibold">{t.symbol}</span><span className="text-muted-foreground">{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  useLimitFills();
  const quotes = useQuotes();
  const [sel, setSel] = useState(TICKERS[0]!.symbol);
  const [range, setRange] = useState<Range>("1M");
  const q = quoteOf(quotes, sel);
  const t = tickerOf(sel);
  const dp = dpOf(sel);
  const c = q.price - q.open;

  return (
    <div className="grid gap-2 xl:grid-cols-[250px_minmax(0,1fr)_290px]">
      <div className="grid gap-2 xl:h-[calc(100vh-90px)] xl:grid-rows-[1fr_220px]">
        <Watchlist quotes={quotes} sel={sel} onSel={setSel} />
        <div className="hidden xl:flex xl:min-h-0 xl:flex-col"><News symbol={sel} /></div>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="ws-panel">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-3 py-2">
            <div><span className="text-base font-semibold">{sel}</span> <span className="text-xs text-muted-foreground">{t.name} · {t.cls}</span></div>
            <div className="num flex items-baseline gap-2">
              <span key={q.seq} className={`rounded-sm px-1 text-xl ${q.tick > 0 ? "flash-up" : q.tick < 0 ? "flash-down" : ""}`}>{fmtP(q.price, dp)}</span>
              <span className={c >= 0 ? "text-gain" : "text-loss"}>{signed(c, dp)} ({signed(pct(q.price, q.open))}%)</span>
            </div>
            <div className="num hidden gap-4 text-[11px] text-muted-foreground md:flex">
              <span>O {fmtP(q.open, dp)}</span><span>H {fmtP(q.high, dp)}</span><span>L {fmtP(q.low, dp)}</span><span>Vol {(q.volume / 1e6).toFixed(2)}M</span>
            </div>
            <div className="ml-auto flex items-center gap-2"><SymbolSearch onSel={setSel} /><SimTag /></div>
          </div>
          <div className="flex gap-1 px-3 pt-2">
            {(Object.keys(RANGES) as Range[]).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-sm px-2 py-0.5 text-[11px] num ${range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{r}</button>
            ))}
            <span className="ml-3 self-center text-[10px] text-muted-foreground">MA(20)</span>
          </div>
          <div className="p-2"><LazyChart symbol={sel} range={range} price={q.price} height={380} /></div>
        </div>
        <Blotter />
      </div>
      <div className="flex flex-col gap-2">
        <OrderTicket symbol={sel} />
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
          <OrderBook q={q} />
          <div className="h-56"><TimeSales q={q} /></div>
        </div>
      </div>
    </div>
  );
}

function OrderTicket({ symbol }: { symbol: string }) {
  const quotes = useQuotes();
  const q = quoteOf(quotes, symbol);
  const dp = dpOf(symbol);
  const { data: acct } = useAccount();
  const { data: holdings = [] } = useHoldings();
  const qc = useQueryClient();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<"market" | "limit">("market");
  const [qty, setQty] = useState(10);
  const [lim, setLim] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const cash = Number(acct?.profile?.virtual_balance ?? 0);
  const owned = Number(holdings.find((h) => h.symbol === symbol)?.quantity ?? 0);
  const px = type === "limit" ? Number(lim) || q.price : q.price;
  const total = qty * px;
  const steps = [1, 10, 100];

  useEffect(() => { setLim(q.price.toFixed(dp)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [symbol]);

  function review() {
    if (qty <= 0) { toast.error("Enter a quantity"); return; }
    if (side === "buy" && !canBuy(cash, qty, px)) { toast.error("Not enough virtual cash"); return; }
    if (side === "sell" && qty > owned) { toast.error("Not enough units to sell"); return; }
    setConfirm(true);
  }
  async function submit() {
    setBusy(true);
    if (type === "market") {
      const { error } = await supabase.rpc("place_trade", { _symbol: symbol, _side: side, _qty: qty, _price: q.price });
      if (error) toast.error(error.message);
      else toast.success(`${side === "buy" ? "Bought" : "Sold"} ${qty} ${symbol} @ ${fmtP(q.price, dp)}`);
    } else {
      const { error } = await supabase.from("orders").insert({ user_id: acct!.user.id, symbol, side, order_type: "limit", quantity: qty, limit_price: Number(lim) });
      if (error) toast.error(error.message);
      else toast.success(`Limit ${side} ${qty} ${symbol} @ ${lim} working`);
    }
    setBusy(false);
    setConfirm(false);
    qc.invalidateQueries();
  }

  return (
    <div className="ws-panel">
      <PanelHead title="Order ticket" right={<span className="text-xs font-semibold">{symbol}</span>} />
      <div className="space-y-3 p-3">
        <div className="grid grid-cols-2 gap-1 rounded-sm bg-muted p-0.5">
          {(["buy", "sell"] as const).map((s) => (
            <button key={s} onClick={() => setSide(s)} className={`rounded-sm py-1.5 text-xs font-semibold uppercase ${side === s ? (s === "buy" ? "bg-gain text-primary-foreground" : "bg-loss text-primary-foreground") : "text-muted-foreground"}`}>{s}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {(["market", "limit"] as const).map((x) => (
            <button key={x} onClick={() => setType(x)} className={`rounded-sm border py-1 capitalize ${type === x ? "border-primary text-primary" : "text-muted-foreground"}`}>{x}</button>
          ))}
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[11px] text-muted-foreground"><span>Quantity</span><span>Owned {owned}</span></div>
          <div className="flex gap-1">
            <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(0, Number(e.target.value)))} className="h-8 num text-sm" />
            {steps.map((s) => <button key={s} onClick={() => setQty(qty + s)} className="rounded-sm border px-2 text-[11px] num hover:bg-muted">+{s}</button>)}
          </div>
        </div>
        {type === "limit" && (
          <div>
            <div className="mb-1 text-[11px] text-muted-foreground">Limit price</div>
            <Input type="number" step="any" value={lim} onChange={(e) => setLim(e.target.value)} className="h-8 num text-sm" />
          </div>
        )}
        <div className="space-y-1 rounded-sm bg-muted p-2 text-[11px] num">
          <div className="flex justify-between"><span className="text-muted-foreground">Bid / Ask</span><span>{fmtP(q.price * 0.9998, dp)} / {fmtP(q.price * 1.0002, dp)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Est. total</span><span>{fmt(total)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Commission</span><span>{fmt(0)} (sim)</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Available cash</span><span>{fmt(cash)}</span></div>
        </div>
        <Button onClick={review} className={`w-full ${side === "buy" ? "bg-gain hover:bg-gain/90" : "bg-loss hover:bg-loss/90"}`}>
          Review {side} order
        </Button>
      </div>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm {type} {side} order</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm num">
            <div className="flex justify-between"><span className="font-sans text-muted-foreground">Instrument</span><span>{symbol}</span></div>
            <div className="flex justify-between"><span className="font-sans text-muted-foreground">Quantity</span><span>{qty}</span></div>
            <div className="flex justify-between"><span className="font-sans text-muted-foreground">Price</span><span>{type === "market" ? `Market (~${fmtP(q.price, dp)})` : fmtP(Number(lim), dp)}</span></div>
            <div className="flex justify-between"><span className="font-sans text-muted-foreground">Est. total</span><span>{fmt(total)}</span></div>
            <p className="pt-2 font-sans text-xs text-muted-foreground">Simulated order using virtual funds.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button disabled={busy} onClick={submit}>Transmit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Blotter() {
  const [tab, setTab] = useState<"Positions" | "Orders" | "Trades" | "Summary">("Positions");
  const quotes = useQuotes();
  const { data: holdings = [] } = useHoldings();
  const { data: orders = [] } = useOrders();
  const { data: tx = [] } = useTransactions();
  const { data: acct } = useAccount();
  const qc = useQueryClient();
  const cash = Number(acct?.profile?.virtual_balance ?? 0);
  const mv = holdings.reduce((s, h) => s + Number(h.quantity) * quoteOf(quotes, h.symbol).price, 0);
  const cost = holdings.reduce((s, h) => s + Number(h.quantity) * Number(h.avg_cost), 0);
  const trades = tx.filter((t) => t.kind === "buy" || t.kind === "sell").slice(0, 25);

  async function cancel(id: string) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["orders"] });
  }

  const th = "px-3 py-1.5 text-left font-medium";
  return (
    <div className="ws-panel">
      <div className="flex border-b">
        {(["Positions", "Orders", "Trades", "Summary"] as const).map((x) => (
          <button key={x} onClick={() => setTab(x)} className={`border-b-2 px-4 py-2 text-xs ${tab === x ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>
            {x}{x === "Orders" && orders.filter((o) => o.status === "working").length > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{orders.filter((o) => o.status === "working").length}</span>}
          </button>
        ))}
      </div>
      <div className="max-h-64 overflow-auto">
        {tab === "Positions" && (
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-muted-foreground"><tr><th className={th}>Instrument</th><th className={th}>Position</th><th className={th}>Avg cost</th><th className={th}>Last</th><th className={th}>Mkt value</th><th className={th}>Unrl. P&L</th></tr></thead>
            <tbody className="num">
              {holdings.map((h) => {
                const p = quoteOf(quotes, h.symbol).price, dp = dpOf(h.symbol);
                const pnl = (p - Number(h.avg_cost)) * Number(h.quantity);
                return <tr key={h.id} className="border-t"><td className="px-3 py-1.5 font-sans font-semibold">{h.symbol}</td><td className="px-3">{Number(h.quantity)}</td><td className="px-3">{fmtP(Number(h.avg_cost), dp)}</td><td className="px-3">{fmtP(p, dp)}</td><td className="px-3">{fmt(p * Number(h.quantity))}</td><td className={`px-3 ${pnl >= 0 ? "text-gain" : "text-loss"}`}>{fmt(pnl)}</td></tr>;
              })}
              {holdings.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center font-sans text-muted-foreground">No open positions</td></tr>}
            </tbody>
          </table>
        )}
        {tab === "Orders" && (
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-muted-foreground"><tr><th className={th}>Time</th><th className={th}>Instrument</th><th className={th}>Side</th><th className={th}>Qty</th><th className={th}>Limit</th><th className={th}>Status</th><th /></tr></thead>
            <tbody className="num">
              {orders.map((o) => (
                <tr key={o.id} className="border-t"><td className="px-3 py-1.5 text-muted-foreground">{new Date(o.created_at).toLocaleTimeString("en-GB")}</td><td className="px-3 font-sans font-semibold">{o.symbol}</td><td className={`px-3 uppercase ${o.side === "buy" ? "text-gain" : "text-loss"}`}>{o.side}</td><td className="px-3">{Number(o.quantity)}</td><td className="px-3">{fmtP(Number(o.limit_price), dpOf(o.symbol))}</td><td className="px-3 font-sans capitalize">{o.status}</td>
                  <td className="px-3 text-right">{o.status === "working" && <button onClick={() => cancel(o.id)} className="font-sans text-loss hover:underline">Cancel</button>}</td></tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center font-sans text-muted-foreground">No orders</td></tr>}
            </tbody>
          </table>
        )}
        {tab === "Trades" && (
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase text-muted-foreground"><tr><th className={th}>Time</th><th className={th}>Instrument</th><th className={th}>Side</th><th className={th}>Qty</th><th className={th}>Price</th><th className={th}>Amount</th></tr></thead>
            <tbody className="num">
              {trades.map((t) => <tr key={t.id} className="border-t"><td className="px-3 py-1.5 text-muted-foreground">{new Date(t.created_at).toLocaleString("en-GB")}</td><td className="px-3 font-sans font-semibold">{t.symbol}</td><td className={`px-3 uppercase ${t.kind === "buy" ? "text-gain" : "text-loss"}`}>{t.kind}</td><td className="px-3">{Number(t.quantity)}</td><td className="px-3">{fmtP(Number(t.price), dpOf(t.symbol ?? ""))}</td><td className="px-3">{fmt(Number(t.amount))}</td></tr>)}
              {trades.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center font-sans text-muted-foreground">No trades yet</td></tr>}
            </tbody>
          </table>
        )}
        {tab === "Summary" && (
          <div className="grid grid-cols-2 gap-px bg-border text-xs md:grid-cols-4">
            {[["Net liquidation", fmt(cash + mv)], ["Cash", fmt(cash)], ["Market value", fmt(mv)], ["Unrealized P&L", fmt(mv - cost)], ["Buying power (sim 2x)", fmt(cash * 2)], ["Practice bonus", fmt(Number(acct?.profile?.bonus ?? 0))], ["Positions", String(holdings.length)], ["Working orders", String(orders.filter((o) => o.status === "working").length)]].map(([l, v]) => (
              <div key={l} className="bg-card p-3"><div className="text-[10px] uppercase text-muted-foreground">{l}</div><div className="num mt-1 text-sm">{v}</div></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
