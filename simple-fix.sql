-- Simple fix for users_usage table
-- Just disable RLS and grant permissions

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "Allow user usage insert" ON users_usage;
DROP POLICY IF EXISTS "Allow user usage update" ON users_usage;
DROP POLICY IF EXISTS "Service role full access" ON users_usage;
DROP POLICY IF EXISTS "users_usage_insert_policy" ON users_usage;
DROP POLICY IF EXISTS "users_usage_update_policy" ON users_usage;
DROP POLICY IF EXISTS "users_usage_select_policy" ON users_usage;

-- 2. Disable RLS completely
ALTER TABLE users_usage DISABLE ROW LEVEL SECURITY;

-- 3. Grant full access to authenticated users
GRANT ALL ON users_usage TO authenticated;
GRANT ALL ON users_usage TO anon;
