
-- Remove theme color columns from tenants table
ALTER TABLE tenants DROP COLUMN border_color;
ALTER TABLE tenants DROP COLUMN text_secondary;
ALTER TABLE tenants DROP COLUMN text_primary;
ALTER TABLE tenants DROP COLUMN card_background;
ALTER TABLE tenants DROP COLUMN background_color;
ALTER TABLE tenants DROP COLUMN info_color;
ALTER TABLE tenants DROP COLUMN warning_color;
ALTER TABLE tenants DROP COLUMN error_color;
ALTER TABLE tenants DROP COLUMN success_color;
