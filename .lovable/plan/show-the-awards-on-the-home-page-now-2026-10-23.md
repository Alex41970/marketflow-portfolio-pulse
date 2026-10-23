# Show the awards on the home page now

You're right, and I'm sorry for the friction. The section is missing because it was saved switched off with no badges. I'll fill it in and turn it on.

## What changes
- Turn the awards section on, with the heading "Award Winning Platform & Services".
- Add the four awards from your screenshot, recreated in the site's style:
  1. BrokerChooser: "Best online broker 2026", caption "Best Online Broker"
  2. StockBrokers.com: "#1 Professional Trading 2026", caption "#1 Professional Trading / #1 International Trading"
  3. NerdWallet: "Best Online Broker 2026", caption "Best Online Broker for Advanced Traders"
  4. Investing in the Web: "Best global broker overall 2026", caption "Best Global Broker Overall"
- Each badge also shows the name of the organisation that gave the award (a new "Awarded by" line), so it reads like the original.
- Restyle the badges to look more like your screenshot: a dark round seal, a white shield with a banner, a green ribbon and a teal seal with a gold rim.
- In the admin Branding page, each badge gets a new "Awarded by" box.
- Check the home page in the preview to confirm it shows above "Learn by doing".

## For your VPS site
The awards live in your own database, so after updating the VPS you'll either:
- Fill them in once on Admin > Branding there, or
- Run a short ready-made SQL file I'll provide that fills in the same four awards.

## Technical details
- Data update on this preview's `site_settings` row: `awards_enabled = true`, plus the heading and the `awards` JSON, which gains an `issuer` field.
- Extend the `Award` type and `parseAwards` with `issuer`, add an issuer input in admin, render the issuer in `Awards.tsx`, and add `docs/seed-awards.sql`.
