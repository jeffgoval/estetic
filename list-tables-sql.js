import https from 'https';

const NHOST_SUBDOMAIN = 'btpuysamjubovffxqlfu';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = 'pdEhEzOEExT$Q=sx^(mOd%B_t7aevwN';

// URL do endpoint GraphQL
const GRAPHQL_URL = `https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run/v1/graphql`;

async function executeSql(sql) {
  const query = {
    query: `
      query ExecuteSQL($sql: String!) {
        execute_sql(sql: $sql) {
          result_type
          result
        }
      }
    `,
    variables: {
      sql: sql
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
    const req = https.request(GRAPHQL_URL, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.errors) {
            reject(new Error(JSON.stringify(result.errors)));
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
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

async function listTables() {
  try {
    console.log('Listando tabelas no PostgreSQL...\n');
    
    // Query SQL para listar todas as tabelas
    const sql = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const result = await executeSql(sql);
    
    if (result.data && result.data.execute_sql) {
      const tables = result.data.execute_sql.result;
      
      console.log(`Encontradas ${tables.length - 1} tabelas:` ); // -1 para excluir o header
      console.log('================================');
      
      // Pular o primeiro item que é o header
      for (let i = 1; i < tables.length; i++) {
        console.log(`${i}. ${tables[i][0]}`);
      }
      
      console.log('\n================================');
      console.log(`Total: ${tables.length - 1} tabelas`);
      
      // Verificar se as tabelas esperadas existem
      const expectedTables = [
        'tenants', 'users', 'patients', 'professionals', 'appointments',
        'materials', 'material_categories', 'material_entries',
        'subscription_plans', 'feature_flags', 'billing_history',
        'waiting_list', 'anamnesis_templates', 'anamnesis_forms'
      ];
      
      console.log('\nVerificando tabelas esperadas:');
      console.log('==============================');
      
      const tableNames = tables.slice(1).map(row => row[0]);
      
      expectedTables.forEach(expectedTable => {
        const exists = tableNames.includes(expectedTable);
        console.log(`${exists ? '✅' : '❌'} ${expectedTable}`);
      });
      
    } else {
      console.log('Nenhuma tabela encontrada ou erro na resposta');
      console.log('Resposta completa:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('Erro ao listar tabelas:', error.message);
  }
}

listTables();