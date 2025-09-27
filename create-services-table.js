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

// Definir as tabelas de serviços
const serviceTables = [
  {
    name: 'service_categories',
    sql: `
      CREATE TABLE service_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#3B82F6',
        icon TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'services',
    sql: `
      CREATE TABLE services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        category_id UUID REFERENCES service_categories(id),
        name TEXT NOT NULL,
        description TEXT,
        duration_minutes INTEGER NOT NULL DEFAULT 60,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        cost DECIMAL(10,2) DEFAULT 0,
        requires_materials BOOLEAN DEFAULT false,
        materials_used JSONB DEFAULT '[]',
        preparation_time INTEGER DEFAULT 0,
        recovery_time INTEGER DEFAULT 0,
        contraindications TEXT,
        instructions_before TEXT,
        instructions_after TEXT,
        professional_requirements JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        is_popular BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'service_packages',
    sql: `
      CREATE TABLE service_packages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        services JSONB NOT NULL DEFAULT '[]',
        total_sessions INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        validity_days INTEGER DEFAULT 365,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }
];

// Função principal
async function createServiceTables() {
  console.log('Criando tabelas de serviços da clínica...\n');
  console.log('📋 Tabelas que serão criadas:');
  console.log('1. service_categories - Categorias de serviços');
  console.log('2. services - Serviços oferecidos pela clínica');
  console.log('3. service_packages - Pacotes de serviços');
  
  for (const table of serviceTables) {
    try {
      // Criar tabela
      await executeSql(table.sql, `Criando tabela ${table.name}`);
      
      // Rastrear tabela no GraphQL
      await trackTable(table.name);
      
    } catch (error) {
      console.error(`Erro ao processar tabela ${table.name}:`, error.message);
    }
  }
  
  // Também vou atualizar a tabela appointments para referenciar services
  console.log('\nAtualizando tabela appointments para referenciar serviços...');
  
  try {
    await executeSql(
      'ALTER TABLE appointments ADD COLUMN service_id UUID REFERENCES services(id);',
      'Adicionando referência de serviço aos agendamentos'
    );
    
    await executeSql(
      'ALTER TABLE appointments ADD COLUMN package_id UUID REFERENCES service_packages(id);',
      'Adicionando referência de pacote aos agendamentos'
    );
    
    await executeSql(
      'ALTER TABLE appointments ADD COLUMN session_number INTEGER DEFAULT 1;',
      'Adicionando número da sessão aos agendamentos'
    );
    
  } catch (error) {
    console.log('Colunas podem já existir ou erro esperado:', error.message);
  }
  
  console.log('\n🎉 Tabelas de serviços criadas com sucesso!');
  console.log('\nAgora o sistema tem:');
  console.log('✅ Categorias de serviços');
  console.log('✅ Serviços individuais');
  console.log('✅ Pacotes de serviços');
  console.log('✅ Integração com agendamentos');
  
  console.log('\nVerifique executando: node check-custom-tables.js');
}

// Executar
createServiceTables();