-- Manual Admin User Setup
-- Use this if you want to create the admin user manually

-- Step 1: First, create the user in Supabase Auth dashboard
-- Step 2: Get the UUID from the auth.users table
-- Step 3: Replace 'YOUR_ACTUAL_UUID_HERE' with the real UUID

-- Create the admin user profile
INSERT INTO users (
    id,
    name,
    phone,
    address,
    role,
    center_id,
    created_at,
    updated_at
) VALUES (
    'YOUR_ACTUAL_UUID_HERE',  -- Replace with UUID from Supabase Auth
    'Super Admin',
    '+1234567890',
    'Main Office',
    'super_admin',
    1,  -- First center ID
    NOW(),
    NOW()
);

-- Update the user's center_id if needed
-- UPDATE users SET center_id = 1 WHERE id = 'YOUR_ACTUAL_UUID_HERE';

-- Verify the admin user
SELECT 
    u.id,
    u.name,
    u.role,
    u.phone,
    u.center_id,
    c.name as center_name
FROM users u
LEFT JOIN centers c ON u.center_id = c.id
WHERE u.role = 'super_admin';