import https from 'https';

const NHOST_SUBDOMAIN = 'btpuysamjubovffxqlfu';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = 'pdEhEzOEExT$Q=sx^(mOd%B_t7aevwN';

// Diferentes endpoints possíveis do Nhost
const endpoints = [
  `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run/v1/graphql`,
  `https://${NHOST_SUBDOMAIN}.nhost.run/v1/graphql`,
  `https://${NHOST_SUBDOMAIN}.hasura.nhost.run/v1/graphql`,
  `https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run/v1/graphql`
];

async function testConnection(endpoint) {
  const query = {
    query: `query { __schema { queryType { name } } }`
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

  return new Promise((resolve) => {
    const req = https.request(endpoint, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ endpoint, success: !result.errors, response: result });
        } catch (error) {
          resolve({ endpoint, success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ endpoint, success: false, error: error.message });
    });

    req.write(data);
    req.end();
  });
}

async function testAllEndpoints() {
  console.log('Testando conexões com diferentes endpoints do Nhost...\n');
  
  for (const endpoint of endpoints) {
    console.log(`Testando: ${endpoint}`);
    const result = await testConnection(endpoint);
    
    if (result.success) {
      console.log('✅ Conexão bem-sucedida!');
      console.log('Endpoint correto:', endpoint);
      return endpoint;
    } else {
      console.log('❌ Falhou:', result.error || JSON.stringify(result.response));
    }
    console.log('');
  }
  
  console.log('Nenhum endpoint funcionou. Verifique:');
  console.log('1. Se o projeto Nhost está ativo');
  console.log('2. Se o admin secret está correto');
  console.log('3. Se o subdomain está correto');
}

testAllEndpoints();