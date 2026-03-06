-- ============================================================================
-- ⚡ AUTOMATIC ADMIN SETUP (NO UID NEEDED!)
-- ============================================================================
-- 
-- JUST COPY THIS ENTIRE FILE AND PASTE INTO SUPABASE SQL EDITOR
-- Then click RUN - it will automatically find and add your user!
--
-- ============================================================================

-- Automatically add fresheritbd@gmail.com as admin
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
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active;

-- Show success message
SELECT 
  '✅ SUCCESS! Admin user added' as status,
  tm.email,
  tm.role,
  tm.full_name,
  tm.is_active,
  'You can now login at /admin/login' as next_step
FROM team_members tm
WHERE tm.email = 'fresheritbd@gmail.com';

-- ============================================================================
-- DONE! You can now login at:
-- - http://localhost:3000/admin/login
-- - Or your deployed URL: https://your-domain.com/admin/login
--
-- Credentials:
-- Email: fresheritbd@gmail.com
-- Password: (the password you set in Supabase Authentication)
-- ============================================================================
