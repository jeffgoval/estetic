import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do Nhost
const NHOST_SUBDOMAIN = 'hfctgkywwvrgtqsiqyja';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = "@K'rre#Yx-9vU'2oYZ(oonwz:hrsMhXR";

// URL do endpoint GraphQL
const GRAPHQL_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run/v1/graphql`;

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

// Função principal para aplicar migrações
async function applyMigrations() {
  const migrationsDir = path.join(__dirname, 'nhost', 'migrations');
  
  try {
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('Aplicando migrações...');
    
    for (const file of files) {
      console.log(`Aplicando migração: ${file}`);
      
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      try {
        await executeSql(sqlContent);
        console.log(`✅ Migração ${file} aplicada com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao aplicar migração ${file}:`, error.message);
        // Continue com as próximas migrações mesmo se uma falhar
      }
    }
    
    console.log('Processo de migração concluído!');
  } catch (error) {
    console.error('Erro ao ler diretório de migrações:', error);
  }
}

// Executar migrações
applyMigrations();