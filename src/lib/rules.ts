// Mirrors the database rules in admin_adjust / place_trade so the UI can warn early.
export function applyAdjustment(current: number, delta: number, reason: string) {
  if (!reason.trim()) return { ok: false as const, error: "Reason required" };
  if (!Number.isFinite(delta) || delta === 0) return { ok: false as const, error: "Enter an amount" };
  const next = Math.round((current + delta) * 100) / 100;
  if (next < 0) return { ok: false as const, error: "Result would be negative" };
  return { ok: true as const, next };
}

export function canBuy(cash: number, qty: number, price: number) {
  return qty > 0 && price > 0 && qty * price <= cash;
}

export const STARTING_BALANCE = 0;
