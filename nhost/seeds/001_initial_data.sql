-- Seeds iniciais para desenvolvimento

-- Inserir planos de assinatura
INSERT INTO subscription_plans (id, name, description, price_monthly, price_yearly, max_users, max_patients, max_appointments_per_month, features, is_active, is_popular, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Básico', 'Plano básico para clínicas pequenas', 99.90, 999.00, 3, 100, 200, '{"dashboard": true, "patients": true, "appointments": true}', true, false, 1),
('550e8400-e29b-41d4-a716-446655440002', 'Profissional', 'Plano profissional com mais recursos', 199.90, 1999.00, 10, 500, 1000, '{"dashboard": true, "patients": true, "appointments": true, "inventory": true, "reports": true}', true, true, 2),
('550e8400-e29b-41d4-a716-446655440003', 'Premium', 'Plano premium com todos os recursos', 399.90, 3999.00, -1, -1, -1, '{"dashboard": true, "patients": true, "appointments": true, "inventory": true, "reports": true, "whatsapp": true, "ai_agent": true, "anamnesis": true}', true, false, 3);

-- Inserir feature flags
INSERT INTO feature_flags (id, key, name, description, category, is_premium) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'dashboard', 'Dashboard', 'Acesso ao dashboard principal', 'core', false),
('660e8400-e29b-41d4-a716-446655440002', 'patients', 'Gestão de Pacientes', 'Cadastro e gestão de pacientes', 'core', false),
('660e8400-e29b-41d4-a716-446655440003', 'appointments', 'Agendamentos', 'Sistema de agendamentos', 'core', false),
('660e8400-e29b-41d4-a716-446655440004', 'professionals', 'Profissionais', 'Gestão de profissionais', 'core', false),
('660e8400-e29b-41d4-a716-446655440005', 'inventory', 'Estoque', 'Controle de estoque e materiais', 'advanced', false),
('660e8400-e29b-41d4-a716-446655440006', 'reports', 'Relatórios', 'Relatórios e analytics', 'advanced', false),
('660e8400-e29b-41d4-a716-446655440007', 'whatsapp', 'WhatsApp', 'Integração com WhatsApp', 'premium', true),
('660e8400-e29b-41d4-a716-446655440008', 'ai_agent', 'Agente IA', 'Assistente com inteligência artificial', 'premium', true),
('660e8400-e29b-41d4-a716-446655440009', 'anamnesis', 'Anamnese Digital', 'Sistema de anamnese digital', 'advanced', false),
('660e8400-e29b-41d4-a716-446655440010', 'waiting_list', 'Lista de Espera', 'Gestão de lista de espera', 'core', false);

-- Relacionar features com planos
-- Plano Básico
INSERT INTO plan_features (plan_id, feature_flag_id, is_enabled) VALUES
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', true), -- dashboard
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', true), -- patients
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', true), -- appointments
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', true), -- professionals
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440010', true); -- waiting_list

-- Plano Profissional
INSERT INTO plan_features (plan_id, feature_flag_id, is_enabled) VALUES
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', true), -- dashboard
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', true), -- patients
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', true), -- appointments
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', true), -- professionals
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', true), -- inventory
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440006', true), -- reports
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440009', true), -- anamnesis
('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440010', true); -- waiting_list

-- Plano Premium
INSERT INTO plan_features (plan_id, feature_flag_id, is_enabled) VALUES
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', true), -- dashboard
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', true), -- patients
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', true), -- appointments
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', true), -- professionals
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440005', true), -- inventory
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440006', true), -- reports
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', true), -- whatsapp
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440008', true), -- ai_agent
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440009', true), -- anamnesis
('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440010', true); -- waiting_list

