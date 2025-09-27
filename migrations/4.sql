
CREATE TABLE ai_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT DEFAULT 'whatsapp',
  status TEXT DEFAULT 'new',
  interest_level INTEGER DEFAULT 1,
  conversation_stage TEXT DEFAULT 'initial_contact',
  last_interaction_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  metadata TEXT,
  is_patient BOOLEAN DEFAULT 0,
  patient_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
