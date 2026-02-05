# Start Here – Step-by-Step Guide

Use this guide **from top to bottom**. Do each step once before going to the next.

---

## Where you are

- You have the **City Plus Pet Shop** project folder on your PC.
- You want to **run it locally** and/or **put it live on the internet (Vercel)**.

This guide does both: first run on your PC, then put it online.

---

# PART 1 – Run the site on your computer

## Step 1: Install Node.js (if you don’t have it)

1. Open: **https://nodejs.org**
2. Download the **LTS** version (green button).
3. Run the installer. Accept defaults. Finish.
4. **Check it worked:**  
   Open **PowerShell** or **Command Prompt** and type:
   ```powershell
   node -v
   ```
   You should see something like `v20.x.x` or `v22.x.x`.  
   Then type:
   ```powershell
   npm -v
   ```
   You should see a number like `10.x.x`.

If you see version numbers, go to **Step 2**.  
If you get an error, install Node.js again and make sure “Add to PATH” is checked.

---

## Step 2: Open the project folder in the terminal

1. Press **Windows + R**, type `powershell`, press Enter (or open “Windows PowerShell” from the Start menu).
2. Go to your project folder. **Copy this line, change nothing, and paste it in PowerShell, then press Enter:**

   ```powershell
   cd "F:\client website\City plus pet shop"
   ```

3. You should now see the path in the prompt, e.g. `PS F:\client website\City plus pet shop>`.  
   You are now “inside” the project. Keep this window open for the next steps.

---

## Step 3: Create your local environment file

The site needs a file named `.env.local` in the project root. You create it by copying the example.

1. In **File Explorer**, go to:  
   `F:\client website\City plus pet shop`
2. Find the file **`.env.local.example`** (if you don’t see it, turn on “Show hidden files” or “File name extensions”).
3. **Copy** that file in the same folder.
4. **Rename** the copy to exactly: **`.env.local`**  
   (no “.example”, just `.env.local`).
5. Open **`.env.local`** with Notepad or VS Code.

You will **edit** this file in the next step. For now, the default values are enough to run the site with **demo data** (no database).

---

## Step 4: Set the minimum variables in `.env.local`

Open `.env.local` and make sure these lines exist and look like this (you can copy-paste):

```env
NEXT_PUBLIC_DATA_SOURCE=local
NEXT_PUBLIC_AUTH_MODE=demo
NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- **NEXT_PUBLIC_DATA_SOURCE=local** → site uses built-in demo products (no database).
- **NEXT_PUBLIC_AUTH_MODE=demo** → login is demo (no real user database).
- **NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true** → so you can see the demo admin/login credentials on the login page.
- **NEXT_PUBLIC_SITE_URL** → for local, `http://localhost:3000` is fine.

Save the file and close it.

---

## Step 5: Install dependencies

In the **same PowerShell window** (where you ran `cd "F:\client website\City plus pet shop"`), run:

```powershell
npm install
```

Wait until it finishes (can take 1–2 minutes). When you see the project path again with no red errors, go to Step 6.

---

## Step 6: Start the site

In the **same** PowerShell window, run:

```powershell
npm run dev
```

You should see something like:

```text
▲ Next.js 14.2.18
- Local:        http://localhost:3000
```

7. Open your browser and go to: **http://localhost:3000**  
   You should see the City Plus Pet Shop homepage.

8. To **stop** the site: in the PowerShell window press **Ctrl + C**.  
   To **start** it again later: open PowerShell, run the same `cd` command from Step 2, then run `npm run dev` again.

**You have finished Part 1.** The site runs on your PC with demo data.

---

# PART 2 – Put the site on the internet (Vercel)

Do this only when Part 1 works and you want the site live on a URL like `https://something.vercel.app`.

---

## Step 7: Create a GitHub account (if you don’t have one)

1. Go to **https://github.com**
2. Sign up (free).
3. Log in.

---

## Step 8: Install Git on your PC (if you don’t have it)

1. Go to **https://git-scm.com/download/win**
2. Download and run the installer. Use default options.
3. **Check:** Open a **new** PowerShell and type:
   ```powershell
   git --version
   ```
   You should see something like `git version 2.x.x`.

---

## Step 9: Put your project on GitHub

1. On GitHub, click the **+** (top right) → **New repository**.
2. **Repository name:** e.g. `city-plus-pet-shop` (no spaces).
3. Leave it **Public**. Do **not** add a README or .gitignore (project already has files).
4. Click **Create repository**.  
   You’ll see a page with a URL like:  
   `https://github.com/YOUR_USERNAME/city-plus-pet-shop.git`

5. In **PowerShell**, go to your project folder again (same as Step 2):
   ```powershell
   cd "F:\client website\City plus pet shop"
   ```

