
CREATE TABLE whatsapp_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  api_token TEXT,
  phone_number TEXT,
  webhook_url TEXT,
  is_connected BOOLEAN DEFAULT 0,
  auto_responses_enabled BOOLEAN DEFAULT 1,
  appointment_booking_enabled BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE whatsapp_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  template_type TEXT DEFAULT 'custom',
  variables TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE whatsapp_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  phone TEXT NOT NULL,
  name TEXT,
  last_message_at DATETIME,
  status TEXT DEFAULT 'active',
  is_patient BOOLEAN DEFAULT 0,
  patient_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE whatsapp_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  contact_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  direction TEXT DEFAULT 'outgoing',
  status TEXT DEFAULT 'sent',
  message_type TEXT DEFAULT 'text',
  template_id INTEGER,
  appointment_id INTEGER,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE whatsapp_automations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_conditions TEXT,
  template_id INTEGER,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
