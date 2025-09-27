
CREATE TABLE procedure_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER,
  name TEXT NOT NULL,
  parent_id INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_procedure_categories_parent ON procedure_categories(parent_id);
CREATE INDEX idx_procedure_categories_tenant ON procedure_categories(tenant_id);

-- Adicionar nova coluna para categorias padronizadas
ALTER TABLE procedures ADD COLUMN procedure_category_id INTEGER;
CREATE INDEX idx_procedures_category ON procedures(procedure_category_id);
