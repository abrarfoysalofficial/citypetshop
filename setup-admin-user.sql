-- ============================================================================
-- ADMIN USER SETUP - COPY & PASTE THIS INTO SUPABASE SQL EDITOR
-- ============================================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Find your user: fresheritbd@gmail.com
-- 3. Copy the UID (looks like: f04264ac-ddd3-4d83-a8f9-c8ffe0182a1c)
-- 4. Replace 'YOUR_USER_ID_HERE' below with your actual UID
-- 5. Run this entire script in SQL Editor
--
-- ============================================================================

-- STEP 1: Replace YOUR_USER_ID_HERE with your actual UID from Authentication → Users
-- Example: 'f04264ac-ddd3-4d83-a8f9-c8ffe0182a1c'

INSERT INTO team_members (
  user_id,
  email,
  role,
  full_name,
  is_active
) VALUES (
  'f1342fce-dcb4-4b83-9702-c8fe2f332c14',  -- ⚠️ REPLACE THIS with your actual UID
  'fresheritbd@gmail.com',
  'admin',
  'Fresher IT BD Admin',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active;

-- STEP 2: Verify the user was added successfully
SELECT 
  tm.id,
  tm.user_id,
  tm.email,
  tm.role,
  tm.full_name,
  tm.is_active,
  tm.created_at,
  au.email as auth_email,
  au.confirmed_at
FROM team_members tm
LEFT JOIN auth.users au ON tm.user_id = au.id
WHERE tm.email = 'fresheritbd@gmail.com';

-- ============================================================================
-- EXPECTED RESULT:
-- You should see one row with:
-- - email: fresheritbd@gmail.com
-- - role: admin
-- - is_active: true
-- - auth_email: fresheritbd@gmail.com (matching)
-- ============================================================================

-- ============================================================================
-- ALTERNATIVE: If you want to find and add automatically (advanced)
-- ============================================================================
-- Uncomment and run this if you want to automatically get the UID:

-- INSERT INTO team_members (user_id, email, role, full_name, is_active)
-- SELECT 
--   id as user_id,
--   'fresheritbd@gmail.com' as email,
--   'admin'::team_role as role,
--   'Fresher IT BD Admin' as full_name,
--   true as is_active
-- FROM auth.users
-- WHERE email = 'fresheritbd@gmail.com'
-- ON CONFLICT (user_id) DO UPDATE SET
--   email = EXCLUDED.email,
--   role = EXCLUDED.role,
--   is_active = EXCLUDED.is_active;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to check everything is working)
-- ============================================================================

-- Check if user exists in auth.users
SELECT id, email, confirmed_at, created_at 
FROM auth.users 
WHERE email = 'fresheritbd@gmail.com';

-- Check if user exists in team_members as admin
SELECT * 
FROM team_members 
WHERE email = 'fresheritbd@gmail.com';

-- List all admin users
SELECT 
  tm.email,
  tm.role,
  tm.full_name,
  tm.is_active,
  au.confirmed_at as email_confirmed
FROM team_members tm
LEFT JOIN auth.users au ON tm.user_id = au.id
WHERE tm.role = 'admin'
ORDER BY tm.created_at DESC;

-- ============================================================================
-- TROUBLESHOOTING QUERIES
-- ============================================================================

-- If you get an error "relation team_members does not exist", run this:
-- (This means the migration wasn't run yet)

-- CREATE TYPE team_role AS ENUM ('admin', 'editor', 'support');
-- 
-- CREATE TABLE team_members (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   user_id UUID NOT NULL UNIQUE,
--   email TEXT NOT NULL,
--   role team_role NOT NULL DEFAULT 'support',
--   full_name TEXT,
--   is_active BOOLEAN NOT NULL DEFAULT TRUE
-- );
-- 
-- ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "No public team_members" ON team_members FOR SELECT USING (false);

-- ============================================================================
-- USEFUL ADMIN MANAGEMENT QUERIES
-- ============================================================================

-- Change role to admin:
-- UPDATE team_members SET role = 'admin' WHERE email = 'fresheritbd@gmail.com';

-- Deactivate user:
-- UPDATE team_members SET is_active = false WHERE email = 'fresheritbd@gmail.com';

-- Reactivate user:
-- UPDATE team_members SET is_active = true WHERE email = 'fresheritbd@gmail.com';

-- Remove admin access:
-- DELETE FROM team_members WHERE email = 'fresheritbd@gmail.com';
