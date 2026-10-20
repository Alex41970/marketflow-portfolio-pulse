/** Mirrors create_funding_request: a withdrawal can't exceed balance minus other pending withdrawals. */
export function canWithdraw(balance: number, pendingWithdrawals: number, amount: number) {
  return amount > 0 && amount + pendingWithdrawals <= balance;
}

export const STATUS_STYLE: Record<string, string> = {
  pending: "bg-accent text-accent-foreground",
  approved: "bg-gain/15 text-gain",
  declined: "bg-loss/15 text-loss",
};

export type Det = { address?: string; bank?: string; holder?: string; iban?: string; swift?: string; network?: string; notes?: string };
