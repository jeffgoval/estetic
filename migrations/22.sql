
-- Create triggers to automatically add default template and keywords for new tenants
CREATE TRIGGER create_default_anamnesis_template_for_new_tenant
AFTER INSERT ON tenants
FOR EACH ROW
WHEN NEW.is_active = 1
BEGIN
  INSERT INTO anamnesis_templates (
    tenant_id, name, description, sections, is_active, is_default
  ) VALUES (
    NEW.id,
    'Anamnese Estética Completa',
    'Template padrão completo para anamnese estética facial e corporal',
    '[
      {
        "id": "identification",
        "title": "Identificação",
        "description": "Suas informações básicas",
        "fields": [
          {"id": "nome_completo", "type": "text", "label": "Nome completo", "required": true},
          {"id": "idade", "type": "number", "label": "Idade", "required": true},
          {"id": "profissao", "type": "text", "label": "Profissão", "required": false},
          {"id": "estado_civil", "type": "select", "label": "Estado civil", "required": false, "options": ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União estável"]}
        ]
      },
      {
        "id": "medical_history",
        "title": "Histórico Médico",
        "description": "Informações sobre sua saúde",
        "fields": [
          {"id": "alergias", "type": "textarea", "label": "Possui alguma alergia? Qual?", "required": false, "placeholder": "Descreva suas alergias ou digite Não possuo"},
          {"id": "medicamentos", "type": "textarea", "label": "Faz uso de algum medicamento?", "required": false, "placeholder": "Liste os medicamentos ou digite Não faço uso"},
          {"id": "cirurgias", "type": "textarea", "label": "Já fez alguma cirurgia? Qual e quando?", "required": false, "placeholder": "Descreva cirurgias anteriores ou digite Nunca fiz"},
          {"id": "doencas_cronicas", "type": "textarea", "label": "Possui alguma doença crônica?", "required": false, "placeholder": "Diabetes, hipertensão, etc. ou digite Não possuo"},
          {"id": "gravidez", "type": "radio", "label": "Está grávida ou amamentando?", "required": true, "options": ["Não", "Grávida", "Amamentando"]},
          {"id": "ciclo_menstrual", "type": "text", "label": "Ciclo menstrual regular?", "required": false}
        ]
      },
      {
        "id": "aesthetic_concerns",
        "title": "Preocupações Estéticas",
        "description": "O que você gostaria de melhorar",
        "fields": [
          {"id": "principal_queixa", "type": "textarea", "label": "Qual sua principal preocupação estética?", "required": true, "placeholder": "Descreva o que mais te incomoda"},
          {"id": "expectativas", "type": "textarea", "label": "Quais são suas expectativas com o tratamento?", "required": true, "placeholder": "O que espera alcançar"},
          {"id": "tratamentos_anteriores", "type": "textarea", "label": "Já fez algum tratamento estético antes?", "required": false, "placeholder": "Botox, preenchimento, peeling, etc. ou digite Nunca fiz"},
          {"id": "produtos_utilizados", "type": "textarea", "label": "Que produtos você usa na pele atualmente?", "required": false, "placeholder": "Cremes, séruns, protetores solares, etc."},
          {"id": "tipo_pele", "type": "select", "label": "Como você classificaria sua pele?", "required": false, "options": ["Normal", "Oleosa", "Seca", "Mista", "Sensível"]}
        ]
      },
      {
        "id": "lifestyle",
        "title": "Estilo de Vida",
        "description": "Hábitos que podem influenciar o tratamento",
        "fields": [
          {"id": "exposicao_solar", "type": "select", "label": "Com que frequência se expõe ao sol?", "required": true, "options": ["Raramente", "Algumas vezes por semana", "Diariamente", "Trabalho exposto ao sol"]},
          {"id": "protecao_solar", "type": "radio", "label": "Usa protetor solar diariamente?", "required": true, "options": ["Sempre", "Às vezes", "Raramente", "Nunca"]},
          {"id": "tabagismo", "type": "radio", "label": "Fuma?", "required": true, "options": ["Não", "Sim, ocasionalmente", "Sim, diariamente"]},
          {"id": "alcool", "type": "radio", "label": "Consome bebidas alcoólicas?", "required": true, "options": ["Não", "Socialmente", "Regularmente"]},
          {"id": "exercicios", "type": "select", "label": "Pratica exercícios físicos?", "required": false, "options": ["Não pratico", "Raramente", "1-2 vezes por semana", "3-4 vezes por semana", "Diariamente"]},
          {"id": "sono", "type": "select", "label": "Como avalia a qualidade do seu sono?", "required": false, "options": ["Excelente", "Boa", "Regular", "Ruim"]}
        ]
      },
      {
        "id": "consent",
        "title": "Consentimento",
        "description": "Confirmação e autorização",
        "fields": [
          {"id": "informacoes_verdadeiras", "type": "checkbox", "label": "Declaro que todas as informações fornecidas são verdadeiras", "required": true},
          {"id": "autorizacao_contato", "type": "checkbox", "label": "Autorizo o contato para agendamento e confirmação de consultas", "required": true},
          {"id": "lgpd_consentimento", "type": "checkbox", "label": "Concordo com o tratamento dos meus dados pessoais conforme a LGPD", "required": true},
          {"id": "fotos_antes_depois", "type": "checkbox", "label": "Autorizo fotos antes e depois para acompanhamento do tratamento", "required": false}
        ]
      }
    ]',
    1,
    1
  );

  -- Insert default keywords for the new tenant
  INSERT INTO anamnesis_keywords (tenant_id, keyword, alert_level, alert_message, contraindications) VALUES
  (NEW.id, 'grávida', 'critical', 'Paciente grávida - Procedimentos estéticos contraindicados', 'Botox, preenchimentos, peelings químicos, lasers'),
  (NEW.id, 'gestante', 'critical', 'Paciente gestante - Procedimentos estéticos contraindicados', 'Botox, preenchimentos, peelings químicos, lasers'),
  (NEW.id, 'amamentando', 'critical', 'Paciente amamentando - Cuidado com procedimentos', 'Botox, alguns preenchimentos e medicamentos tópicos'),
  (NEW.id, 'lactante', 'critical', 'Paciente lactante - Cuidado com procedimentos', 'Botox, alguns preenchimentos e medicamentos tópicos'),
  (NEW.id, 'anticoagulante', 'warning', 'Paciente usa anticoagulante - Risco de sangramento', 'Procedimentos invasivos podem causar hematomas'),
  (NEW.id, 'diabetes', 'warning', 'Paciente diabético - Cicatrização pode ser comprometida', 'Monitorar glicemia e cicatrização'),
  (NEW.id, 'hipertensão', 'warning', 'Paciente hipertenso - Controlar pressão arterial', 'Procedimentos podem alterar pressão arterial'),
  (NEW.id, 'quelóide', 'warning', 'Histórico de quelóide - Risco de cicatrização anormal', 'Evitar procedimentos que causem trauma tecidual'),
  (NEW.id, 'alergia anestésico', 'critical', 'Alergia a anestésico - Contraindicação absoluta', 'Procedimentos com anestesia estão contraindicados'),
  (NEW.id, 'marcapasso', 'warning', 'Paciente com marcapasso - Cuidado com equipamentos', 'Evitar radiofrequência e alguns lasers'),
  (NEW.id, 'epilepsia', 'warning', 'Paciente epiléptico - Cuidado com luzes pulsáteis', 'Evitar luz pulsada e alguns lasers'),
  (NEW.id, 'isotretinoína', 'critical', 'Uso de isotretinoína - Contraindicação', 'Aguardar 6 meses após suspensão para procedimentos invasivos'),
  (NEW.id, 'roacutan', 'critical', 'Uso de Roacutan - Contraindicação', 'Aguardar 6 meses após suspensão para procedimentos invasivos'),
  (NEW.id, 'herpes', 'warning', 'Histórico de herpes - Risco de reativação', 'Profilaxia antiviral pode ser necessária'),
  (NEW.id, 'câncer', 'critical', 'Histórico de câncer - Avaliar liberação médica', 'Necessária liberação do oncologista');
END;
