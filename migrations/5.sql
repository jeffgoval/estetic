
CREATE TABLE ai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  lead_id INTEGER NOT NULL,
  conversation_id TEXT NOT NULL,
  message TEXT NOT NULL,
  sender TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  ai_response BOOLEAN DEFAULT 0,
  intent_detected TEXT,
  confidence_score REAL,
  follow_up_scheduled BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
