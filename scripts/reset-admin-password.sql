-- Reset Admin Password SQL Script
-- Run this in Supabase SQL Editor

-- Email: admin@trolyphaply.vn
-- Password: TroLy@PhapLy2026
-- Hash: $2b$10$XKQ2m31NyNaHQmVoAC.lNOqH7z7Is2o7NGRSIzYUb67PsLznruJAi

-- Update existing admin user
UPDATE admin_users
SET password = '$2b$10$XKQ2m31NyNaHQmVoAC.lNOqH7z7Is2o7NGRSIzYUb67PsLznruJAi',
    updated_at = NOW()
WHERE email = 'admin@trolyphaply.vn';

-- If no rows updated, create new admin user
INSERT INTO admin_users (email, password)
SELECT 'admin@trolyphaply.vn', '$2b$10$XKQ2m31NyNaHQmVoAC.lNOqH7z7Is2o7NGRSIzYUb67PsLznruJAi'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE email = 'admin@trolyphaply.vn'
);

-- Verify the admin user
SELECT id, email, created_at, updated_at 
FROM admin_users 
WHERE email = 'admin@trolyphaply.vn';
