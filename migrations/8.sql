
CREATE TABLE ai_lead_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  lead_id INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data TEXT,
  performed_by TEXT DEFAULT 'ai',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
