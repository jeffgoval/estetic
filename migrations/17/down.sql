
UPDATE users 
SET role = 'clinic_admin', updated_at = CURRENT_TIMESTAMP 
WHERE email = 'jeff.goval@gmail.com';
