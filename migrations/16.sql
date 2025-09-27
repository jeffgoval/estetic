
-- Fix existing users with 'admin' role to 'clinic_admin'
UPDATE users SET role = 'clinic_admin' WHERE role = 'admin';
