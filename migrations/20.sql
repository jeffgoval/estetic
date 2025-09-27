
-- Tabela para templates de formulários de anamnese
CREATE TABLE anamnesis_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sections TEXT NOT NULL, -- JSON com estrutura das seções e campos
  is_active BOOLEAN DEFAULT 1,
  is_default BOOLEAN DEFAULT 0,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para formulários de anamnese preenchidos
CREATE TABLE anamnesis_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  appointment_id INTEGER,
  template_id INTEGER NOT NULL,
  form_token TEXT UNIQUE NOT NULL, -- Token único para acesso seguro
  form_data TEXT NOT NULL, -- JSON com respostas do formulário
  status TEXT DEFAULT 'pending', -- pending, completed, expired
  alerts_detected TEXT, -- JSON com alertas detectados automaticamente
  expires_at DATETIME,
  completed_at DATETIME,
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para protocolos de tratamento
CREATE TABLE treatment_protocols (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  appointment_id INTEGER,
  anamnesis_form_id INTEGER,
  professional_id INTEGER NOT NULL, -- dentist_id (profissional responsável)
  protocol_title TEXT NOT NULL,
  objectives TEXT, -- Objetivos do tratamento
  contraindications TEXT, -- Contraindicações identificadas
  recommended_procedures TEXT, -- Procedimentos recomendados (JSON)
  care_instructions TEXT, -- Instruções de cuidados
  follow_up_plan TEXT, -- Plano de acompanhamento
  notes TEXT, -- Observações do profissional
  status TEXT DEFAULT 'draft', -- draft, ready, approved, completed
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para termos de consentimento assinados
CREATE TABLE consent_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  patient_id INTEGER NOT NULL,
  appointment_id INTEGER,
  anamnesis_form_id INTEGER,
  protocol_id INTEGER,
  consent_text TEXT NOT NULL, -- Texto do termo de consentimento
  patient_signature TEXT, -- Dados da assinatura digital
  signed_at DATETIME,
  ip_address TEXT, -- IP do cliente para auditoria
  user_agent TEXT, -- Browser info para auditoria
  is_valid BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para palavras-chave de alerta
CREATE TABLE anamnesis_keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  keyword TEXT NOT NULL,
  alert_level TEXT DEFAULT 'warning', -- critical, warning, info
  alert_message TEXT,
  contraindications TEXT, -- Procedimentos contraindicados
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_anamnesis_forms_patient ON anamnesis_forms(patient_id);
CREATE INDEX idx_anamnesis_forms_token ON anamnesis_forms(form_token);
CREATE INDEX idx_anamnesis_forms_status ON anamnesis_forms(status);
CREATE INDEX idx_protocols_patient ON treatment_protocols(patient_id);
CREATE INDEX idx_protocols_professional ON treatment_protocols(professional_id);
CREATE INDEX idx_consent_forms_patient ON consent_forms(patient_id);
