import https from 'https';

// Configurações do Nhost
const NHOST_SUBDOMAIN = 'hfctgkywwvrgtqsiqyja';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = "@K'rre#Yx-9vU'2oYZ(oonwz:hrsMhXR";

// URL da API de query do Hasura
const HASURA_API_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run/v2/query`;

// Função para executar SQL via API REST do Hasura
async function executeSql(sql, description) {
  console.log(`\nExecutando: ${description}`);
  console.log('SQL:', sql.substring(0, 100) + '...');
  
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

// Definir as tabelas básicas
const tables = [
  {
    name: 'tenants',
    sql: `
      CREATE TABLE tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        subdomain TEXT UNIQUE,
        logo_url TEXT,
        primary_color TEXT DEFAULT '#3B82F6',
        secondary_color TEXT DEFAULT '#10B981',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'patients',
    sql: `
      CREATE TABLE patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        cpf TEXT,
        birth_date DATE,
        address TEXT,
        emergency_contact TEXT,
        medical_history TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'professionals',
    sql: `
      CREATE TABLE professionals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        registration_number TEXT,
        specialty TEXT,
        phone TEXT,
        email TEXT,
        working_hours JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'appointments',
    sql: `
      CREATE TABLE appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        start_datetime TIMESTAMPTZ NOT NULL,
        end_datetime TIMESTAMPTZ NOT NULL,
        status TEXT DEFAULT 'scheduled',
        service_type TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'material_categories',
    sql: `
      CREATE TABLE material_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'materials',
    sql: `
      CREATE TABLE materials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        category_id UUID REFERENCES material_categories(id),
        name TEXT NOT NULL,
        brand TEXT,
        description TEXT,
        unit_type TEXT DEFAULT 'unidade',
        min_stock_level INTEGER DEFAULT 0,
        max_stock_level INTEGER DEFAULT 100,
        current_stock INTEGER DEFAULT 0,
        unit_cost DECIMAL(10,2) DEFAULT 0,
        supplier_name TEXT,
        supplier_contact TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }
];

// Função principal
async function createBasicTables() {
  console.log('Criando tabelas básicas do sistema...\n');
  
  // Primeiro, habilitar extensões
  try {
    await executeSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', 'Habilitando extensão uuid-ossp');
    await executeSql('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', 'Habilitando extensão pgcrypto');
  } catch (error) {
    console.log('Extensões podem já estar habilitadas, continuando...');
  }
  
  // Criar cada tabela
  for (const table of tables) {
    try {
      await executeSql(table.sql, `Criando tabela ${table.name}`);
    } catch (error) {
      console.error(`Erro ao criar tabela ${table.name}:`, error.message);
    }
  }
  
  console.log('\nProcesso concluído! Verificando tabelas criadas...');
  
  // Verificar tabelas criadas
  try {
    const result = await executeSql(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('tenants', 'patients', 'professionals', 'appointments', 'materials', 'material_categories') ORDER BY table_name;",
      'Verificando tabelas criadas'
    );
    
    console.log('\nTabelas criadas com sucesso:');
    if (result.result && result.result.length > 1) {
      for (let i = 1; i < result.result.length; i++) {
        console.log(`✅ ${result.result[i][0]}`);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error.message);
  }
}

// Executar
createBasicTables();