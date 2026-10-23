import { useSyncExternalStore } from "react";

export type AssetClass = "Stocks" | "ETFs" | "FX" | "Crypto";
export type Ticker = { symbol: string; name: string; base: number; cls: AssetClass; dp?: number };

// Fictional instruments — indicative prices, not real market data.
export const TICKERS: Ticker[] = [
  { symbol: "NOVA", name: "Nova Robotics", base: 182.4, cls: "Stocks" },
  { symbol: "KLPR", name: "Kelper Energy", base: 64.15, cls: "Stocks" },
  { symbol: "BRIX", name: "Brixton Materials", base: 41.8, cls: "Stocks" },
  { symbol: "QNTM", name: "Quantum Freight", base: 256.9, cls: "Stocks" },
  { symbol: "HALO", name: "Halo Health", base: 98.3, cls: "Stocks" },
  { symbol: "ORCA", name: "Orca Marine", base: 23.55, cls: "Stocks" },
  { symbol: "VRDN", name: "Viridian Foods", base: 71.2, cls: "Stocks" },
  { symbol: "ZPHR", name: "Zephyr Air", base: 133.65, cls: "Stocks" },
  { symbol: "LUMA", name: "Luma Semiconductors", base: 412.1, cls: "Stocks" },
  { symbol: "PYRE", name: "Pyre Defense", base: 88.7, cls: "Stocks" },
  { symbol: "WLD500", name: "World 500 Index Fund", base: 512.3, cls: "ETFs" },
  { symbol: "TECHX", name: "Global Tech Leaders", base: 221.4, cls: "ETFs" },
  { symbol: "BNDA", name: "Aggregate Bond Fund", base: 74.9, cls: "ETFs" },
  { symbol: "GLDS", name: "Gold Trust (Indicative)", base: 196.2, cls: "ETFs" },
  { symbol: "EMKT", name: "Emerging Markets Fund", base: 41.3, cls: "ETFs" },
  { symbol: "EUR.USD", name: "Euro / US Dollar", base: 1.0842, cls: "FX", dp: 4 },
  { symbol: "GBP.USD", name: "Pound / US Dollar", base: 1.2715, cls: "FX", dp: 4 },
  { symbol: "USD.JPY", name: "US Dollar / Yen", base: 151.32, cls: "FX", dp: 2 },
  { symbol: "AUD.USD", name: "Aussie / US Dollar", base: 0.6612, cls: "FX", dp: 4 },
  { symbol: "BTC.SIM", name: "Bitcoin (Indicative)", base: 64210, cls: "Crypto" },
  { symbol: "ETH.SIM", name: "Ether (Indicative)", base: 3120, cls: "Crypto" },
  { symbol: "SOL.SIM", name: "Solana (Indicative)", base: 148.6, cls: "Crypto" },
  { symbol: "ADA.SIM", name: "Cardano (Indicative)", base: 0.452, cls: "Crypto", dp: 4 },
  { symbol: "XRP.SIM", name: "XRP (Indicative)", base: 0.531, cls: "Crypto", dp: 4 },
];
export const CLASSES: AssetClass[] = ["Stocks", "ETFs", "FX", "Crypto"];
export const tickerOf = (s: string) => TICKERS.find((t) => t.symbol === s) ?? TICKERS[0]!;
export const dpOf = (s: string) => tickerOf(s).dp ?? 2;

function seeded(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const hash = (s: string) => s.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number };
export const RANGES = { "1D": { n: 78, step: 300 }, "5D": { n: 130, step: 1800 }, "1M": { n: 22, step: 86400 }, "6M": { n: 126, step: 86400 }, "1Y": { n: 252, step: 86400 } } as const;
export type Range = keyof typeof RANGES;
const ANCHOR = 1792540800; // fixed anchor time, deterministic

export function candles(symbol: string, range: Range, endPrice?: number): Candle[] {
  const t = tickerOf(symbol);
  const { n, step } = RANGES[range];
  const rnd = seeded(hash(symbol + range));
  const vol = range === "1D" ? 0.003 : range === "5D" ? 0.005 : 0.015;
  let p = t.base;
  const raw: Candle[] = [];
  for (let i = 0; i < n; i++) {
    const open = p;
    const close = Math.max(open * 0.5, open * (1 + (rnd() - 0.49) * vol * 2));
    const high = Math.max(open, close) * (1 + rnd() * vol);
    const low = Math.min(open, close) * (1 - rnd() * vol);
    raw.push({ time: ANCHOR - (n - i) * step, open, high, low, close, volume: Math.round(2e5 + rnd() * 1.8e6) });
    p = close;
  }
  const k = (endPrice ?? t.base) / p;
  return raw.map((c) => ({ ...c, open: c.open * k, high: c.high * k, low: c.low * k, close: c.close * k }));
}

export function spark(symbol: string, n = 30) {
  return candles(symbol, "1D").slice(-n).map((c) => c.close);
}

// ---- Live quote store (shared across components) ----
export type Quote = { symbol: string; price: number; prev: number; open: number; high: number; low: number; volume: number; tick: -1 | 0 | 1; seq: number };
type Snap = Record<string, Quote>;

let snapshot: Snap | null = null;
function initial(): Snap {
  if (!snapshot) {
    snapshot = Object.fromEntries(
      TICKERS.map((t) => {
        const r = seeded(hash(t.symbol));
        const open = t.base * (1 + (r() - 0.5) * 0.03);
        return [t.symbol, { symbol: t.symbol, price: t.base, prev: t.base, open, high: Math.max(open, t.base) * 1.006, low: Math.min(open, t.base) * 0.994, volume: Math.round(r() * 4e6), tick: 0, seq: 0 } as Quote];
      }),
    );
  }
  return snapshot;
}
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
function step() {
  const cur = initial();
  const next: Snap = { ...cur };
  for (const t of TICKERS) {
    if (Math.random() < 0.45) continue;
    const q = cur[t.symbol]!;
    const v = t.cls === "Crypto" ? 0.003 : t.cls === "FX" ? 0.0006 : 0.0018;
    const price = q.price * (1 + (Math.random() - 0.5) * v * 2);
    next[t.symbol] = { ...q, prev: q.price, price, high: Math.max(q.high, price), low: Math.min(q.low, price), volume: q.volume + Math.round(Math.random() * 5000), tick: price > q.price ? 1 : -1, seq: q.seq + 1 };
  }
  snapshot = next;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  if (!timer) timer = setInterval(step, 1500);
  return () => {
    listeners.delete(l);
    if (!listeners.size && timer) { clearInterval(timer); timer = null; }
  };
}
export function useQuotes() {
  return useSyncExternalStore(subscribe, initial, initial);
}
export const quoteOf = (q: Snap, s: string) => q[s] ?? initial()[s] ?? initial()[TICKERS[0]!.symbol]!;

export const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtP = (n: number, dp = 2) => n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
export const pct = (a: number, b: number) => ((a - b) / b) * 100;
export const signed = (n: number, dp = 2) => (n >= 0 ? "+" : "") + fmtP(n, dp);
