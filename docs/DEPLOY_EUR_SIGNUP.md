# Deploy euro accounts and the new signup form

## 1. Upgrade the buyer's existing database first
Open the buyer's database SQL editor and run the entire contents of `docs/upgrade-eur-signup.sql` once. Do not run `docs/setup.sql` again on an existing database: that file is only for a new, empty database.

The upgrade adds name, phone, account type and agreement date to profiles. New registrations store these fields automatically and still start at zero. Existing users remain untouched; their new fields may be blank. It does not grant client permission to edit balances or give new users admin access.

**Currency note:** existing numbers are unchanged and are now displayed as EUR. No exchange rate is applied. Review any existing balance, transaction or pending funding request before using this as a real euro ledger. Review bank payment settings and explicitly set EUR bank details; existing bank/wallet configuration is not overwritten. Crypto request amounts are account amounts in EUR, not coin quantities.

## 2. Update the VPS from the connected GitHub branch
Wait until the changes are visible on GitHub. These commands assume your connected branch is `main`, your app folder is `/var/www/marketflow-portfolio-pulse`, and your PM2 process is `portal`.

```bash
cd /var/www/marketflow-portfolio-pulse
# Confirm the server is on main before pulling. Do not discard local changes.
git branch --show-current
git pull --ff-only origin main
bun install --frozen-lockfile
NITRO_PRESET=node-server bun run build
```

Stop if any command fails. The existing `.env` must stay in the project folder with the buyer's database keys. Never commit it. The VITE values are included at build time; the matching server variables must be available to the running process as well.

After the build succeeds, restart the existing PM2 process:

```bash
sudo chown -R www-data:www-data .output/public
sudo chmod -R 755 .output/public
pm2 restart portal --update-env
pm2 save
pm2 logs portal --lines 30 --nostream
curl -I http://127.0.0.1:3000
```

If `portal` was not configured to run `.output/server/index.mjs`, use your VPS deployment helper to update its startup command and preserve its environment. The Node build preset is required; do not run the default Worker output with PM2. If old asset errors return after restart, recreate the PM2 process against the new Node output, preserving its environment.

## 3. Check the actual website
- Hard-refresh or use a private browser window.
- Register a new Personal or Business account with name, phone, matching passwords and terms agreement.
- If confirmation is enabled, confirm the email then log in. If disabled, signup should open the overview immediately. This update does not change your email confirmation setting.
- Check the Account page shows the new details and EUR; a new account starts at €0.00.
- As admin, open Users & funds, select the user and check name, phone, account type and agreement date.
- Review EUR labels in funding, portfolio, transactions and charts, and update bank details to EUR as needed.

## Legal copy still needs the buyer
The new Terms and Conditions and Privacy Notice pages are clearly marked drafts. Ask the buyer for their approved legal wording, operator identity and privacy contact before accepting customer registrations. No licensing, fees, data-retention policy or legal jurisdiction has been invented as fact.

Lovable preview has been updated separately. The buyer's external database and VPS are not updated until you run the SQL and deployment commands above.
