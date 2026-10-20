# Practice Trading Simulator (original brand: "Ledgerline Paper Trading")

An original, clearly labeled practice trading app. All money is virtual. No real-broker branding, logos or copy. A "Demo – virtual funds only" banner shows on every page.

## Pages
- `/` Landing page: original branding, how practice trading works, sign up and log in buttons.
- `/auth` Sign up (username, email, password) and log in, plus a forgot-password page and a `/reset-password` page.
- `/dashboard` Trading view with a left sidebar, a price chart (simulated prices), a watchlist, an account panel (virtual cash, equity, profit and loss) and a buy/sell ticket.
- `/portfolio` Holdings and their value.
- `/history` Virtual trades and balance changes.
- `/admin` Admins only:
  - A table of users showing username, email, virtual balance and practice bonus.
  - Add or remove virtual credits, with a required reason. Every change is logged.
  - Add or remove practice bonuses.
  - Send a password reset to any user.

## Design
Professional navy and white look with a crisp blue accent, IBM Plex Sans and IBM Plex Mono for numbers, tight data tables, and a fixed sidebar that collapses on mobile.

## Hosting and accounts
- The backend uses Lovable Cloud while you build. To keep your own account separate, the client can connect their own database account in Project Settings, under External Supabase. Their account then owns all the data.
- Things you'll need from the client: their database account (they connect it, or give you its web address plus public and private keys), the domain they want to use, and the email address of the first admin.
- The app can be deployed as a Cloudflare Worker.

## Admin password control
Admins send users a reset link or a temporary password that the user must change at their next login. Admins never see a user's existing password.

## Technical details
- Tables: profiles (username, virtual_balance, bonus), user_roles plus a has_role() function, holdings, transactions, and admin_audit_log. Every table has GRANTs and RLS (row-level security).
- Admin actions run through createServerFn with requireSupabaseAuth. The function checks has_role('admin') before doing anything else, and only then loads supabaseAdmin inside the handler.
- A trigger creates each user's profile with a starting virtual balance of $100,000.
- Prices come from a seeded random walk on the client. No real market data.
- Tests cover the admin-only check and the rule that a balance can't go negative.
