# Buyer handover guide (non-technical)

## Short answer for you
Easiest route: the buyer makes a free Lovable account and you transfer or remix the project to them. That gives them their own separate database automatically, with nothing to collect from them.

If they insist on their own Supabase, you need these 4 things from them:

| What | Where they find it | Secret? |
|---|---|---|
| Project URL (https://xxxx.supabase.co) | Supabase > Project Settings > Data API | No |
| Publishable (anon) key | Supabase > Project Settings > API Keys | No |
| Secret (service_role) key | Same page, "Reveal" | YES: never by email or chat, use a password manager share or let them paste it in themselves |
| Project ID (the "xxxx" part) | Project Settings > General | No |

They also need to run one setup file once (docs/setup.sql) and create the first admin account.

## What I will build
A new file `docs/BUYER_GUIDE.md` written for someone with no technical background, with numbered click-by-click steps:
1. Create a Supabase account (supabase.com > Start your project, sign in with Google).
2. Create a new project: pick a name, a strong database password (save it), and a region near their customers. Wait about 2 minutes.
3. Run the setup: open SQL Editor > New query > paste the contents of setup.sql > Run. It should say "Success".
4. Turn on email sign-in and set the site address under Authentication > URL Configuration.
5. Copy the 4 values from the table above.
6. Share them safely: the 3 non-secret values by email; the secret key only through a one-time secure link (for example 1Password or Bitwarden Send), or they paste it into the hosting settings themselves.
7. Create their admin: sign up on the site, then in SQL Editor run one provided line that makes their email an admin.
8. A checklist of what to send back to you, and what they should never share (database password, secret key in plain text).

Also includes a one-page "Option A: Lovable transfer" section, which is the recommended path for a non-technical buyer.

## Technical notes
- Keys map to .env.example: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID, SUPABASE_SERVICE_ROLE_KEY (server-only, used for admin password reset).
- Link to existing docs/SELF_HOSTING.md for the deployment part; setup.sql is still untested on a fresh project, so the guide adds a "if Run shows an error, send a screenshot" step.
- Update setup.sql to include the new branding settings table so a fresh install has it.
