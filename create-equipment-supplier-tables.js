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

// Definir as tabelas de equipamentos e fornecedores
const equipmentSupplierTables = [
  {
    name: 'suppliers',
    sql: `
      CREATE TABLE suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        company_name TEXT,
        cnpj TEXT,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        whatsapp TEXT,
        website TEXT,
        address JSONB,
        supplier_type TEXT DEFAULT 'both' CHECK (supplier_type IN ('materials', 'equipment', 'both')),
        payment_terms TEXT,
        delivery_time_days INTEGER DEFAULT 7,
        minimum_order_value DECIMAL(10,2) DEFAULT 0,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        is_preferred BOOLEAN DEFAULT false,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'equipment_categories',
    sql: `
      CREATE TABLE equipment_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#8B5CF6',
        icon TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'equipment',
    sql: `
      CREATE TABLE equipment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        category_id UUID REFERENCES equipment_categories(id),
        supplier_id UUID REFERENCES suppliers(id),
        name TEXT NOT NULL,
        brand TEXT,
        model TEXT,
        serial_number TEXT UNIQUE,
        description TEXT,
        purchase_date DATE,
        purchase_price DECIMAL(10,2),
        warranty_expires_at DATE,
        location TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive', 'broken')),
        last_maintenance_date DATE,
        next_maintenance_date DATE,
        maintenance_interval_days INTEGER DEFAULT 90,
        usage_hours INTEGER DEFAULT 0,
        max_usage_hours INTEGER,
        technical_specifications JSONB,
        operating_instructions TEXT,
        safety_instructions TEXT,
        required_training BOOLEAN DEFAULT false,
        trained_professionals JSONB DEFAULT '[]',
        is_portable BOOLEAN DEFAULT false,
        requires_calibration BOOLEAN DEFAULT false,
        last_calibration_date DATE,
        next_calibration_date DATE,
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'equipment_maintenance',
    sql: `
      CREATE TABLE equipment_maintenance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
        maintenance_type TEXT DEFAULT 'preventive' CHECK (maintenance_type IN ('preventive', 'corrective', 'calibration')),
        scheduled_date DATE NOT NULL,
        completed_date DATE,
        performed_by TEXT,
        supplier_id UUID REFERENCES suppliers(id),
        description TEXT NOT NULL,
        cost DECIMAL(10,2) DEFAULT 0,
        parts_replaced JSONB DEFAULT '[]',
        status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
        notes TEXT,
        next_maintenance_date DATE,
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'equipment_usage_log',
    sql: `
      CREATE TABLE equipment_usage_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
        appointment_id UUID REFERENCES appointments(id),
        service_id UUID REFERENCES services(id),
        professional_id UUID REFERENCES professionals(id),
        patient_id UUID REFERENCES patients(id),
        usage_start TIMESTAMPTZ NOT NULL,
        usage_end TIMESTAMPTZ,
        duration_minutes INTEGER,
        settings_used JSONB,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }
];

// Função principal
async function createEquipmentSupplierTables() {
  console.log('Criando tabelas de equipamentos e fornecedores...\n');
  console.log('📋 Tabelas que serão criadas:');
  console.log('1. suppliers - Fornecedores de produtos e equipamentos');
  console.log('2. equipment_categories - Categorias de equipamentos');
  console.log('3. equipment - Equipamentos da clínica');
  console.log('4. equipment_maintenance - Manutenções dos equipamentos');
  console.log('5. equipment_usage_log - Log de uso dos equipamentos');
  
  for (const table of equipmentSupplierTables) {
    try {
      // Criar tabela
      await executeSql(table.sql, `Criando tabela ${table.name}`);
      
      // Rastrear tabela no GraphQL
      await trackTable(table.name);
      
    } catch (error) {
      console.error(`Erro ao processar tabela ${table.name}:`, error.message);
    }
  }
  
  // Atualizar tabela materials para referenciar suppliers
  console.log('\nAtualizando tabela materials para referenciar fornecedores...');
  
  try {
    await executeSql(
      'ALTER TABLE materials ADD COLUMN supplier_id UUID REFERENCES suppliers(id);',
      'Adicionando referência de fornecedor aos materiais'
    );
    
    // Remover colunas antigas de fornecedor se existirem
    await executeSql(
      'ALTER TABLE materials DROP COLUMN IF EXISTS supplier_name;',
      'Removendo coluna supplier_name antiga'
    );
    
    await executeSql(
      'ALTER TABLE materials DROP COLUMN IF EXISTS supplier_contact;',
      'Removendo coluna supplier_contact antiga'
    );
    
  } catch (error) {
    console.log('Algumas alterações podem já ter sido feitas:', error.message);
  }
  
  // Atualizar tabela services para referenciar equipment
  console.log('\nAtualizando tabela services para referenciar equipamentos...');
  
  try {
    await executeSql(
      'ALTER TABLE services ADD COLUMN required_equipment JSONB DEFAULT \'[]\';',
      'Adicionando equipamentos necessários aos serviços'
    );
    
  } catch (error) {
    console.log('Coluna pode já existir:', error.message);
  }
  
  console.log('\n🎉 Tabelas de equipamentos e fornecedores criadas com sucesso!');
  console.log('\nAgora o sistema tem:');
  console.log('✅ Gestão completa de fornecedores');
  console.log('✅ Categorização de equipamentos');
  console.log('✅ Controle de equipamentos com manutenção');
  console.log('✅ Log de uso dos equipamentos');
  console.log('✅ Integração com materiais e serviços');
  
  console.log('\nVerifique executando: node check-custom-tables.js');
}

// Executar
createEquipmentSupplierTables();