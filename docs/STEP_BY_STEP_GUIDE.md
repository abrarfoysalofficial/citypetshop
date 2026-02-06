# Step-by-step guide – City Plus Pet Shop (for beginners)

Use this guide to run the project on your computer and then put it live on the internet. Do the steps in order.

---

## Part 1: On your computer (local)

### Step 1: Install Node.js (if you don’t have it)

1. Open: **[https://nodejs.org](https://nodejs.org)**
2. Download the **LTS** version (e.g. 20.x or 22.x).
3. Run the installer. Accept the defaults and make sure **“Add to PATH”** is checked.
4. **Close and reopen** PowerShell (or your terminal).
5. Check it worked:
  ```powershell
   node -v
   npm -v
  ```
   You should see version numbers (e.g. `v20.9.0` and `10.1.0`).

---

### Step 2: Open the project folder

1. Open PowerShell (or Command Prompt).
2. Go to the project folder:
  ```powershell
   cd "F:\client website\City plus pet shop"
  ```
   (Use your real path if it’s different.)

---

### Step 3: Install dependencies

Run:

```powershell
npm install
```

Wait until it finishes. You may see some warnings (e.g. “EBADENGINE”); you can ignore them for now. At the end it should say something like “added … packages”.

---

### Step 4: Create your local environment file

1. In the project folder, find the file `**.env.local.example**`.
2. Copy it and rename the copy to `**.env.local**` (same folder).
3. Open `**.env.local**` in a text editor and set at least these (you can leave the rest for later):
  ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_DATA_SOURCE=local
   NEXT_PUBLIC_AUTH_MODE=demo
   NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true
  ```
   Save the file.

---

### Step 5: Run the site on your computer

Run:

```powershell
npm run dev
```

When it says “Ready”, open a browser and go to: **[http://localhost:3000](http://localhost:3000)**

- Homepage, shop, cart, checkout should work (in demo mode).
- Admin: **[http://localhost:3000/admin](http://localhost:3000/admin)** (demo login: e.g. [admin@cityplus.local](mailto:admin@cityplus.local) / Admin@12345 if you left the example credentials).
- Sanity Studio: **[http://localhost:3000/studio](http://localhost:3000/studio)** (needs Sanity project ID/dataset in `.env.local` to be useful).

To stop the server: press **Ctrl+C** in the terminal.

---

### Step 6: Check that the build works (optional but recommended)

1. Stop the dev server (Ctrl+C) if it’s running.
2. Run:
  ```powershell
   npm run build
  ```
3. It should finish with “Compiled successfully” and a list of routes. If you see a red error, fix that before deploying.

---

## Part 2: Put the site on the internet (Vercel)

### Step 7: Put the project on GitHub (if it’s not already)

1. Create an account at **[https://github.com](https://github.com)** if you don’t have one.
2. Create a **new repository** (e.g. “city-plus-pet-shop”). Don’t add a README if the folder already has files.
3. In your project folder, run (replace with your repo URL):
  ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
  ```
   If the project is already a git repo and already on GitHub, you can skip this or just run `git add .`, `git commit -m "Update"`, `git push`.

---

### Step 8: Create a Vercel account and connect the project

1. Go to **[https://vercel.com](https://vercel.com)** and sign up (or log in). Use “Continue with GitHub” if you use GitHub.
2. Click **“Add New…”** → **“Project”**.
3. Import your **GitHub** repository (e.g. “city-plus-pet-shop”).
4. **Do not click Deploy yet.** First set the options below.

---

### Step 9: Set project settings on Vercel

1. **Framework Preset:** Next.js (should be auto-detected).
2. **Root Directory:** leave blank (project root).
3. **Build Command:** leave default (`npm run build`).
4. **Node.js Version:**
  - Open **Settings** (after the project is created) → **General** → **Node.js Version**.  
  - Choose **20.x** (recommended). Save.

---

### Step 10: Add environment variables on Vercel

1. In the project on Vercel, go to **Settings** → **Environment Variables**.
2. Add these **one by one** (name + value, then Add). Use **Production** (and Preview if you want):

  | Name                      | Value (example)                                                                          |
  | ------------------------- | ---------------------------------------------------------------------------------------- |
  | `NEXT_PUBLIC_SITE_URL`    | `https://your-app.vercel.app` (replace with your real Vercel URL or custom domain later) |
  | `NEXT_PUBLIC_DATA_SOURCE` | `local` or `sanity` (use `sanity` when you have Sanity set up)                           |
  | `NEXT_PUBLIC_AUTH_MODE`   | `demo` or `supabase` (use `supabase` when you have Supabase auth set up)                 |

   For a first deploy you can use:
  - `NEXT_PUBLIC_SITE_URL` = your Vercel URL (e.g. `https://city-plus-pet-shop.vercel.app`)
  - `NEXT_PUBLIC_DATA_SOURCE` = `local`
  - `NEXT_PUBLIC_AUTH_MODE` = `demo`
   **Do not** set `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true` in production if you don’t want to show demo logins.
3. If you use **Supabase** later, add:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. If you use **Sanity** later, add:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`

Full list: see **docs/PROD_ENV_SETUP.md**.

---

### Step 11: Deploy

1. Click **Deploy** (or push a new commit to trigger a new deploy).
2. Wait for the build to finish. If it fails, open the build log and fix the error (often a missing env var or Node version).
3. When it’s done, open the **Visit** link (e.g. `https://your-project.vercel.app`). Your site is live.

---

### Step 12: Use a custom domain (optional)

1. In Vercel: **Settings** → **Domains** → **Add** your domain (e.g. `citypluspetshop.com`).
2. In your domain provider’s DNS, add the CNAME or A record Vercel shows.
3. After the domain is connected, set in **Environment Variables**:
  - `NEXT_PUBLIC_SITE_URL` = `https://citypluspetshop.com`
4. Redeploy so the site uses the new URL everywhere.

---

## Part 3: Optional – Sanity and Supabase

- **Sanity (content/CMS):** See **docs/DEPLOY_VERCEL.md** → “Sanity setup”. You create a project on sanity.io, then add `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` in Vercel and set `NEXT_PUBLIC_DATA_SOURCE=sanity` when ready.
- **Supabase (auth/orders):** See **docs/DEPLOY_VERCEL.md** → “Supabase setup”. You create a project on supabase.com, run the SQL in **supabase/migrations/** (see **docs/SUPABASE_MIGRATIONS.md**), then add the Supabase URL and anon key in Vercel and set `NEXT_PUBLIC_AUTH_MODE=supabase` when ready.

---

## Quick checklist

- Node.js installed, `node -v` and `npm -v` work
- In project folder: `npm install` done
- `.env.local` created from `.env.local.example` and at least `NEXT_PUBLIC_SITE_URL`, `DATA_SOURCE`, `AUTH_MODE` set
- `npm run dev` runs and [http://localhost:3000](http://localhost:3000) works
- `npm run build` finishes without errors
- Code pushed to GitHub
- Vercel project created and connected to GitHub
- Node 20.x set in Vercel project settings
- Environment variables added in Vercel
- Deploy successful and site opens from the Vercel URL

---

## If something goes wrong

- **“npm is not recognized”**  
Install Node.js from nodejs.org and restart the terminal.
- **Build fails on Vercel**  
Check the build log. Often: set **Node.js Version** to 20.x, add missing env vars, or use **Redeploy** → **Redeploy without using the build cache**.
- **“Module not found” or “Can’t resolve”**  
Make sure you’re in the project folder and ran `npm install`. If the error is about Sanity config, the project is already set up to use `@/sanity/sanity.config`; don’t change that.
- **More help**  
See **docs/DEPLOY_VERCEL.md** and **docs/PROD_ENV_SETUP.md**.

