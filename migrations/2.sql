
CREATE TABLE material_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  category_id INTEGER,
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  unit_type TEXT DEFAULT 'unidade',
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER DEFAULT 100,
  current_stock INTEGER DEFAULT 0,
  unit_cost REAL DEFAULT 0,
  supplier_name TEXT,
  supplier_contact TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE material_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  entry_type TEXT DEFAULT 'in',
  quantity INTEGER NOT NULL,
  unit_cost REAL DEFAULT 0,
  total_cost REAL DEFAULT 0,
  expiry_date DATE,
  batch_number TEXT,
  supplier_name TEXT,
  invoice_number TEXT,
  notes TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE material_consumption (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  appointment_id INTEGER,
  procedure_id INTEGER,
  quantity_used INTEGER NOT NULL,
  consumed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE material_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  alert_type TEXT NOT NULL,
  alert_message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
