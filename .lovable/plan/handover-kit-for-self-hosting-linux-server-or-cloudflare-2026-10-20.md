# Handover kit for self-hosting (Linux server or Cloudflare)

## Why there is no "switch account" setting
This project's database is built in and fixed. The company can't swap it from inside the app. To run on their own server, they take the code and connect it to a free Supabase project they create themselves. Your account never touches it.

## What the company needs to provide
- Their own Supabase project (free tier is fine). They need its project URL, its public (anon) key and its service-role key. The service-role key stays secret on their server.
- A place to host the site: a Linux server (VPS) or a Cloudflare account.
- Optional: a domain name, and real MT4/MT5 server details to replace the placeholders.

## What I will add to the project
1. **Handover guide**: a plain-English, step-by-step document that covers:
   - getting the code (Lovable's GitHub sync, or the code download)
   - creating the Supabase project and running the database setup script
   - setting the keys
   - creating the first admin account
   - deploying on a Linux server (Node + a process manager + a web server in front)
   - notes on Cloudflare, with a link to Lovable's official self-hosting guide
2. **One database setup script**: every table, protected function, permission rule and role from this project, combined into one file they paste into their Supabase SQL editor. It covers profiles, roles, transactions, funding requests, payment settings, audit log and the related functions.
3. **Example settings file**: lists every key the site expects, with blank values and comments.
4. **Admin bootstrap snippet**: a single line that makes a chosen email the admin after that person signs up.

## Notes
- This project stays on its current database. Nothing changes for your live preview.
- Lovable doesn't officially support deploying to Cloudflare from here. The guide points to Lovable's self-hosting docs for that route. The Linux server route is fully covered.
- The "virtual funds only" banner stays.

## Technical details
- Docs go in `docs/SELF_HOSTING.md`, `docs/setup.sql` (consolidated from `supabase/migrations`, in order) and `.env.example` (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY).
- VPS: `bun install && bun run build`, then run the built server with Node under pm2/systemd, with nginx reverse proxy and TLS via certbot.
- No app code changes and no new hosting config files.
