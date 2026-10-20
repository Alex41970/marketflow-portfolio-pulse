# Top-ups, withdrawals and payment settings

## What users get
- **Wallet page** (new menu item "Funding") with two buttons: **Top up** and **Withdraw**.
- **Top up**: pick **Crypto** or **Wire**.
  - Crypto: shows the coins/networks the admin set up (e.g. USDT-TRC20, BTC), the wallet address with a copy button and a QR code.
  - Wire: shows the bank details the admin set up (bank name, account holder, IBAN/account no., SWIFT, reference to use, which is the user's account number).
  - User enters the amount (and optionally a transaction ID / reference) and clicks "I've sent it", creating a **pending top-up request**.
- **Withdraw**: choose Crypto (enter their wallet + network) or Wire (enter their bank details), enter amount. Can't exceed their balance. Creates a **pending withdrawal request**.
- A **Requests** list on the same page showing each request's status: Pending, Approved, Declined (with the admin's note).

## What the admin gets
- **Requests** page: tabs for Withdrawals and Top-ups, filter by status, each row shows user, amount, method, details, date. **Approve** / **Decline** buttons with a note.
  - Approving a top-up adds the amount to the user's balance.
  - Approving a withdrawal deducts it from the balance (checked again at approval time so it can't go negative).
  - Every decision is written to the audit log and shows in the user's transactions.
- **Payment settings** page: add/edit/remove crypto wallets (coin, network, address, on/off) and the bank wire details. These are what users see when they click Top up.
- A small badge on the admin menu with the number of pending requests.

## Important note
The site still carries the "virtual funds only" strip (a fixed project rule). While that strip is up, the payment details should be demo values only. Taking real money needs the strip removed, proper licensing and terms from the company, which is their decision before going live.

## Technical details
- New tables: `funding_requests` (user_id, kind deposit|withdrawal, method crypto|wire, amount, currency/network, user details jsonb, reference, status pending|approved|declined, admin_note, decided_by, decided_at) and `payment_methods` (kind crypto|wire, label, network, details jsonb, active, sort). GRANTs + RLS: users select/insert own pending requests only; everyone signed in reads active payment methods; only admins (has_role) write payment methods.
- SECURITY DEFINER functions: `create_withdrawal(...)` (checks balance), `decide_funding_request(_id, _approve, _note)` (admin-only; updates balance, inserts transaction + audit row atomically). Balances still never changed from the client.
- Routes: `_authenticated/funding.tsx`, `_authenticated/admin.requests.tsx`, `_authenticated/admin.payments.tsx`; sidebar links in the portal shell. QR via a small client-side library.
- Add TX labels for deposit/withdrawal; add a test for the "can't withdraw more than balance" rule.
