import https from 'https';

const NHOST_SUBDOMAIN = 'hfctgkywwvrgtqsiqyja';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = "@K'rre#Yx-9vU'2oYZ(oonwz:hrsMhXR";

// URL do endpoint GraphQL
const GRAPHQL_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run/v1/graphql`;

async function checkSpecificTables() {
  // Lista de tabelas que esperamos encontrar
  const expectedTables = [
    'tenants', 'users', 'patients', 'professionals', 'appointments',
    'materials', 'material_categories', 'material_entries',
    'subscription_plans', 'feature_flags', 'billing_history'
  ];

  console.log('Verificando tabelas específicas...\n');

  for (const tableName of expectedTables) {
    try {
      const query = {
        query: `query { ${tableName}(limit: 1) { __typename } }`
      };

      const result = await executeQuery(query);
      
      if (result.data && result.data[tableName] !== undefined) {
        console.log(`✅ ${tableName} - existe`);
      } else if (result.errors) {
        const error = result.errors[0];
        if (error.message.includes('field') && error.message.includes('not found')) {
          console.log(`❌ ${tableName} - não existe`);
        } else {
          console.log(`⚠️  ${tableName} - erro: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${tableName} - erro de conexão: ${error.message}`);
    }
  }
}

async function executeQuery(query) {
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
          resolve(result);
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

// Também vamos tentar uma query de introspecção mais simples
async function checkSchema() {
  try {
    console.log('\nVerificando schema disponível...\n');
    
    const query = {
      query: `
        query IntrospectionQuery {
          __schema {
            queryType {
              fields {
                name
                type {
                  name
                }
              }
            }
          }
        }
      `
    };

    const result = await executeQuery(query);
    
    if (result.data && result.data.__schema && result.data.__schema.queryType) {
      const fields = result.data.__schema.queryType.fields;
      const tableFields = fields.filter(field => 
        !field.name.startsWith('__') && 
        !field.name.includes('aggregate') &&
        !field.name.includes('by_pk')
      );
      
      console.log('Tabelas encontradas no schema:');
      console.log('============================');
      
      tableFields.forEach((field, index) => {
        console.log(`${index + 1}. ${field.name}`);
      });
      
      console.log(`\nTotal: ${tableFields.length} tabelas`);
    } else {
      console.log('Erro ao obter schema:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Erro ao verificar schema:', error.message);
  }
}

async function main() {
  await checkSpecificTables();
  await checkSchema();
}

main();