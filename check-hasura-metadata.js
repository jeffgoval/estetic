import https from 'https';

const NHOST_SUBDOMAIN = 'btpuysamjubovffxqlfu';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = 'pdEhEzOEExT$Q=sx^(mOd%B_t7aevwN';

// URL do endpoint de metadata do Hasura
const METADATA_URL = `https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run/v1/metadata`;

async function checkMetadata() {
  const query = {
    type: "export_metadata",
    args: {}
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
    const req = https.request(METADATA_URL, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          console.log('Raw response:', responseData);
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

async function listTablesFromMetadata() {
  try {
    console.log('Verificando metadata do Hasura...\n');
    
    const metadata = await checkMetadata();
    
    if (metadata.sources && metadata.sources.length > 0) {
      const defaultSource = metadata.sources.find(s => s.name === 'default');
      
      if (defaultSource && defaultSource.tables) {
        console.log(`Encontradas ${defaultSource.tables.length} tabelas:`);
        console.log('================================');
        
        defaultSource.tables.forEach((table, index) => {
          console.log(`${index + 1}. ${table.table.name}`);
        });
        
        console.log('\n================================');
        console.log(`Total: ${defaultSource.tables.length} tabelas`);
      } else {
        console.log('Nenhuma tabela encontrada no source default');
      }
    } else {
      console.log('Nenhum source encontrado');
      console.log('Metadata completa:', JSON.stringify(metadata, null, 2));
    }
    
  } catch (error) {
    console.error('Erro ao verificar metadata:', error.message);
  }
}

listTablesFromMetadata();