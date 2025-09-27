
CREATE TABLE procedure_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  procedure_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  quantity_required REAL NOT NULL,
  is_mandatory BOOLEAN DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
