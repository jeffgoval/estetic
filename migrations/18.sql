
-- Add theme color columns to tenants table
ALTER TABLE tenants ADD COLUMN success_color TEXT DEFAULT '#059669';
ALTER TABLE tenants ADD COLUMN error_color TEXT DEFAULT '#DC2626';
ALTER TABLE tenants ADD COLUMN warning_color TEXT DEFAULT '#D97706';
ALTER TABLE tenants ADD COLUMN info_color TEXT DEFAULT '#0891B2';
ALTER TABLE tenants ADD COLUMN background_color TEXT DEFAULT '#F9FAFB';
ALTER TABLE tenants ADD COLUMN card_background TEXT DEFAULT '#FFFFFF';
ALTER TABLE tenants ADD COLUMN text_primary TEXT DEFAULT '#111827';
ALTER TABLE tenants ADD COLUMN text_secondary TEXT DEFAULT '#6B7280';
ALTER TABLE tenants ADD COLUMN border_color TEXT DEFAULT '#E5E7EB';
