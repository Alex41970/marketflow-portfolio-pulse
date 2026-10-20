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
- The app must keep an original brand and a visible "virtual funds only" banner; never imitate a real broker.
- Brand name/disclaimer live in src/lib/brand.ts so the pilot can be rebranded in one place.
- Signed-in area is a view-only client portal (balance, bonus, transactions, account, admin); all trading happens externally in MT4/MT5, so no web trading UI. place_trade, orders and holdings are deprecated/unused.
