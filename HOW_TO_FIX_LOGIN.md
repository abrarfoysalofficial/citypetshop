# 🔧 How to Fix Admin Login Issue

## Problem
You're seeing the error: **"Sign in with your admin account. Configure Supabase Auth for production."**

## Root Cause
Your `.env.local` is missing the **`SUPABASE_SERVICE_ROLE_KEY`** which is required for server-side admin operations.

---

## ✅ SOLUTION - Add Service Role Key

### Step 1: Get Your Service Role Key from Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `city_plus_pet_shop`

2. **Navigate to API Settings**
   - Click **Settings** (⚙️ icon in left sidebar)
   - Click **API**

3. **Copy the Service Role Key**
   - Scroll down to **Project API keys**
   - Find **`service_role`** section (it has a 🔑 lock icon)
   - Click the **eye icon** 👁️ to reveal the key
   - Click **Copy** to copy the entire key
   - ⚠️ **WARNING**: This key has full access - keep it secret!

---

### Step 2: Add It to Your .env.local File

Open `f:\client website\City plus pet shop\.env.local` and add this line after your `NEXT_PUBLIC_SUPABASE_ANON_KEY`:

```env
# Supabase (required when NEXT_PUBLIC_DATA_SOURCE=supabase; Admin Auth, Orders, CMS, Storage)
NEXT_PUBLIC_SUPABASE_URL=https://rofhtwpjwjiqtlmwygwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZmh0d3Bqd2ppcXRsbXd5Z3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MTgyMzAsImV4cCI6MjA4NTk5NDIzMH0.1DQNAwyw907h3sScyH65TlGeXTGHtWv7rIwJQFlA5s0

# Add this line (paste your actual service role key):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZmh0d3Bqd2ppcXRsbXd5Z3dwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQxODIzMCwiZXhwIjoyMDg1OTk0MjMwfQ.PASTE_YOUR_ACTUAL_KEY_HERE
```

**Replace** `PASTE_YOUR_ACTUAL_KEY_HERE` with the actual service role key you copied from Supabase!

---

### Step 3: Restart Your Development Server

**IMPORTANT**: After adding the key, you MUST restart your dev server:

1. **Stop the current server**:
   - Press `Ctrl + C` in your terminal

2. **Start it again**:
   ```bash
   npm run dev
   ```

3. **Wait for it to compile** (should take 10-20 seconds)

---

### Step 4: Try Login Again

1. Go to: **http://localhost:3000/admin/login**
2. Enter:
   - Email: `fresheritbd@gmail.com`
   - Password: (your Supabase password)
3. Click **Sign in**
4. You should now be redirected to the admin dashboard! 🎉

---

## 🔍 How to Verify It's Working

After restarting, you should see in your terminal:
```
✓ Ready in 3.2s
○ Local:   http://localhost:3000
```

And when you try to login, you should NOT see any error message in red.

---

## 📸 Visual Guide - Where to Find Service Role Key

### In Supabase Dashboard:

```
Dashboard
  └─ Settings (⚙️)
      └─ API
          └─ Project API keys
              ├─ anon public (already have this) ✅
              └─ service_role (⚠️ SECRET - COPY THIS!)
```

The service role key will look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZmh0d3Bqd2ppcXRsbXd5Z3dwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQxODIzMCwiZXhwIjoyMDg1OTk0MjMwfQ.LONG_STRING_HERE
```

---

## ⚠️ SECURITY WARNING

**NEVER commit or share your Service Role Key!**

- ❌ Don't push it to GitHub
- ❌ Don't share it in screenshots
- ❌ Don't paste it in public forums
- ✅ Only keep it in `.env.local` (which is gitignored)

The service role key has **FULL ACCESS** to your database, bypassing all security rules!

---

## 🆘 Troubleshooting

### Problem: Still getting the same error after adding the key

**Solution 1**: Make sure you restarted the dev server
```bash
# Stop (Ctrl+C) then:
npm run dev
```

**Solution 2**: Check for typos in `.env.local`
- Variable name must be exactly: `SUPABASE_SERVICE_ROLE_KEY`
- No spaces around the `=` sign
- No quotes around the key value

**Solution 3**: Verify the key is correct
```bash
# In your terminal, check if the key is loaded:
# It should show your key (not undefined)
```

---

### Problem: "Invalid login credentials" error

This means:
- ✅ Supabase is now configured correctly!
- ❌ But your email/password is wrong

**Solution**: 
1. Go to Supabase Dashboard → Authentication → Users
2. Find `fresheritbd@gmail.com`
3. Click **3 dots** → **Reset Password**
4. Set a new password
5. Try logging in with the new password

---

### Problem: "User not found in team_members"

This means you successfully authenticated, but you're not marked as admin.

**Solution**: Run this SQL again in Supabase:
```sql
SELECT * FROM team_members WHERE email = 'fresheritbd@gmail.com';
```

If no results, run:
```sql
INSERT INTO team_members (user_id, email, role, full_name, is_active)
SELECT 
  id,
  email,
  'admin'::team_role,
  'Fresher IT BD Admin',
  true
FROM auth.users
WHERE email = 'fresheritbd@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;
```

---

## ✅ Success Checklist

Before trying to login, verify:

- [ ] ✅ Service role key is added to `.env.local`
- [ ] ✅ Dev server has been restarted
- [ ] ✅ No error message shows on login page
- [ ] ✅ User exists in Supabase Authentication
- [ ] ✅ User exists in `team_members` table as admin
- [ ] ✅ You know your correct password

---

## 🎯 Expected Result

After following all steps:

1. **Login page loads** without red error message
2. **Enter credentials** (fresheritbd@gmail.com + password)
3. **Click Sign in**
4. **Redirected to** `/admin` dashboard
5. **See beautiful admin panel** with all features! 🎉

---

## 💡 Quick Reference

### Your Complete .env.local Should Look Like:

```env
NEXT_PUBLIC_AUTH_SOURCE=supabase

NEXT_PUBLIC_SUPABASE_URL=https://rofhtwpjwjiqtlmwygwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZmh0d3Bqd2ppcXRsbXd5Z3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MTgyMzAsImV4cCI6MjA4NTk5NDIzMH0.1DQNAwyw907h3sScyH65TlGeXTGHtWv7rIwJQFlA5s0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE
```

---

## 🚀 After Login Works

You'll have access to:
- Dashboard with analytics
- Product management
- Order management  
- Payment gateway configuration
- Store settings
- And much more!

**Happy managing your pet shop!** 🐾
