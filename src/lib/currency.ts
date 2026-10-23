export const ACCOUNT_CURRENCY = "EUR";
export const fmt = (n: number) => n.toLocaleString("en-IE", {
  style: "currency", currency: ACCOUNT_CURRENCY,
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});
export const compactMoney = (n: number) => Math.abs(n) >= 1000 ? `€${(n / 1000).toFixed(0)}k` : `€${n.toFixed(0)}`;