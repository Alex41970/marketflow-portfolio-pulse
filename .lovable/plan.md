# Client portal redesign: no web trading, bank-style dashboard

## What changes for you
1. **Pop-up removed.** The "accept terms" pop-up with no close button will no longer appear after log-in. The thin "Demo / virtual funds" strip stays at the top of every page; it's a fixed project rule.
2. **All web trading removed.** The trading screen, charts with buy/sell, order ticket, order book and working orders are gone from the signed-in area. The public site's "Launch the workstation" / "Trade in the demo" buttons change to "Client portal" / "Open account".
3. **New look: a calm private-bank style portal.** Light by default, white cards, navy sidebar, generous spacing, clean numbers, no flashing ticker. The dark/light switch is kept.

## Client pages (left sidebar)
- **Overview** (new home after log-in):
  - welcome line with the account number
  - four headline cards: Account balance, Bonus, Total (balance + bonus), Last activity
  - balance-over-time chart, built from the account's history
  - recent transactions (last 5) with "View all"
  - a **Trading platforms** card stating that trading happens in MetaTrader 4 / MetaTrader 5, with download buttons for Windows, Mac, iOS and Android (links to the official MetaQuotes downloads) and an illustrative server name
- **Portfolio:** allocation and balance breakdown (cash, bonus, total), plus a statement-style summary. Trade holdings are removed, since trades live in MT4/MT5.
- **Transactions:** full history (deposits/credits, withdrawals/debits, bonus added/removed, adjustments) with filters by type and date, search, and CSV download.
- **Account:** profile details (username, email, account number, member since), change password, sign out.
- **Admin** (only for admins): unchanged features, restyled to match.
  - all users table: username, email, balance, bonus status, last seen
  - add/remove funds with a reason
  - add/remove bonus with a reason
  - reset a user's password directly
  - audit log of every admin action

## What stays the same
- Log-in, sign-up and password reset.
- Every balance or bonus change still goes only through the protected admin actions and is recorded.
- The public marketing pages (apart from the button wording above).

## Technical details
- `_authenticated/route.tsx`: delete the `DisclaimerGate` render and component, and drop the `accept_disclaimer` call path. Keep the `ForceChange` dialog (the admin-reset password flow) but give it a close/later option. Rebuild the shell as a light, card-based layout: sidebar links Overview / Portfolio / Transactions / Account / Admin / Audit. Remove the Net liq./Buying power/Day P&L header metrics and the live quote hooks.
- `dashboard.tsx`: replace the workstation with the Overview page. Remove the imports of the order ticket, order book, time & sales and LazyChart-with-ticket. The balance chart is derived from `transactions` running totals (a simple SVG/recharts area chart).
- `portfolio.tsx`: drop the holdings table and use profile balance/bonus. `history.tsx` is renamed in the UI to Transactions and gets filters plus CSV export.
- No database schema changes. `place_trade` and the `orders`/`holdings` tables are left in place but unused, and marked deprecated in AGENTS.md.
- Public pages: update CTA copy and links to `/auth` / `/dashboard`.
- Add an MT4/MT5 note to AGENTS.md: trading is external; the portal is view-only.
- Verify: sign in as the admin, check that no pop-up appears, check every sidebar page renders, and test an admin fund and bonus adjustment end to end.
