-- Create Admin User Profile
-- Run this AFTER creating the user in Supabase Auth dashboard

-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from Supabase Auth
-- Replace 'YOUR_CENTER_ID' with the center ID (usually 1 for the first center)

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
    'YOUR_USER_ID_HERE',  -- Replace with actual UUID from Supabase Auth
    'Super Admin',
    '+1234567890',
    'Main Office',
    'super_admin',
    1,  -- Replace with your center ID
    NOW(),
    NOW()
);

-- Verify the user was created
SELECT 
    id,
    name,
    role,
    center_id,
    created_at
FROM users 
WHERE role = 'super_admin';