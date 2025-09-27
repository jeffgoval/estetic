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

// Definir as tabelas avançadas do SaaS
const saasAdvancedTables = [
  // === LEADS E CRM ===
  {
    name: 'leads',
    sql: `
      CREATE TABLE leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        source TEXT DEFAULT 'website' CHECK (source IN ('website', 'whatsapp', 'instagram', 'facebook', 'google', 'referral', 'walk_in', 'other')),
        status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'lost')),
        interested_services JSONB DEFAULT '[]',
        budget_range TEXT,
        preferred_contact TEXT DEFAULT 'whatsapp' CHECK (preferred_contact IN ('phone', 'whatsapp', 'email')),
        notes TEXT,
        last_contact_date TIMESTAMPTZ,
        next_followup_date TIMESTAMPTZ,
        converted_to_patient_id UUID REFERENCES patients(id),
        assigned_to UUID REFERENCES professionals(id),
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === AGENTES IA / CHATBOTS ===
  {
    name: 'ai_agents',
    sql: `
      CREATE TABLE ai_agents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'chatbot' CHECK (type IN ('chatbot', 'voice_assistant', 'scheduler', 'support')),
        platform TEXT DEFAULT 'whatsapp' CHECK (platform IN ('whatsapp', 'website', 'instagram', 'telegram')),
        personality JSONB NOT NULL DEFAULT '{}',
        knowledge_base JSONB DEFAULT '{}',
        available_actions JSONB DEFAULT '[]',
        working_hours JSONB,
        fallback_to_human BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        api_key TEXT,
        webhook_url TEXT,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  {
    name: 'ai_conversations',
    sql: `
      CREATE TABLE ai_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
        lead_id UUID REFERENCES leads(id),
        patient_id UUID REFERENCES patients(id),
        platform_user_id TEXT NOT NULL,
        phone_number TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'transferred_to_human', 'completed', 'abandoned')),
        context JSONB DEFAULT '{}',
        started_at TIMESTAMPTZ DEFAULT NOW(),
        ended_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  {
    name: 'ai_messages',
    sql: `
      CREATE TABLE ai_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
        sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai', 'human')),
        message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'location')),
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        ai_confidence DECIMAL(3,2),
        intent_detected TEXT,
        entities_extracted JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === CAMPANHAS DE MARKETING ===
  {
    name: 'marketing_campaigns',
    sql: `
      CREATE TABLE marketing_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'whatsapp' CHECK (type IN ('whatsapp', 'email', 'sms', 'instagram', 'facebook')),
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled')),
        target_audience JSONB NOT NULL DEFAULT '{}',
        message_template TEXT NOT NULL,
        media_urls JSONB DEFAULT '[]',
        scheduled_at TIMESTAMPTZ,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        total_recipients INTEGER DEFAULT 0,
        sent_count INTEGER DEFAULT 0,
        delivered_count INTEGER DEFAULT 0,
        read_count INTEGER DEFAULT 0,
        replied_count INTEGER DEFAULT 0,
        conversion_count INTEGER DEFAULT 0,
        budget DECIMAL(10,2) DEFAULT 0,
        cost_per_message DECIMAL(10,4) DEFAULT 0,
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  {
    name: 'campaign_recipients',
    sql: `
      CREATE TABLE campaign_recipients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
        recipient_type TEXT NOT NULL CHECK (recipient_type IN ('patient', 'lead')),
        patient_id UUID REFERENCES patients(id),
        lead_id UUID REFERENCES leads(id),
        phone_number TEXT,
        email TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'replied', 'failed', 'opted_out')),
        sent_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        read_at TIMESTAMPTZ,
        replied_at TIMESTAMPTZ,
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === COMUNICAÇÃO WHATSAPP ===
  {
    name: 'whatsapp_templates',
    sql: `
      CREATE TABLE whatsapp_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        category TEXT DEFAULT 'marketing' CHECK (category IN ('marketing', 'utility', 'authentication')),
        language TEXT DEFAULT 'pt_BR',
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        template_id TEXT UNIQUE,
        header_type TEXT CHECK (header_type IN ('text', 'image', 'video', 'document')),
        header_content TEXT,
        body_text TEXT NOT NULL,
        footer_text TEXT,
        buttons JSONB DEFAULT '[]',
        variables JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  {
    name: 'whatsapp_messages',
    sql: `
      CREATE TABLE whatsapp_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        conversation_id UUID REFERENCES ai_conversations(id),
        patient_id UUID REFERENCES patients(id),
        lead_id UUID REFERENCES leads(id),
        phone_number TEXT NOT NULL,
        direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
        message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'location', 'template')),
        content TEXT,
        media_url TEXT,
        template_id UUID REFERENCES whatsapp_templates(id),
        template_variables JSONB,
        whatsapp_message_id TEXT UNIQUE,
        status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
        error_code TEXT,
        error_message TEXT,
        sent_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === NOTIFICAÇÕES ===
  {
    name: 'notifications',
    sql: `
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        recipient_id UUID NOT NULL,
        recipient_type TEXT DEFAULT 'user' CHECK (recipient_type IN ('user', 'patient', 'professional')),
        type TEXT NOT NULL CHECK (type IN ('appointment_reminder', 'appointment_confirmation', 'payment_due', 'marketing', 'system', 'equipment_maintenance')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        channels JSONB DEFAULT '["app"]' CHECK (jsonb_array_length(channels) > 0),
        data JSONB DEFAULT '{}',
        scheduled_at TIMESTAMPTZ,
        sent_at TIMESTAMPTZ,
        read_at TIMESTAMPTZ,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
        priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === AUTOMAÇÕES ===
  {
    name: 'automations',
    sql: `
      CREATE TABLE automations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        trigger_type TEXT NOT NULL CHECK (trigger_type IN ('appointment_created', 'appointment_reminder', 'patient_birthday', 'lead_created', 'no_show', 'custom_date')),
        trigger_conditions JSONB DEFAULT '{}',
        actions JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        execution_count INTEGER DEFAULT 0,
        last_executed_at TIMESTAMPTZ,
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  {
    name: 'automation_executions',
    sql: `
      CREATE TABLE automation_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
        trigger_data JSONB NOT NULL,
        executed_actions JSONB DEFAULT '[]',
        status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'partial')),
        error_message TEXT,
        execution_time_ms INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }
];

// Função principal
async function createSaasAdvancedTables() {
  console.log('Criando tabelas avançadas do SaaS...\n');
  console.log('📋 Módulos que serão criados:');
  console.log('🤖 1. Agentes IA / Chatbots (3 tabelas)');
  console.log('📱 2. WhatsApp / Comunicação (2 tabelas)');
  console.log('📢 3. Marketing / Campanhas (2 tabelas)');
  console.log('👥 4. CRM / Leads (1 tabela)');
  console.log('🔔 5. Notificações (1 tabela)');
  console.log('⚡ 6. Automações (2 tabelas)');
  console.log('');
  
  for (const table of saasAdvancedTables) {
    try {
      // Criar tabela
      await executeSql(table.sql, `Criando tabela ${table.name}`);
      
      // Rastrear tabela no GraphQL
      await trackTable(table.name);
      
    } catch (error) {
      console.error(`Erro ao processar tabela ${table.name}:`, error.message);
    }
  }
  
  console.log('\n🎉 Todas as tabelas avançadas do SaaS foram criadas!');
  console.log('\nNovo total de funcionalidades:');
  console.log('✅ CRM completo com leads');
  console.log('✅ Agentes IA / Chatbots inteligentes');
  console.log('✅ Campanhas de marketing automatizadas');
  console.log('✅ WhatsApp Business integrado');
  console.log('✅ Sistema de notificações multi-canal');
  console.log('✅ Automações baseadas em eventos');
  
  console.log('\nVerifique executando: node check-custom-tables.js');
}

// Executar
createSaasAdvancedTables();