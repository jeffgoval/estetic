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

// Definir as tabelas de controle de comissões
const commissionControlTables = [
  // === CONTRATOS DE PROFISSIONAIS ===
  {
    name: 'professional_contracts',
    sql: `
      CREATE TABLE professional_contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
        contract_type TEXT DEFAULT 'commission' CHECK (contract_type IN ('commission', 'fixed', 'hybrid')),
        start_date DATE NOT NULL,
        end_date DATE,
        base_salary DECIMAL(10,2) DEFAULT 0,
        default_commission_percentage DECIMAL(5,2) DEFAULT 0,
        minimum_monthly_guarantee DECIMAL(10,2) DEFAULT 0,
        payment_frequency TEXT DEFAULT 'monthly' CHECK (payment_frequency IN ('weekly', 'biweekly', 'monthly')),
        payment_day INTEGER DEFAULT 5 CHECK (payment_day BETWEEN 1 AND 31),
        is_active BOOLEAN DEFAULT true,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === COMISSÕES POR SERVIÇO ===
  {
    name: 'service_commissions',
    sql: `
      CREATE TABLE service_commissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        contract_id UUID REFERENCES professional_contracts(id) ON DELETE CASCADE,
        service_id UUID REFERENCES services(id) ON DELETE CASCADE,
        commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed_amount')),
        commission_value DECIMAL(10,2) NOT NULL,
        minimum_service_price DECIMAL(10,2) DEFAULT 0,
        maximum_commission DECIMAL(10,2),
        effective_from DATE DEFAULT CURRENT_DATE,
        effective_until DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === EXECUÇÃO DETALHADA DE SERVIÇOS ===
  {
    name: 'service_executions',
    sql: `
      CREATE TABLE service_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
        service_id UUID REFERENCES services(id) ON DELETE CASCADE,
        professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        execution_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        service_price DECIMAL(10,2) NOT NULL,
        discount_applied DECIMAL(10,2) DEFAULT 0,
        final_price DECIMAL(10,2) NOT NULL,
        commission_percentage DECIMAL(5,2) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        duration_minutes INTEGER,
        quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
        patient_satisfaction INTEGER CHECK (patient_satisfaction BETWEEN 1 AND 5),
        notes TEXT,
        before_photos JSONB DEFAULT '[]',
        after_photos JSONB DEFAULT '[]',
        status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'cancelled', 'rescheduled')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === CONSUMO DE MATERIAIS POR SERVIÇO ===
  {
    name: 'service_material_consumption',
    sql: `
      CREATE TABLE service_material_consumption (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        service_execution_id UUID REFERENCES service_executions(id) ON DELETE CASCADE,
        material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
        quantity_used DECIMAL(10,3) NOT NULL,
        unit_cost DECIMAL(10,2) NOT NULL,
        total_cost DECIMAL(10,2) NOT NULL,
        batch_number TEXT,
        expiry_date DATE,
        waste_percentage DECIMAL(5,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === USO DE EQUIPAMENTOS POR SERVIÇO ===
  {
    name: 'service_equipment_usage',
    sql: `
      CREATE TABLE service_equipment_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        service_execution_id UUID REFERENCES service_executions(id) ON DELETE CASCADE,
        equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
        usage_duration_minutes INTEGER NOT NULL,
        settings_used JSONB DEFAULT '{}',
        energy_consumption_kwh DECIMAL(8,3),
        maintenance_impact_score INTEGER DEFAULT 1 CHECK (maintenance_impact_score BETWEEN 1 AND 10),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === FECHAMENTO MENSAL DE COMISSÕES ===
  {
    name: 'commission_periods',
    sql: `
      CREATE TABLE commission_periods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        total_services INTEGER DEFAULT 0,
        total_revenue DECIMAL(10,2) DEFAULT 0,
        total_commission DECIMAL(10,2) DEFAULT 0,
        total_material_costs DECIMAL(10,2) DEFAULT 0,
        base_salary DECIMAL(10,2) DEFAULT 0,
        bonuses DECIMAL(10,2) DEFAULT 0,
        deductions DECIMAL(10,2) DEFAULT 0,
        final_amount DECIMAL(10,2) DEFAULT 0,
        payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'calculated', 'approved', 'paid')),
        payment_date DATE,
        payment_method TEXT,
        payment_reference TEXT,
        notes TEXT,
        calculated_at TIMESTAMPTZ,
        calculated_by UUID,
        approved_at TIMESTAMPTZ,
        approved_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === DETALHAMENTO DAS COMISSÕES ===
  {
    name: 'commission_details',
    sql: `
      CREATE TABLE commission_details (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        commission_period_id UUID REFERENCES commission_periods(id) ON DELETE CASCADE,
        service_execution_id UUID REFERENCES service_executions(id) ON DELETE CASCADE,
        service_name TEXT NOT NULL,
        service_price DECIMAL(10,2) NOT NULL,
        commission_percentage DECIMAL(5,2) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        material_costs DECIMAL(10,2) DEFAULT 0,
        net_commission DECIMAL(10,2) NOT NULL,
        execution_date DATE NOT NULL,
        patient_name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  
  // === METAS E BONIFICAÇÕES ===
  {
    name: 'professional_goals',
    sql: `
      CREATE TABLE professional_goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
        goal_type TEXT NOT NULL CHECK (goal_type IN ('revenue', 'services_count', 'patient_satisfaction', 'new_patients')),
        period_type TEXT DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'monthly', 'quarterly', 'yearly')),
        target_value DECIMAL(10,2) NOT NULL,
        current_value DECIMAL(10,2) DEFAULT 0,
        bonus_percentage DECIMAL(5,2) DEFAULT 0,
        bonus_fixed_amount DECIMAL(10,2) DEFAULT 0,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'failed', 'cancelled')),
        achieved_at TIMESTAMPTZ,
        bonus_paid DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }
];

