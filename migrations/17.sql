
UPDATE users 
SET role = 'super_admin', updated_at = CURRENT_TIMESTAMP 
WHERE email = 'jeff.goval@gmail.com';
