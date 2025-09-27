
ALTER TABLE procedures ADD COLUMN fixed_price REAL DEFAULT 0;
ALTER TABLE procedures ADD COLUMN variable_price_notes TEXT;
ALTER TABLE procedures ADD COLUMN materials_cost REAL DEFAULT 0;
ALTER TABLE procedures ADD COLUMN profit_margin REAL DEFAULT 0;
ALTER TABLE procedures ADD COLUMN category TEXT DEFAULT 'geral';
ALTER TABLE procedures ADD COLUMN complexity_level INTEGER DEFAULT 1;
