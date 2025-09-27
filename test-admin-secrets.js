import https from 'https';

const NHOST_SUBDOMAIN = 'btpuysamjubovffxqlfu';
const NHOST_REGION = 'sa-east-1';
const GRAPHQL_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run/v1/graphql`;

// Lista de admin secrets para testar
const adminSecrets = [
  'pdEhEzOEExT$Q=sx^(mOd%B_t7aevwN', // Do .env
  'pdEhEzOEExT$$Q=sx^(mOd%B_t7aevwN', // Do nhost.toml
  'pdEhEzOEExT$$Q=sx^(mOd%B_t7aevwN', // Do .nhost-admin-secret
  '', // Sem admin secret
  'admin', // Padrão comum
  'hasura', // Padrão comum
  'secret', // Padrão comum
];

async function testAdminSecret(adminSecret) {
  const query = {
    query: `query { __typename }`
  };

  const data = JSON.stringify(query);

  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  };

  // Adicionar admin secret apenas se não for vazio
  if (adminSecret) {
    headers['x-hasura-admin-secret'] = adminSecret;
  }

  const options = {
    method: 'POST',
    headers: headers
  };

  return new Promise((resolve) => {
    const req = https.request(GRAPHQL_URL, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ 
            adminSecret, 
            success: !result.errors || !result.errors.some(e => e.message.includes('invalid')),
            response: result 
          });
        } catch (error) {
          resolve({ adminSecret, success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ adminSecret, success: false, error: error.message });
    });

    req.write(data);
    req.end();
  });
}

async function testAllAdminSecrets() {
  console.log('Testando diferentes admin secrets...\n');
  
  for (const adminSecret of adminSecrets) {
    const displaySecret = adminSecret || '(sem admin secret)';
    console.log(`Testando: ${displaySecret}`);
    
    const result = await testAdminSecret(adminSecret);
    
    if (result.success) {
      console.log('✅ FUNCIONOU!');
      console.log('Admin secret correto:', adminSecret || '(sem admin secret)');
      console.log('Resposta:', JSON.stringify(result.response, null, 2));
      return adminSecret;
    } else {
      console.log('❌ Falhou');
      if (result.response && result.response.errors) {
        console.log('Erro:', result.response.errors[0].message);
      } else if (result.error) {
        console.log('Erro:', result.error);
      }
    }
    console.log('');
  }
  
  console.log('Nenhum admin secret funcionou.');
  console.log('Você precisa obter o admin secret correto do painel Nhost.');
  return null;
}

testAllAdminSecrets();