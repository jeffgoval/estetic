import https from 'https';

const NHOST_SUBDOMAIN = 'btpuysamjubovffxqlfu';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = 'pdEhEzOEExT$Q=sx^(mOd%B_t7aevwN';

// URL do endpoint GraphQL
const GRAPHQL_URL = `https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run/v1/graphql`;

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
        console.log('Status:', res.statusCode);
        console.log('Response:', responseData);
        
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

async function testBasicQueries() {
  console.log('Testando queries básicas...\n');

  // Teste 1: Query mais simples possível
  console.log('1. Testando query __typename:');
  try {
    const result1 = await executeQuery({
      query: `query { __typename }`
    });
    console.log('Resultado:', JSON.stringify(result1, null, 2));
  } catch (error) {
    console.log('Erro:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 2: Tentar listar tipos disponíveis
  console.log('2. Testando introspecção básica:');
  try {
    const result2 = await executeQuery({
      query: `query { __schema { types { name } } }`
    });
    console.log('Resultado:', JSON.stringify(result2, null, 2));
  } catch (error) {
    console.log('Erro:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Teste 3: Tentar uma tabela específica que deveria existir
  console.log('3. Testando query para tabela users:');
  try {
    const result3 = await executeQuery({
      query: `query { users { id } }`
    });
    console.log('Resultado:', JSON.stringify(result3, null, 2));
  } catch (error) {
    console.log('Erro:', error.message);
  }
}

testBasicQueries();