import { useEffect, useState } from "react";

export type Ticker = { symbol: string; name: string; base: number };

// Fictional symbols — simulated prices, not real market data.
export const TICKERS: Ticker[] = [
  { symbol: "NOVA", name: "Nova Robotics", base: 182.4 },
  { symbol: "KLPR", name: "Kelper Energy", base: 64.15 },
  { symbol: "BRIX", name: "Brixton Materials", base: 41.8 },
  { symbol: "QNTM", name: "Quantum Freight", base: 256.9 },
  { symbol: "HALO", name: "Halo Health", base: 98.3 },
  { symbol: "ORCA", name: "Orca Marine", base: 23.55 },
  { symbol: "VRDN", name: "Viridian Foods", base: 71.2 },
  { symbol: "ZPHR", name: "Zephyr Air", base: 133.65 },
];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function history(t: Ticker, points = 90) {
  const rnd = seeded(t.symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  let p = t.base * 0.9;
  return Array.from({ length: points }, (_, i) => {
    p = Math.max(1, p * (1 + (rnd() - 0.48) * 0.03));
    return { i, price: +p.toFixed(2) };
  });
}

export function useLivePrices() {
  const [prices, setPrices] = useState<Record<string, { price: number; open: number }>>(() =>
    Object.fromEntries(
      TICKERS.map((t) => {
        const last = history(t).at(-1)!.price;
        return [t.symbol, { price: last, open: last }];
      }),
    ),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          const p = next[k].price * (1 + (Math.random() - 0.5) * 0.004);
          next[k] = { ...next[k], price: +p.toFixed(2) };
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return prices;
}

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
