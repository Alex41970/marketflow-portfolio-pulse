# Make the Markets pages fully clickable

## What I found
I tested the Markets pages in a browser. The Stocks / ETFs / FX / Crypto tabs and the Forex, ETF, Stocks and Crypto pages do load. Most of what you see there still can't be clicked, though:
- Instrument rows (EUR.USD, BTC.SIM, LUMA...) do nothing when clicked.
- On a sub-page like Forex, the table shows a single tab ("FX") that goes nowhere.
- The "Markets" breadcrumb at the top is plain text, not a link.
- When you're on a Markets sub-page, the header doesn't highlight "Markets".

## What I'll change
1. **Clickable instruments.** Every row in a markets table links to a new instrument page for that symbol.
2. **New instrument page** (for example /markets/quote/EUR.USD), showing:
   - name, asset class, the live simulated price and the day's change
   - a candlestick chart with 1D / 1W / 1M / 6M / 1Y buttons that switch the view
   - day high and low, open, a simulated bid/ask and volume
   - a short description, plus related instruments from the same class (also clickable)
   - "Trade in the demo" and "Add to watchlist" buttons. Signed-in users go to the workstation; everyone else goes to sign up
   - the "simulated / virtual funds" label, kept clearly visible
3. **Real tabs on sub-pages.** On Forex, ETFs, Stocks and Crypto, the tab bar shows all four classes as links to the matching pages, with the current one highlighted.
4. **Breadcrumbs become links.** "Markets" in the breadcrumb goes back to the Markets overview.
5. **Header highlight.** "Markets" (and "Platform") stay highlighted on their sub-pages.
6. I'll check every link in a browser: tabs, rows, breadcrumbs, related instruments and buttons.

## Technical details
- New route `src/routes/markets_.quote.$symbol.tsx`. It checks the symbol against `TICKERS` and shows a not-found page for unknown symbols. It gets its own head() metadata.
- `MarketsTable`: rows become `<Link to="/markets/quote/$symbol">`. When `fixedClass` is set, the tabs become Links to the class routes.
- `ContentPage` crumbs accept `{label, to}` items. `MarketClassPage` passes a link for "Markets".
- `SiteChrome` nav: remove `exact` from the top-level link's active match, so sub-pages highlight the parent.
- The chart reuses `LazyChart` with a range state. All prices stay client-side simulations of the fictional tickers.
