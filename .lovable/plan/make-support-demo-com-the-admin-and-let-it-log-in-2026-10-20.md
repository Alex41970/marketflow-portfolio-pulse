# Make support@demo.com the admin and let it log in

## What I'll do
1. Mark the account **support@demo.com** (already signed up) as confirmed, so it can log in straight away without the email link. demo.com isn't a real inbox you control, so the confirmation email would never arrive.
2. Give that account the admin role, so it can open the admin panel.
3. Check that the account appears in the admin panel's user list with the $100,000 starting balance.

## What doesn't change
- New sign-ups still need to confirm their email. Ask if you'd like to turn that off for the demo too.
- No changes to the site's design.

## Technical details
- Data-only changes, run directly against the database (not as a migration): set `email_confirmed_at = now()` on the auth user `18b9503e-dcb0-40fb-80cf-fa6bfffc6930`, and insert `(user_id, 'admin')` into `public.user_roles`.
- Verify that the profile row exists, and that `has_role` returns true.
