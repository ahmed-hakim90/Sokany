-- Verify Admin User Creation
-- Run this to check if your admin user was created correctly

SELECT 
    u.id,
    u.name,
    u.role,
    u.phone,
    u.address,
    c.name as center_name,
    u.created_at
FROM users u
LEFT JOIN centers c ON u.center_id = c.id
WHERE u.role = 'super_admin'
ORDER BY u.created_at DESC;

-- Also check if you can see all centers (super admin should see all)
SELECT 
    id,
    name,
    address,
    phone,
    created_at
FROM centers
ORDER BY created_at;