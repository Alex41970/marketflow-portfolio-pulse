# Self-hosting the Ledgerline client portal

This guide is for the company receiving the project. They run it on their own server and their own database account. The developer's account is not involved.

## 1. What you need
- A free Supabase account and a new project.
- A Linux server (Ubuntu 22.04+ recommended) **or** a Cloudflare account.
- A domain name pointed at your server (optional but recommended).

## 2. Get the code
In Lovable, either connect GitHub (Project settings -> Git) and clone the repository, or use **Download codebase**.

## 3. Set up the database
1. Create a Supabase project.
2. Open **SQL Editor**, paste the whole of `docs/setup.sql` and click **Run**. This creates every table, permission rule, role and protected function.
3. Go to **Authentication -> URL Configuration** and set the Site URL to your domain (for example `https://portal.example.com`). Add `https://portal.example.com/reset-password` to the redirect URLs.
4. Optionally, set up email sending (Authentication -> SMTP) so confirmation and reset emails come from your own address.

## 4. Configure keys
Copy `.env.example` to `.env` and fill it in from Supabase **Project Settings -> API**:
- `VITE_SUPABASE_URL` and `SUPABASE_URL`: the project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_PUBLISHABLE_KEY`: the anon/publishable key
- `VITE_SUPABASE_PROJECT_ID`: the project ref
- `SUPABASE_SERVICE_ROLE_KEY`: the service-role key. **Keep this secret.** It stays on the server only.

## 5. Deploy on a Linux server
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash - && sudo apt install -y nodejs
npm i -g bun pm2
git clone <your-repo> portal && cd portal
cp .env.example .env   # then fill it in
bun install
bun run build
```
The build target is set up for an edge runtime by default. For a plain Node server, follow Lovable's self-hosting guide to switch the build target: https://docs.lovable.dev/tips-tricks/self-hosting. Then start the built server with pm2:
```bash
pm2 start "<start command from the guide>" --name portal
pm2 save && pm2 startup
```
Here is an example nginx site (`/etc/nginx/sites-available/portal`):
```nginx
server {
  server_name portal.example.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/portal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d portal.example.com
```

## 6. Deploy on Cloudflare (alternative)
The app is built for an edge runtime, so it can run as a Cloudflare Worker. Lovable doesn't officially support this deployment path. Follow https://docs.lovable.dev/tips-tricks/self-hosting, and add the same keys from step 4 as Worker variables and secrets.

## 7. Create the first admin
1. Sign up on your live site with the admin's email and confirm it.
2. In the Supabase SQL Editor, run:
```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'admin@yourcompany.com'
on conflict do nothing;
```
3. Log in again. The Administration menu appears.

## 8. Before going live
- Replace the MT4/MT5 placeholder server name in the Overview page.
- Set your wallet and bank details under **Payment settings** in the admin area.
- The "virtual funds only" banner is in `src/lib/brand.ts`. Handling real client money requires proper licensing in your jurisdiction.
