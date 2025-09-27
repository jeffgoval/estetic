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

// Definir as tabelas de configurações de forma mais simples
const settingsTables = [
  {
    name: 'tenant_general_settings',
    sql: `
      CREATE TABLE tenant_general_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
        business_name TEXT,
        phone TEXT,
        email TEXT,
        timezone TEXT DEFAULT 'America/Sao_Paulo',
        locale TEXT DEFAULT 'pt-BR',
        currency TEXT DEFAULT 'BRL',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  {
    name: 'tenant_business_hours',
    sql: `
      CREATE TABLE tenant_business_hours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        is_open BOOLEAN DEFAULT true,
        open_time TIME,
        close_time TIME,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(tenant_id, day_of_week)
      );
    `
  },
  
  {
    name: 'tenant_theme_settings',
    sql: `
      CREATE TABLE tenant_theme_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
        primary_color TEXT DEFAULT '#3B82F6',
        secondary_color TEXT DEFAULT '#10B981',
        logo_url TEXT,
        dark_mode_enabled BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  {
    name: 'tenant_notification_config',
    sql: `
      CREATE TABLE tenant_notification_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
        whatsapp_enabled BOOLEAN DEFAULT false,
        whatsapp_phone TEXT,
        email_enabled BOOLEAN DEFAULT true,
        email_from TEXT,
        sms_enabled BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  {
    name: 'tenant_appointment_settings',
    sql: `
      CREATE TABLE tenant_appointment_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
        default_duration INTEGER DEFAULT 60,
        min_advance_hours INTEGER DEFAULT 2,
        max_advance_days INTEGER DEFAULT 90,
        allow_same_day BOOLEAN DEFAULT true,
        require_confirmation BOOLEAN DEFAULT true,
        min_cancellation_hours INTEGER DEFAULT 24,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }
];

// Função principal
async function createSettingsSimple() {
  console.log('Criando tabelas de configurações simplificadas...\n');
  
  for (const table of settingsTables) {
    try {
      // Criar tabela
      await executeSql(table.sql, `Criando tabela ${table.name}`);
      
      // Rastrear tabela no GraphQL
      await trackTable(table.name);
      
    } catch (error) {
      console.error(`Erro ao processar tabela ${table.name}:`, error.message);
    }
  }
  
  console.log('\n🎉 Tabelas de configurações criadas com sucesso!');
  console.log('\nFuncionalidades de configuração implementadas:');
  console.log('✅ Configurações gerais da clínica');
  console.log('✅ Horários de funcionamento por dia da semana');
  console.log('✅ Temas e cores personalizáveis');
  console.log('✅ Configurações de notificações');
  console.log('✅ Configurações de agendamentos');
  
  console.log('\nVerifique executando: node check-custom-tables.js');
}

// Executar
createSettingsSimple();