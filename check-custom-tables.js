import https from 'https';

// Configurações do Nhost
const NHOST_SUBDOMAIN = 'hfctgkywwvrgtqsiqyja';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = "@K'rre#Yx-9vU'2oYZ(oonwz:hrsMhXR";

// URL da API de query do Hasura
const HASURA_API_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run/v2/query`;

// Função para executar SQL
async function executeSql(sql) {
  const query = {
    type: "run_sql",
    args: {
      source: "default",
      sql: sql,
      cascade: false,
      read_only: true
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
            reject(new Error(JSON.stringify(result.error)));
          } else {
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

async function checkCustomTables() {
  console.log('Verificando tabelas customizadas criadas...\n');
  
  try {
    // Listar todas as tabelas que não são do sistema Nhost
    const sql = `
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name NOT LIKE 'auth%'
      AND table_name NOT IN ('users', 'buckets', 'files', 'virus')
      ORDER BY table_name;
    `;
    
    const result = await executeSql(sql);
    
    if (result.result && result.result.length > 1) {
      console.log('Tabelas customizadas encontradas:');
      console.log('==================================');
      
      let count = 0;
      for (let i = 1; i < result.result.length; i++) {
        const tableName = result.result[i][0];
        const columnCount = result.result[i][1];
        count++;
        console.log(`${count}. ${tableName} (${columnCount} colunas)`);
      }
      
      console.log(`\nTotal de tabelas customizadas: ${count}`);
      
      // Verificar se faltam tabelas esperadas
      const expectedTables = [
        'tenants', 'patients', 'professionals', 'appointments',
        'materials', 'material_categories', 'material_entries',
        'subscription_plans', 'feature_flags', 'billing_history',
        'waiting_list', 'anamnesis_templates', 'anamnesis_forms'
      ];
      
      console.log('\nVerificando tabelas esperadas:');
      console.log('==============================');
      
      const foundTables = [];
      for (let i = 1; i < result.result.length; i++) {
        foundTables.push(result.result[i][0]);
      }
      
      const missingTables = [];
      expectedTables.forEach(expectedTable => {
        const exists = foundTables.includes(expectedTable);
        console.log(`${exists ? '✅' : '❌'} ${expectedTable}`);
        if (!exists) {
          missingTables.push(expectedTable);
        }
      });
      
      if (missingTables.length > 0) {
        console.log(`\nTabelas faltando (${missingTables.length}):`);
        missingTables.forEach((table, index) => {
          console.log(`${index + 1}. ${table}`);
        });
      } else {
        console.log('\n🎉 Todas as tabelas esperadas foram criadas!');
      }
      
    } else {
      console.log('Nenhuma tabela customizada encontrada.');
    }
    
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error.message);
  }
}

checkCustomTables();