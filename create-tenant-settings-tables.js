import https from 'https';

// Configurações do Nhost
const NHOST_SUBDOMAIN = 'hfctgkywwvrgtqsiqyja';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = "@K'rre#Yx-9vU'2oYZ(oonwz:hrsMhXR";

// URL da API de query do Hasura
const HASURA_API_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run/v2/query`;
const HASURA_METADATA_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run/v1/metadata`;

// Função para executar SQL
async function executeSql(sql, description) {
  console.log(`\nExecutando: ${description}`);
  
  const query = {
    type: "run_sql",
    args: {
      source: "default",
      sql: sql,
      cascade: false,
      read_only: false
    }
  };

  const data = JSON.stringify(query);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'x-hasura-admin-secret': ADMIN_SECRET
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(HASURA_API_URL, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.error) {
            console.log('❌ Erro:', result.error);
            reject(new Error(JSON.stringify(result.error)));
          } else {
            console.log('✅ Sucesso!');
            resolve(result);
          }
        } catch (error) {
          console.log('❌ Erro de parse:', responseData.substring(0, 200));
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Função para rastrear tabela
async function trackTable(tableName) {
  console.log(`Rastreando tabela ${tableName} no GraphQL...`);
  
  const command = {
    type: "pg_track_table",
    args: {
      source: "default",
      table: {
        name: tableName,
        schema: "public"
      }
    }
  };
  
  const data = JSON.stringify(command);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'x-hasura-admin-secret': ADMIN_SECRET
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(HASURA_METADATA_URL, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.error) {
            console.log('❌ Erro ao rastrear:', result.error);
            reject(new Error(JSON.stringify(result.error)));
          } else {
            console.log('✅ Tabela rastreada!');
            resolve(result);
          }
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Definir as tabelas de configurações por tenant
const tenantSettingsTables = [
  // === CONFIGURAÇÕES GERAIS ===
  {
    name: 'tenant_settings',
    sql: `
      CREATE TABLE tenant_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
        
        -- Informações básicas
        business_name TEXT,
        legal_name TEXT,
        cnpj TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        
        -- Endereço
        address JSONB DEFAULT '{}',
        
        -- Configurações regionais
        timezone TEXT DEFAULT 'America/Sao_Paulo',
        locale TEXT DEFAULT 'pt-BR',
        currency TEXT DEFAULT 'BRL',
        date_format TEXT DEFAULT 'DD/MM/YYYY',
        time_format TEXT DEFAULT '24h',
        
        -- Configurações de agendamento
        default_appointment_duration INTEGER DEFAULT 60,
        min_advance_booking_hours INTEGER DEFAULT 2,
        max_advance_booking_days INTEGER DEFAULT 90,
        allow_same_day_booking BOOLEAN DEFAULT true,
        require_appointment_confirmation BOOLEAN DEFAULT true,
        auto_confirm_appointments BOOLEAN DEFAULT false,
        
        -- Configurações de cancelamento
        allow_patient_cancellation BOOLEAN DEFAULT true,
        min_cancellation_hours INTEGER DEFAULT 24,
        cancellation_fee_percentage DECIMAL(5,2) DEFAULT 0,
        
        -- Configurações de pagamento
        require_payment_upfront BOOLEAN DEFAULT false,
        accept_partial_payments BOOLEAN DEFAULT true,
        default_payment_terms INTEGER DEFAULT 0,
        
        -- Configurações de comunicação
        send_appointment_reminders BOOLEAN DEFAULT true,
        reminder_hours_before JSONB DEFAULT '[24, 2]',
        send_birthday_messages BOOLEAN DEFAULT true,
        send_follow_up_messages BOOLEAN DEFAULT true,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === HORÁRIOS DE FUNCIONAMENTO ===
  {
    name: 'tenant_business_hours',
    sql: `
      CREATE TABLE tenant_business_hours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=domingo, 6=sábado
        is_open BOOLEAN DEFAULT true,
        open_time TIME,
        close_time TIME,
        lunch_break_start TIME,
        lunch_break_end TIME,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(tenant_id, day_of_week)
      );
    `
  },
  
  // === FERIADOS E DIAS ESPECIAIS ===
  {
    name: 'tenant_holidays',
    sql: `
      CREATE TABLE tenant_holidays (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        date DATE NOT NULL,
        is_recurring BOOLEAN DEFAULT false,
        holiday_type TEXT DEFAULT 'closed' CHECK (holiday_type IN ('closed', 'special_hours', 'half_day')),
        special_open_time TIME,
        special_close_time TIME,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === TEMAS E PERSONALIZAÇÃO ===
  {
    name: 'tenant_themes',
    sql: `
      CREATE TABLE tenant_themes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
        
        -- Cores principais
        primary_color TEXT DEFAULT '#3B82F6',
        secondary_color TEXT DEFAULT '#10B981',
        accent_color TEXT DEFAULT '#F59E0B',
        background_color TEXT DEFAULT '#FFFFFF',
        text_color TEXT DEFAULT '#1F2937',
        
        -- Cores de status
        success_color TEXT DEFAULT '#10B981',
        warning_color TEXT DEFAULT '#F59E0B',
        error_color TEXT DEFAULT '#EF4444',
        info_color TEXT DEFAULT '#3B82F6',
        
        -- Logo e imagens
        logo_url TEXT,
        favicon_url TEXT,
        background_image_url TEXT,
        
        -- Tipografia
        font_family TEXT DEFAULT 'Inter',
        font_size_base INTEGER DEFAULT 14,
        
        -- Layout
        sidebar_style TEXT DEFAULT 'expanded' CHECK (sidebar_style IN ('expanded', 'collapsed', 'overlay')),
        header_style TEXT DEFAULT 'fixed' CHECK (header_style IN ('fixed', 'static', 'sticky')),
        border_radius INTEGER DEFAULT 8,
        
        -- Modo escuro
        dark_mode_enabled BOOLEAN DEFAULT false,
        auto_dark_mode BOOLEAN DEFAULT false,
        
        -- Customizações CSS
        custom_css TEXT,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === CONFIGURAÇÕES DE NOTIFICAÇÕES ===
  {
    name: 'tenant_notification_settings',
    sql: `
      CREATE TABLE tenant_notification_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
        
        -- Configurações gerais
        notifications_enabled BOOLEAN DEFAULT true,
        
        -- WhatsApp
        whatsapp_enabled BOOLEAN DEFAULT false,
        whatsapp_api_key TEXT,
        whatsapp_phone_number TEXT,
        whatsapp_business_account_id TEXT,
        
        -- Email
        email_enabled BOOLEAN DEFAULT true,
        smtp_host TEXT,
        smtp_port INTEGER DEFAULT 587,
        smtp_username TEXT,
        smtp_password TEXT,
        smtp_from_email TEXT,
        smtp_from_name TEXT,
        
        -- SMS
        sms_enabled BOOLEAN DEFAULT false,
        sms_provider TEXT,
        sms_api_key TEXT,
        sms_sender_id TEXT,
        
        -- Push notifications
        push_enabled BOOLEAN DEFAULT true,
        firebase_server_key TEXT,
        
        -- Configurações de envio
        max_daily_notifications INTEGER DEFAULT 100,
        quiet_hours_start TIME DEFAULT '22:00',
        quiet_hours_end TIME DEFAULT '08:00',
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === INTEGRAÇÕES ===
  {
    name: 'tenant_integrations',
    sql: `
      CREATE TABLE tenant_integrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        integration_type TEXT NOT NULL CHECK (integration_type IN ('payment', 'calendar', 'crm', 'marketing', 'analytics', 'storage')),
        provider TEXT NOT NULL,
        is_enabled BOOLEAN DEFAULT false,
        
        -- Configurações da integração
        api_key TEXT,
        api_secret TEXT,
        webhook_url TEXT,
        callback_url TEXT,
        
        -- Configurações específicas (JSON flexível)
        settings JSONB DEFAULT '{}',
        
        -- Status da integração
        status TEXT DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'error', 'pending')),
        last_sync_at TIMESTAMPTZ,
        error_message TEXT,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(tenant_id, integration_type, provider)
      );
    `
  },
  
  // === POLÍTICAS DE NEGÓCIO ===
  {
    name: 'tenant_business_rules',
    sql: `
      CREATE TABLE tenant_business_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        rule_category TEXT NOT NULL CHECK (rule_category IN ('appointment', 'payment', 'cancellation', 'refund', 'loyalty', 'pricing')),
        rule_name TEXT NOT NULL,
        rule_description TEXT,
        
        -- Configuração da regra
        conditions JSONB NOT NULL DEFAULT '{}',
        actions JSONB NOT NULL DEFAULT '{}',
        
        -- Status e prioridade
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 1,
        
        -- Período de validade
        valid_from DATE,
        valid_until DATE,
        
        -- Aplicabilidade
        applies_to JSONB DEFAULT '{"all": true}', -- pode ser específico por serviço, profissional, etc.
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === CONFIGURAÇÕES DE SEGURANÇA ===
  {
    name: 'tenant_security_settings',
    sql: `
      CREATE TABLE tenant_security_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
        
        -- Autenticação
        require_2fa BOOLEAN DEFAULT false,
        password_min_length INTEGER DEFAULT 8,
        password_require_uppercase BOOLEAN DEFAULT true,
        password_require_lowercase BOOLEAN DEFAULT true,
        password_require_numbers BOOLEAN DEFAULT true,
        password_require_symbols BOOLEAN DEFAULT false,
        password_expiry_days INTEGER DEFAULT 0, -- 0 = nunca expira
        
        -- Sessão
        session_timeout_minutes INTEGER DEFAULT 480, -- 8 horas
        max_concurrent_sessions INTEGER DEFAULT 3,
        
        -- Tentativas de login
        max_login_attempts INTEGER DEFAULT 5,
        lockout_duration_minutes INTEGER DEFAULT 30,
        
        -- Auditoria
        log_user_actions BOOLEAN DEFAULT true,
        log_data_changes BOOLEAN DEFAULT true,
        retention_days INTEGER DEFAULT 365,
        
        -- Backup
        auto_backup_enabled BOOLEAN DEFAULT true,
        backup_frequency TEXT DEFAULT 'daily' CHECK (backup_frequency IN ('hourly', 'daily', 'weekly')),
        backup_retention_days INTEGER DEFAULT 30,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === LOG DE ALTERAÇÕES DE CONFIGURAÇÕES ===
  {
    name: 'tenant_settings_audit',
    sql: `
      CREATE TABLE tenant_settings_audit (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        table_name TEXT NOT NULL,
        record_id UUID NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
        old_values JSONB,
        new_values JSONB,
        changed_by UUID,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }
];

// Função principal
async function createTenantSettingsTables() {
  console.log('Criando sistema completo de configurações por clínica...\n');
  console.log('📋 Módulos de configuração que serão criados:');
  console.log('⚙️  1. Configurações gerais da clínica');
  console.log('🕐 2. Horários de funcionamento');
  console.log('📅 3. Feriados e dias especiais');
  console.log('🎨 4. Temas e personalização visual');
  console.log('🔔 5. Configurações de notificações');
  console.log('🔗 6. Integrações com terceiros');
  console.log('📋 7. Políticas e regras de negócio');
  console.log('🔒 8. Configurações de segurança');
  console.log('📊 9. Auditoria de alterações');
  console.log('');
  
  for (const table of tenantSettingsTables) {
    try {
      // Criar tabela
      await executeSql(table.sql, `Criando tabela ${table.name}`);
      
      // Rastrear tabela no GraphQL
      await trackTable(table.name);
      
    } catch (error) {
      console.error(`Erro ao processar tabela ${table.name}:`, error.message);
    }
  }
  
  console.log('\n🎉 Sistema de configurações por clínica criado com sucesso!');
  console.log('\nNovas funcionalidades de configuração:');
  console.log('✅ Configurações gerais personalizáveis');
  console.log('✅ Horários de funcionamento flexíveis');
  console.log('✅ Gestão de feriados e dias especiais');
  console.log('✅ Temas visuais completamente customizáveis');
  console.log('✅ Configurações de notificações multi-canal');
  console.log('✅ Integrações com APIs externas');
  console.log('✅ Políticas de negócio configuráveis');
  console.log('✅ Configurações de segurança avançadas');
  console.log('✅ Auditoria completa de alterações');
  
  console.log('\nCada clínica agora pode ter:');
  console.log('🎨 Sua própria identidade visual');
  console.log('⏰ Horários de funcionamento únicos');
  console.log('🌍 Configurações regionais específicas');
  console.log('🔔 Preferências de comunicação');
  console.log('🔒 Políticas de segurança personalizadas');
  
  console.log('\nVerifique executando: node check-custom-tables.js');
}

// Executar
createTenantSettingsTables();