import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do Nhost
const NHOST_SUBDOMAIN = 'btpuysamjubovffxqlfu';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = 'pdEhEzOEExT$Q=sx^(mOd%B_t7aevwN';

// URL do endpoint GraphQL
const GRAPHQL_URL = `https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run/v1/graphql`;

// Função para executar SQL via GraphQL
async function executeSql(sql) {
  const query = {
    query: `
      mutation ExecuteSQL($sql: String!) {
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
        console.log('Response status:', res.statusCode);
        console.log('Response headers:', res.headers);
        console.log('Raw response:', responseData);
        
        try {
          const result = JSON.parse(responseData);
          if (result.errors) {
            reject(new Error(JSON.stringify(result.errors)));
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}. Raw response: ${responseData}`));
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

// Aplicar migração específica
async function applySingleMigration(filename) {
  const migrationPath = path.join(__dirname, 'nhost', 'migrations', filename);
  
  try {
    console.log(`Aplicando migração: ${filename}`);
    
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    console.log('SQL Content preview:', sqlContent.substring(0, 200) + '...');
    
    const result = await executeSql(sqlContent);
    console.log(`✅ Migração ${filename} aplicada com sucesso`);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`❌ Erro ao aplicar migração ${filename}:`, error.message);
  }
}

// Pegar o nome do arquivo da linha de comando
const filename = process.argv[2];
if (!filename) {
  console.error('Uso: node apply-single-migration.js <nome-do-arquivo>');
  process.exit(1);
}

applySingleMigration(filename);