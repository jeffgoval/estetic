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
        console.log('Response preview:', responseData.substring(0, 200));
        
        try {
          const result = JSON.parse(responseData);
          if (result.error) {
            reject(new Error(JSON.stringify(result.error)));
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

// Função principal para aplicar migrações
async function applyMigrationsViaRest() {
  const migrationsDir = path.join(__dirname, 'nhost', 'migrations');
  
  try {
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('Aplicando migrações via API REST do Hasura...\n');
    
    for (const file of files) {
      console.log(`Aplicando migração: ${file}`);
      
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Dividir o SQL em comandos individuais (separados por ;)
      const sqlCommands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
      
      console.log(`Executando ${sqlCommands.length} comandos SQL...`);
      
      for (let i = 0; i < sqlCommands.length; i++) {
        const command = sqlCommands[i];
        if (command.length > 10) { // Ignorar comandos muito pequenos
          try {
            console.log(`  Comando ${i + 1}/${sqlCommands.length}...`);
            await executeSqlViaRest(command);
            console.log(`  ✅ Comando ${i + 1} executado com sucesso`);
          } catch (error) {
            console.error(`  ❌ Erro no comando ${i + 1}:`, error.message);
            // Continuar com os próximos comandos mesmo se um falhar
          }
        }
      }
      
      console.log(`✅ Migração ${file} processada\n`);
    }
    
    console.log('Processo de migração concluído!');
  } catch (error) {
    console.error('Erro ao ler diretório de migrações:', error);
  }
}

// Executar migrações
applyMigrationsViaRest();