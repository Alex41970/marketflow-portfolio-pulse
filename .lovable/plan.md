# Awards section + fully dynamic branding

## 1. "Awards" section above "Learn by doing" (home page)
- New section in the site's own style (navy/blue, IBM Plex): centred heading, 4 round/shield badges drawn in-house (no copied logos), a caption under each, and an outlined "See all awards" button.
- Important: the screenshot shows real awards from BrokerChooser, StockBrokers.com, NerdWallet and Investing in the Web. Those were won by another broker, so showing them on this site would be a false claim. The badges will use neutral placeholder wording (e.g. "Client Service Excellence 2026") and the award text is **editable by the admin**, so you can enter only awards the company has actually won.
- Admin: new "Awards" block on the Branding page — show/hide the section, edit heading, and up to 4 badges (title, year, caption). Hidden by default until filled in.
- "See all awards" links to the Press page.

## 2. Make branding fully dynamic
Replace every hard-coded "Ledgerline" in visible text with the name from the Branding settings:
- Sign-up / login side panel ("Ledgerline Markets · EUR client accounts").
- Client overview MT4/MT5 server name ("Ledgerline-Live" becomes "<Brand>-Live").
- Terms and Privacy pages, reset-password page, portal pages and admin pages.
- Browser tab titles and share text: these load before the settings, so they will read the brand from the settings on the server when the page loads, falling back to the default.

## Technical details
- Migration: add `awards jsonb` and `awards_enabled boolean default false` to `site_settings`; extend `useBrand` and the Branding admin form. Add the same columns to `docs/upgrade-eur-signup.sql`-style file `docs/upgrade-branding-awards.sql` for the VPS database.
- Head titles: a shared server-safe `getBrand()` (public read of `site_settings`) used in route loaders, `head()` reads loader data; fallback to `src/lib/brand.ts`.
- `rg Ledgerline src` must return only `src/lib/brand.ts` fallbacks afterwards.
