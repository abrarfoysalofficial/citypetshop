# 🔐 Admin User Setup Guide

## New Admin User Created:
- **Email**: `fresheritbd@gmail.com`
- **User ID**: You can find this in Supabase Authentication → Users

---

## ⚡ QUICK SETUP (Copy & Run in Supabase SQL Editor)

### Step 1: Find Your User ID

Go to **Supabase Dashboard** → **Authentication** → **Users**  
Copy the **UID** of the user `fresheritbd@gmail.com`

It will look like: `f04264ac-ddd3-4d83-a8f9-c8ffe0182a1c`

---

### Step 2: Run This SQL Command

Replace `YOUR_USER_ID_HERE` with the actual UID you copied:

```sql
-- Add your user to team_members table as admin
INSERT INTO team_members (
  user_id,
  email,
  role,
  full_name,
  is_active
) VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your actual UID
  'fresheritbd@gmail.com',
  'admin',
  'Admin User',  -- You can change this name
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Verify it was added
SELECT * FROM team_members WHERE email = 'fresheritbd@gmail.com';
```

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### Method 1: Using Supabase SQL Editor (RECOMMENDED)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `city_plus_pet_shop`

2. **Get Your User ID**
   - Click **Authentication** (left sidebar)
   - Click **Users**
   - Find `fresheritbd@gmail.com`
   - Copy the **UID** (it's a long UUID like `f04264ac-ddd3-4d83-a8f9-c8ffe0182a1c`)

3. **Open SQL Editor**
   - Click **SQL Editor** (left sidebar)
   - Click **+ New query**

4. **Paste and Modify SQL**
   ```sql
   INSERT INTO team_members (
     user_id,
     email,
     role,
     full_name,
     is_active
   ) VALUES (
     'PASTE_YOUR_UID_HERE',
     'fresheritbd@gmail.com',
     'admin',
     'Fresher IT BD Admin',
     true
   );
   ```

5. **Run the Query**
   - Click **Run** (or press Ctrl+Enter)
   - You should see: "Success. No rows returned"

6. **Verify**
   ```sql
   SELECT * FROM team_members WHERE email = 'fresheritbd@gmail.com';
   ```
   - You should see your admin user record

---

### Method 2: Using Table Editor (Visual)

1. **Open Supabase Dashboard**

2. **Get Your User ID** (same as Method 1, step 2)

3. **Go to Table Editor**
   - Click **Table Editor** (left sidebar)
   - Find and click **team_members** table

4. **Insert New Row**
   - Click **Insert** → **Insert row**
   - Fill in the form:
     - **id**: Leave blank (auto-generated)
     - **created_at**: Leave blank (auto-generated)
     - **updated_at**: Leave blank (auto-generated)
     - **user_id**: PASTE YOUR UID HERE
     - **email**: `fresheritbd@gmail.com`
     - **role**: Select `admin` from dropdown
     - **full_name**: `Fresher IT BD Admin` (or any name)
     - **is_active**: Check the box (true)

5. **Save**
   - Click **Save**

---

## ✅ VERIFICATION

### Test Admin Access:

1. **Login to Admin Panel**
   - Go to: `http://localhost:3000/admin/login` (or your deployed URL)
   - Or: `https://your-domain.com/admin/login`

2. **Enter Credentials**
   - Email: `fresheritbd@gmail.com`
   - Password: (the password you set when creating the user)

3. **Expected Result**
   - You should be redirected to `/admin` dashboard
   - You should see the full admin panel with all features

---

## 🔧 TROUBLESHOOTING

### Problem: "Authentication failed" or "Access denied"

**Solution 1: Check if user exists in team_members**
```sql
SELECT * FROM team_members WHERE email = 'fresheritbd@gmail.com';
```
- If no results: Run the INSERT command again

**Solution 2: Check if user is active**
```sql
UPDATE team_members 
SET is_active = true, role = 'admin'
WHERE email = 'fresheritbd@gmail.com';
```

**Solution 3: Verify User ID matches**
```sql
-- Get user_id from auth.users
SELECT id, email FROM auth.users WHERE email = 'fresheritbd@gmail.com';

-- Compare with team_members
SELECT user_id, email FROM team_members WHERE email = 'fresheritbd@gmail.com';
```
- Both IDs should match!

---

### Problem: Can't find team_members table

**Solution: Run the migration**
```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'team_members';

-- If not exists, create it:
CREATE TYPE team_role AS ENUM ('admin', 'editor', 'support');

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'support',
  full_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public team_members" ON team_members FOR SELECT USING (false);
```

---

## 🎯 QUICK REFERENCE SQL

### Check Current Admin Users
```sql
SELECT 
  tm.email,
  tm.role,
  tm.full_name,
  tm.is_active,
  tm.created_at,
  au.confirmed_at
FROM team_members tm
LEFT JOIN auth.users au ON tm.user_id = au.id
WHERE tm.role = 'admin';
```

### Add Another Admin User
```sql
-- First create user in Authentication UI, then:
INSERT INTO team_members (user_id, email, role, full_name, is_active)
VALUES (
  'USER_UID_FROM_AUTH',
  'another-admin@example.com',
  'admin',
  'Another Admin',
  true
);
```

### Change User Role
```sql
UPDATE team_members 
SET role = 'admin' 
WHERE email = 'fresheritbd@gmail.com';
```

### Deactivate User (without deleting)
```sql
UPDATE team_members 
SET is_active = false 
WHERE email = 'fresheritbd@gmail.com';
```

### Reactivate User
```sql
UPDATE team_members 
SET is_active = true 
WHERE email = 'fresheritbd@gmail.com';
```

### Remove Admin Access (Delete from team_members)
```sql
DELETE FROM team_members 
WHERE email = 'fresheritbd@gmail.com';
-- Note: This doesn't delete the auth user, only removes admin access
```

---

## 🔐 SECURITY NOTES

1. **Row Level Security (RLS)**: The `team_members` table has RLS enabled, so regular users cannot see this table.

2. **Admin Check**: The middleware checks if a user exists in `team_members` with role='admin' before allowing access to `/admin` routes.

3. **Service Role**: Your API routes use the service role key to bypass RLS when needed for admin operations.

---

## 📱 WHAT YOU CAN DO AFTER LOGIN

Once logged in as admin, you can:
- ✅ View Dashboard with analytics
- ✅ Manage Products (add, edit, delete, update stock)
- ✅ Manage Orders (view, update status)
- ✅ Configure Payment Gateways (bKash, SSLCommerz, Nagad)
- ✅ Configure Store Settings (logo, name, contact info)
- ✅ Configure Delivery Charges
- ✅ Manage Categories & Vouchers
- ✅ View Customer Orders
- ✅ Download Invoices

---

## 🎉 YOU'RE ALL SET!

After running the SQL command to add your user to `team_members`, you should be able to login at:
- Development: `http://localhost:3000/admin/login`
- Production: `https://your-domain.com/admin/login`

**Credentials:**
- Email: `fresheritbd@gmail.com`
- Password: (the password you set in Supabase Authentication)

---

## 💡 NEED HELP?

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your Supabase environment variables in `.env.local`
3. Make sure all migrations have been run
4. Check browser console for errors
