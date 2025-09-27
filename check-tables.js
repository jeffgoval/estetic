import https from 'https';

const NHOST_SUBDOMAIN = 'btpuysamjubovffxqlfu';
const NHOST_REGION = 'sa-east-1';
const ADMIN_SECRET = 'pdEhEzOEExT$Q=sx^(mOd%B_t7aevwN';

// URL do endpoint GraphQL
const GRAPHQL_URL = `https://${NHOST_SUBDOMAIN}.graphql.${NHOST_REGION}.nhost.run/v1/graphql`;

async function checkTables() {
    // Query para listar todas as tabelas
    const query = {
        query: `
      query {
        __schema {
          types {
            name
            kind
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

async function listTables() {
    try {
        console.log('Verificando tabelas no Nhost...\n');

        const result = await checkTables();

        // Filtrar apenas os tipos que são tabelas (OBJECT e não começam com __)
        const tables = result.data.__schema.types
            .filter(type =>
                type.kind === 'OBJECT' &&
                !type.name.startsWith('__') &&
                !type.name.startsWith('Query') &&
                !type.name.startsWith('Mutation') &&
                !type.name.startsWith('Subscription') &&
                type.fields && type.fields.length > 0
            )
            .map(type => type.name)
            .sort();

        console.log(`Encontradas ${tables.length} tabelas:`);
        console.log('================================');

        tables.forEach((table, index) => {
            console.log(`${index + 1}. ${table}`);
        });

        console.log('\n================================');
        console.log(`Total: ${tables.length} tabelas`);

        // Verificar se as tabelas esperadas existem
        const expectedTables = [
            'tenants', 'users', 'patients', 'professionals', 'appointments',
            'materials', 'material_categories', 'material_entries',
            'subscription_plans', 'feature_flags', 'billing_history',
            'waiting_list', 'anamnesis_templates', 'anamnesis_forms'
        ];

        console.log('\nVerificando tabelas esperadas:');
        console.log('==============================');

        expectedTables.forEach(expectedTable => {
            const exists = tables.some(table =>
                table.toLowerCase() === expectedTable.toLowerCase()
            );
            console.log(`${exists ? '✅' : '❌'} ${expectedTable}`);
        });

    } catch (error) {
        console.error('Erro ao verificar tabelas:', error.message);
    }
}

listTables();