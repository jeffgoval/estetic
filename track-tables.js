import https from 'https';

// Configurações do Nhost
const NHOST_SUBDOMAIN = 'hfctgkywwvrgtqsiqyja';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = "@K'rre#Yx-9vU'2oYZ(oonwz:hrsMhXR";

// URL da API de metadata do Hasura
const HASURA_METADATA_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run/v1/metadata`;

// Função para executar comando de metadata
async function executeMetadataCommand(command, description) {
  console.log(`\nExecutando: ${description}`);
  
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

// Lista de tabelas para rastrear
const tablesToTrack = [
  'tenants',
  'patients', 
  'professionals',
  'appointments',
  'material_categories',
  'materials'
];

// Função principal
async function trackTables() {
  console.log('Rastreando tabelas no Hasura GraphQL...\n');
  
  for (const tableName of tablesToTrack) {
    try {
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
      
      await executeMetadataCommand(command, `Rastreando tabela ${tableName}`);
    } catch (error) {
      console.error(`Erro ao rastrear tabela ${tableName}:`, error.message);
    }
  }
  
  console.log('\nProcesso de rastreamento concluído!');
  console.log('\nAgora as tabelas devem aparecer na API GraphQL.');
  console.log('Teste executando: node simple-table-check.js');
}

// Executar
trackTables();