6. Run these **one by one**. **Important:** replace `abrarfoysalofficial` with your GitHub username and `city-plus` with your repo name if different (e.g. `city-plus-pet-shop`):

   ```powershell
   git init
   git add .
   git status
   git commit -m "First commit - City Plus Pet Shop"
   git branch -M main
   git remote add origin https://github.com/abrarfoysalofficial/city-plus.git
   git push -u origin main
   ```

   If you see **"remote origin already exists"**, fix the URL and push:
   ```powershell
   git remote set-url origin https://github.com/abrarfoysalofficial/city-plus.git
   git add .
   git commit -m "First commit - City Plus Pet Shop"
   git push -u origin main
   ```

   When you `git push`, GitHub may ask you to log in (browser or username/password/token). Complete the login. After a successful push, your code is on GitHub.

---

## Step 10: Create a Vercel account and connect GitHub

1. Go to **https://vercel.com**
2. Sign up or log in. Choose **Continue with GitHub** so Vercel can see your repos.
3. Allow Vercel to access your GitHub account when asked.

---

## Step 11: Deploy the project on Vercel

1. On Vercel, click **Add New…** → **Project**.
2. You should see your GitHub repo (e.g. **city-plus-pet-shop**). Click **Import** next to it.
3. **Project name** can stay as is (e.g. city-plus-pet-shop).
4. **Before** clicking Deploy, open **Environment Variables** (expand that section).
5. Add these **one by one** (click “Add”, type Name and Value, then Add again for the next):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SITE_URL` | `https://your-project-name.vercel.app` (you’ll get the exact URL after first deploy; you can change it later) |
   | `NEXT_PUBLIC_DATA_SOURCE` | `local` |
   | `NEXT_PUBLIC_AUTH_MODE` | `demo` |
   | `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` | `false` |

   For the first time you can set `NEXT_PUBLIC_SITE_URL` to:  
   `https://city-plus-pet-shop.vercel.app` (or whatever name Vercel shows).

6. Click **Deploy**.
7. Wait a few minutes. When it’s done, you’ll see **Visit** or a link like `https://city-plus-pet-shop.vercel.app`. Open it – your site is live.

---

## Step 12: (Optional) Use your own domain

1. In Vercel, open your project → **Settings** → **Domains**.
2. Add your domain (e.g. `citypluspetshop.com`).
3. Follow the instructions to add the DNS records (at your domain provider).
4. After the domain is connected, in **Settings → Environment Variables**, set:
   - `NEXT_PUBLIC_SITE_URL` = `https://citypluspetshop.com`
5. Go to **Deployments** → click **⋯** on the latest deployment → **Redeploy**.

---

# PART 3 – Optional: Use real data (Supabase)

Right now the site uses **demo data** (no real database). If you want **real products, orders, and user accounts**:

1. Go to **https://supabase.com** and create a free account and project.
2. In the Supabase dashboard, get:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public key** (under Project Settings → API).
3. In your project you have **Supabase migrations** in `supabase/migrations/`. Run them in the Supabase SQL editor (create tables) – you can use the Supabase docs or ask for a separate “Supabase setup” guide.
4. In **.env.local** (local) or **Vercel → Environment Variables** (live site), set:
   - `NEXT_PUBLIC_DATA_SOURCE` = `supabase`
   - `NEXT_PUBLIC_AUTH_MODE` = `supabase`
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
5. Redeploy on Vercel (or restart `npm run dev` locally).

You can do this **after** the site is already running with demo data.

---

# Quick reference

| I want to…              | Do this |
|-------------------------|--------|
| Run the site on my PC   | Steps 1–6 (Node, `.env.local`, `npm install`, `npm run dev`) |
| Put it on the internet  | Steps 7–11 (GitHub + Vercel) |
| Use my own domain       | Step 12 |
| Use real products/orders| Part 3 (Supabase) |

---

# If something doesn’t work

- **“node is not recognized”** → Install Node.js (Step 1) and restart PowerShell.
- **“npm install” fails** → Make sure you are in the project folder (`cd "F:\client website\City plus pet shop"`).
- **Site doesn’t open at localhost:3000** → After `npm run dev`, wait until you see “Local: http://localhost:3000” and then open that URL in the browser.
- **Vercel build fails** → In Vercel, open the failed deployment and read the error. Often it’s a missing environment variable – add the ones from Step 11.

- **Git push errors** (nothing added / remote exists / refspec main) → See **docs/GIT_PUSH_FIX.md** for the exact commands.
- **GitHub "billing is currently locked" (Actions)** → That only affects GitHub Actions. **Vercel still works** – connect your repo to Vercel and deploy.

If you tell me the **exact step number** and the **exact error message** (or a screenshot), I can tell you what to do next.