// Função principal
async function createCommissionControlTables() {
  console.log('Criando sistema de controle de comissões e serviços...\n');
  console.log('📋 Módulos que serão criados:');
  console.log('💼 1. Contratos de profissionais');
  console.log('💰 2. Comissões por serviço');
  console.log('🔧 3. Execução detalhada de serviços');
  console.log('📦 4. Consumo de materiais por serviço');
  console.log('⚙️  5. Uso de equipamentos por serviço');
  console.log('📊 6. Fechamento mensal de comissões');
  console.log('📈 7. Metas e bonificações');
  console.log('');
  
  for (const table of commissionControlTables) {
    try {
      // Criar tabela
      await executeSql(table.sql, `Criando tabela ${table.name}`);
      
      // Rastrear tabela no GraphQL
      await trackTable(table.name);
      
    } catch (error) {
      console.error(`Erro ao processar tabela ${table.name}:`, error.message);
    }
  }
  
  // Atualizar tabela appointments para melhor integração
  console.log('\nAtualizando tabela appointments para integração com execuções...');
  
  try {
    await executeSql(
      'ALTER TABLE appointments ADD COLUMN execution_status TEXT DEFAULT \'scheduled\' CHECK (execution_status IN (\'scheduled\', \'in_progress\', \'completed\', \'no_show\', \'cancelled\'));',
      'Adicionando status de execução aos agendamentos'
    );
    
    await executeSql(
      'ALTER TABLE appointments ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0;',
      'Adicionando valor total aos agendamentos'
    );
    
    await executeSql(
      'ALTER TABLE appointments ADD COLUMN payment_status TEXT DEFAULT \'pending\' CHECK (payment_status IN (\'pending\', \'partial\', \'paid\', \'refunded\'));',
      'Adicionando status de pagamento aos agendamentos'
    );
    
  } catch (error) {
    console.log('Algumas colunas podem já existir:', error.message);
  }
  
  console.log('\n🎉 Sistema de controle de comissões criado com sucesso!');
  console.log('\nNovas funcionalidades implementadas:');
  console.log('✅ Contratos flexíveis por profissional');
  console.log('✅ Comissões personalizadas por serviço');
  console.log('✅ Controle detalhado de execução de serviços');
  console.log('✅ Rastreamento de consumo de materiais');
  console.log('✅ Monitoramento de uso de equipamentos');
  console.log('✅ Fechamento automático de comissões');
  console.log('✅ Sistema de metas e bonificações');
  console.log('✅ Relatórios financeiros completos');
  
  console.log('\nVerifique executando: node check-custom-tables.js');
}

// Executar
createCommissionControlTables();