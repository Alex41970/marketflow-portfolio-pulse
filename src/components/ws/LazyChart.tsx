import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { Range } from "@/lib/market";

const CandleChart = lazy(() => import("./CandleChart"));

export function LazyChart(props: { symbol: string; range: Range; price: number; height?: number }) {
  const fb = <div style={{ height: props.height ?? 360 }} className="w-full animate-pulse rounded-sm bg-muted" />;
  return (
    <ClientOnly fallback={fb}>
      <Suspense fallback={fb}><CandleChart {...props} /></Suspense>
    </ClientOnly>
  );
}
