<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Balance/bonus/trade changes go only through SECURITY DEFINER SQL functions (place_trade, admin_adjust); profiles has no client UPDATE grant so users can't edit their own funds.
- Admin password ops run in createServerFn with requireSupabaseAuth + has_role check before loading supabaseAdmin.
- All market prices are client-side simulations of fictional tickers; never present them as real market data.
- The app must keep an original brand; never imitate a real broker. Market prices on the public site are generated, so label them "indicative", never as live exchange data.
- Brand name, logo letters, tagline and footer text are admin-editable in the site_settings singleton (read via useBrand); src/lib/brand.ts only holds fallbacks and static page titles.
- Signed-in area is a view-only client portal (balance, bonus, transactions, account, admin); all trading happens externally in MT4/MT5, so no web trading UI. place_trade, orders and holdings are deprecated/unused.
- Top-ups/withdrawals go through funding_requests; only create_funding_request and admin-only decide_funding_request (SECURITY DEFINER) change state, so balances move only on admin approval.
- Account currency formatting is centralized in src/lib/currency.ts; market quote rates remain plain numbers and FX identities stay unchanged, avoiding accidental rate conversion.
- Signup validation and safe metadata mapping live in src/lib/registration.ts; handle_new_user persists profile details while assigning only the user role, preventing registration metadata from granting privileges.
- External installations upgrade existing databases with docs/upgrade-eur-signup.sql; docs/setup.sql is for empty databases only, avoiding duplicate schema creation.
