
DROP INDEX idx_procedures_category;
ALTER TABLE procedures DROP COLUMN procedure_category_id;
DROP INDEX idx_procedure_categories_tenant;
DROP INDEX idx_procedure_categories_parent;
DROP TABLE procedure_categories;
