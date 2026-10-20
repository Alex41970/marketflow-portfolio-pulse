# Pro-grade redesign: broker-style pilot

The goal is a pilot that looks like a serious, institutional brokerage: dense, data-rich and polished, with the same feel as big platforms like Interactive Brokers, Schwab or Saxo. It will not copy their logo, name, wording or exact page layouts. That is what keeps the pilot safe to show a client, and the company's own brand drops straight in later.

The brand name and logo live in one place, so swapping in the client's name takes a few seconds.

## 1. Marketing site (public), rebuilt to institutional quality
- A top utility bar (language, "Demo environment" pill, Log in) above a main navigation with menus: Trading, Markets, Pricing, Education, About.
- A hero section with a strong headline, two calls to action, and a realistic product screenshot made from the real dashboard. The screenshot sits in a device frame.
- A live ticker tape across the page with moving simulated prices.
- A stats strip: "150+ simulated markets", "$100K virtual capital", "0 real risk".
- Feature sections with alternating image and text: Pro workstation, Mobile, Risk tools, Education.
- A "Markets" table preview with tabs for Stocks, ETFs, FX and Crypto, all with simulated data.
- A pricing comparison card styled like a broker's fee table, labeled "illustrative".
- A large footer with a sitemap, a full demo disclaimer block and a risk-warning paragraph.
- New pages, each with real content: /markets, /pricing, /platform, /about.

## 2. Trading workstation (signed in), rebuilt as a pro desk
- Choice of dark or light theme. Dark is the default, like a pro trading screen.
- A top bar with account selector, net liquidation value, day profit and loss, buying power, a symbol search with a dropdown, and a clock.
- A resizable multi-panel layout:
  - Left: watchlists with tabs, small trend lines and colored price flashes.
  - Center: a candlestick chart with 1D, 5D, 1M, 6M and 1Y time ranges, plus volume bars and a moving-average line.
  - Right: an order ticket with market and limit orders, buy and sell buttons, quantity steps, estimated cost and a confirmation step.
  - Bottom tabs: Positions, Orders, Trades, Account summary.
- Market depth (Level 2) and time and sales panels, both simulated.
- A news panel with made-up headlines, each tagged "simulated".
- A portfolio page with allocation and performance charts.
- A history page with filters and CSV export.
- An account page with balances, margin view, a placeholder for statements, and profile settings.

## 3. Admin panel rebuilt as a back-office console
- Key numbers at the top: total users, total virtual funds, active today, and bonuses issued.
- A user table with search, sorting, paging and status badges.
- A user detail drawer with tabs: Overview, Funds and bonus (adjust with a reason), Password (reset link or temporary password), and an Audit log.
- A global audit log page.

## 4. Disclaimers everywhere
- A persistent banner on every page.
- A disclaimer in the footer.
- A notice on first login that the user must accept.
- Every price is labeled "Simulated".

## Technical details
- Add `lightweight-charts` for candlesticks and depth. It loads only in the browser, through a lazy import.
- New fake data: per-symbol price history with open, high, low, close and volume, generated client-side by a seeded random walk across 4 asset classes. Order book and time and sales are generated from the latest price.
- Limit orders are stored in a new `orders` table with GRANTs and RLS, and fill when the simulated price crosses the limit. They are checked on the client and settled through the existing `place_trade` function.
- Design tokens get a full dark theme, a denser type scale, and colors for price flashing up and down. Every color comes from a token.
- Product screenshots for the marketing pages are taken from the real workstation with Playwright and saved under `src/assets`.
- Existing database rules stay in place: balances change only through server functions, and admin checks use `has_role`.