-- Inserir tenant de exemplo para desenvolvimento
INSERT INTO tenants (id, name, subdomain, plan_id, subscription_status, trial_ends_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Clínica Exemplo', 'clinica-exemplo', '550e8400-e29b-41d4-a716-446655440002', 'trial', NOW() + INTERVAL '30 days');

-- Inserir usuário de exemplo (owner da clínica)
INSERT INTO users (id, tenant_id, email, display_name, role, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'admin@clinica-exemplo.com', 'Administrador', 'owner', true);

-- Inserir super admin para desenvolvimento
INSERT INTO users (id, email, display_name, role, is_active, is_super_admin) VALUES
('880e8400-e29b-41d4-a716-446655440000', 'superadmin@mocha.com', 'Super Admin', 'super_admin', true, true);

-- Inserir categorias de materiais de exemplo
INSERT INTO material_categories (id, tenant_id, name, description) VALUES
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Descartáveis', 'Materiais descartáveis e de uso único'),
('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'Produtos Estéticos', 'Produtos para procedimentos estéticos'),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'Equipamentos', 'Equipamentos e instrumentos');

-- Inserir profissionais de exemplo
INSERT INTO professionals (id, tenant_id, name, specialty, phone, email, working_hours) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Dra. Maria Silva', 'Dermatologia', '(11) 99999-1111', 'maria@clinica-exemplo.com', 
'{"monday": {"start": "08:00", "end": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "tuesday": {"start": "08:00", "end": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "wednesday": {"start": "08:00", "end": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "thursday": {"start": "08:00", "end": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]}, "friday": {"start": "08:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}}'),
('aa0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'Dr. João Santos', 'Estética', '(11) 99999-2222', 'joao@clinica-exemplo.com',
'{"monday": {"start": "09:00", "end": "19:00", "breaks": [{"start": "12:00", "end": "14:00"}]}, "tuesday": {"start": "09:00", "end": "19:00", "breaks": [{"start": "12:00", "end": "14:00"}]}, "wednesday": {"start": "09:00", "end": "19:00", "breaks": [{"start": "12:00", "end": "14:00"}]}, "thursday": {"start": "09:00", "end": "19:00", "breaks": [{"start": "12:00", "end": "14:00"}]}, "friday": {"start": "09:00", "end": "18:00", "breaks": [{"start": "12:00", "end": "14:00"}]}}');

-- Inserir pacientes de exemplo
INSERT INTO patients (id, tenant_id, name, phone, email, birth_date, address) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Ana Costa', '(11) 98888-1111', 'ana@email.com', '1990-05-15', 'Rua das Flores, 123 - São Paulo, SP'),
('bb0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'Carlos Oliveira', '(11) 98888-2222', 'carlos@email.com', '1985-08-22', 'Av. Paulista, 456 - São Paulo, SP'),
('bb0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'Fernanda Lima', '(11) 98888-3333', 'fernanda@email.com', '1992-12-03', 'Rua Augusta, 789 - São Paulo, SP');

-- Inserir materiais de exemplo
INSERT INTO materials (id, tenant_id, category_id, name, brand, unit_type, min_stock_level, max_stock_level, current_stock, unit_cost) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'Luvas Descartáveis', 'MedSupply', 'caixa', 5, 50, 25, 15.90),
('cc0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'Máscaras Cirúrgicas', 'MedSupply', 'caixa', 3, 30, 12, 8.50),
('cc0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'Ácido Hialurônico', 'BeautyPro', 'unidade', 2, 20, 8, 450.00),
('cc0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'Botox', 'AestheticLab', 'unidade', 1, 10, 3, 850.00);

-- Inserir agendamentos de exemplo
INSERT INTO appointments (id, tenant_id, patient_id, professional_id, title, description, start_datetime, end_datetime, status, service_type, created_by) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'Consulta Dermatológica', 'Avaliação inicial da pele', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 'scheduled', 'Consulta', '880e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', 'Aplicação de Botox', 'Aplicação de toxina botulínica', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '30 minutes', 'confirmed', 'Procedimento', '880e8400-e29b-41d4-a716-446655440001'),
('dd0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440001', 'Limpeza de Pele', 'Limpeza profunda facial', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '45 minutes', 'scheduled', 'Procedimento', '880e8400-e29b-41d4-a716-446655440001');

-- Inserir template de anamnese de exemplo
INSERT INTO anamnesis_templates (id, tenant_id, name, description, sections, is_default, created_by) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Anamnese Geral', 'Template padrão de anamnese para procedimentos estéticos', 
'[
  {
    "id": "personal_data",
    "title": "Dados Pessoais",
    "fields": [
      {"id": "age", "type": "number", "label": "Idade", "required": true},
      {"id": "profession", "type": "text", "label": "Profissão", "required": false},
      {"id": "marital_status", "type": "select", "label": "Estado Civil", "options": ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"], "required": false}
    ]
  },
  {
    "id": "medical_history",
    "title": "Histórico Médico",
    "fields": [
      {"id": "allergies", "type": "textarea", "label": "Alergias conhecidas", "required": false},
      {"id": "medications", "type": "textarea", "label": "Medicamentos em uso", "required": false},
      {"id": "previous_procedures", "type": "textarea", "label": "Procedimentos estéticos anteriores", "required": false}
    ]
  },
  {
    "id": "contraindications",
    "title": "Contraindicações",
    "fields": [
      {"id": "pregnancy", "type": "radio", "label": "Está grávida ou amamentando?", "options": ["Sim", "Não"], "required": true, "alert_keywords": ["sim", "grávida", "amamentando"]},
      {"id": "skin_diseases", "type": "textarea", "label": "Doenças de pele ativas", "required": false, "alert_keywords": ["herpes", "eczema", "psoríase", "dermatite"]},
      {"id": "autoimmune", "type": "radio", "label": "Possui doenças autoimunes?", "options": ["Sim", "Não"], "required": true, "alert_keywords": ["sim", "autoimune", "lúpus", "artrite"]}
    ]
  }
]', 
true, '880e8400-e29b-41d4-a716-446655440001');

-- Inserir item na lista de espera
INSERT INTO waiting_list (id, tenant_id, patient_id, professional_id, preferred_date, preferred_time_start, preferred_time_end, priority, status, notes) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001', CURRENT_DATE + INTERVAL '7 days', '14:00', '16:00', 2, 'waiting', 'Paciente prefere horário da tarde');

-- Inserir entradas de materiais
INSERT INTO material_entries (id, tenant_id, material_id, entry_type, quantity, unit_cost, total_cost, supplier_name, created_by) VALUES
('110e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440001', 'in', 25, 15.90, 397.50, 'MedSupply Ltda', '880e8400-e29b-41d4-a716-446655440001'),
('110e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440002', 'in', 12, 8.50, 102.00, 'MedSupply Ltda', '880e8400-e29b-41d4-a716-446655440001'),
('110e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440003', 'out', 2, 450.00, 900.00, NULL, '880e8400-e29b-41d4-a716-446655440001');