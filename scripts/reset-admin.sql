-- Reset admin account credentials
-- Email: admin@trolyphaply.vn
-- Password: LamKhanh1823$$$

UPDATE admin_users 
SET 
  email = 'admin@trolyphaply.vn',
  password = '$2b$10$NuM35P0XOPzwIa8CYtfPxOjOBLQoqK3FGQRzi7DXAKHrAnsqUJPEy',
  updated_at = NOW()
WHERE email = 'admin@trolyphaply.vn' OR id = (SELECT id FROM admin_users LIMIT 1);

-- If no admin exists, insert one
INSERT INTO admin_users (email, password, created_at, updated_at)
SELECT 'admin@trolyphaply.vn', '$2b$10$NuM35P0XOPzwIa8CYtfPxOjOBLQoqK3FGQRzi7DXAKHrAnsqUJPEy', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@trolyphaply.vn');

-- Verify
SELECT id, email, created_at, updated_at FROM admin_users WHERE email = 'admin@trolyphaply.vn';
