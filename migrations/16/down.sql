
-- Rollback: change 'clinic_admin' back to 'admin' (not recommended)
UPDATE users SET role = 'admin' WHERE role = 'clinic_admin';
