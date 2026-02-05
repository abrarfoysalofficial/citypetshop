# Fix: Git push errors (nothing added / remote exists / refspec main)

Use these steps **in order** in PowerShell from your project folder.

---

## 1. Go to the project folder

```powershell
cd "F:\client website\City plus pet shop"
```

---

## 2. Fix the remote URL (use your real GitHub username and repo name)

Your repo is **abrarfoysalofficial / city-plus**, so use:

```powershell
git remote set-url origin https://github.com/abrarfoysalofficial/city-plus.git
```

If your repo has a different name (e.g. `city-plus-pet-shop`), change the last part:  
`https://github.com/abrarfoysalofficial/city-plus-pet-shop.git`

---

## 3. Add all files and create the first commit

If you already ran `git add .` and see lots of "LF will be replaced by CRLF" warnings (or node_modules in the list), **unstage everything first** so we don't commit `node_modules`:

```powershell
git reset
```

Then add again. The project now has a `.gitignore` so `node_modules` and other build files are ignored:

```powershell
git add .
git status
git commit -m "First commit - City Plus Pet Shop"
```

You should see something like "X files changed" and **no** `node_modules` in the list. If you see "nothing to commit", run `git status` and make sure files are listed under "Changes to be committed".

---

## 4. Make sure the branch is main and push

```powershell
git branch -M main
git push -u origin main
```

If GitHub asks you to log in, do it (browser or token). After a successful push, your code is on GitHub and you can connect the repo to Vercel.

---

## About "GitHub Actions billing is locked"

That message only affects **GitHub Actions** (automation on GitHub). It does **not** block:

- Pushing code to GitHub
- Connecting the repo to **Vercel**
- Deploying on Vercel

Vercel builds your site on its own servers. You can ignore the Actions billing message for now and continue with Vercel (Step 10–11 in START_HERE.md).
