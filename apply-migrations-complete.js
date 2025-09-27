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

// URL da API de query do Hasura
const HASURA_API_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run/v2/query`;

// Função para executar SQL via API REST do Hasura
async function executeSqlViaRest(sql) {
  const query = {
    type: "run_sql",
    args: {
      source: "default",
      sql: sql,
      cascade: false,
      read_only: false
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
        console.log('Status:', res.statusCode);
        
        try {
          const result = JSON.parse(responseData);
          if (result.error) {
            console.log('Erro detalhado:', JSON.stringify(result.error, null, 2));
            reject(new Error(JSON.stringify(result.error)));
          } else {
            console.log('Sucesso! Resultado:', result.result_type);
            resolve(result);
          }
        } catch (error) {
          console.log('Erro de parse. Response:', responseData);
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

// Função principal para aplicar migrações
async function applyMigrationsComplete() {
  const migrationsDir = path.join(__dirname, 'nhost', 'migrations');
  
  try {
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('Aplicando migrações completas via API REST do Hasura...\n');
    
    for (const file of files) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Aplicando migração: ${file}`);
      console.log('='.repeat(60));
      
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      console.log(`Tamanho do arquivo: ${sqlContent.length} caracteres`);
      console.log('Executando SQL completo...\n');
      
      try {
        await executeSqlViaRest(sqlContent);
        console.log(`\n✅ Migração ${file} aplicada com SUCESSO!`);
      } catch (error) {
        console.error(`\n❌ Erro ao aplicar migração ${file}:`);
        console.error(error.message);
        
        // Não parar o processo, continuar com as próximas migrações
        console.log('\nContinuando com a próxima migração...');
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Processo de migração concluído!');
    console.log('='.repeat(60));
    
    // Verificar tabelas criadas
    console.log('\nVerificando tabelas criadas...');
    await verifyTables();
    
  } catch (error) {
    console.error('Erro ao ler diretório de migrações:', error);
  }
}

// Função para verificar tabelas criadas
async function verifyTables() {
  try {
    const query = {
      type: "run_sql",
      args: {
        source: "default",
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;",
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
              console.log('\nTabelas no banco:');
              console.log('================');
              
              if (result.result && result.result.length > 1) {
                for (let i = 1; i < result.result.length; i++) {
                  console.log(`${i}. ${result.result[i][0]}`);
                }
                console.log(`\nTotal: ${result.result.length - 1} tabelas`);
              }
              
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
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error.message);
  }
}

// Executar migrações
applyMigrationsComplete();