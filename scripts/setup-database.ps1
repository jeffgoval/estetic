# Script para configurar o banco de dados do Nhost
# Lê o admin secret do arquivo .env.secrets

Write-Host "🚀 Configurando banco de dados do Nhost..." -ForegroundColor Green

# Verificar se o arquivo .env.secrets existe
if (-not (Test-Path ".env.secrets")) {
    Write-Host "❌ Arquivo .env.secrets não encontrado!" -ForegroundColor Red
    Write-Host "Crie o arquivo .env.secrets com o HASURA_ADMIN_SECRET" -ForegroundColor Yellow
    exit 1
}

# Ler variáveis do arquivo .env.secrets
$envContent = Get-Content ".env.secrets" | Where-Object { $_ -match "^[^#].*=" }
$envVars = @{}

foreach ($line in $envContent) {
    if ($line -match "^([^=]+)=(.*)$") {
        $envVars[$matches[1].Trim()] = $matches[2].Trim()
    }
}

$AdminSecret = $envVars["HASURA_ADMIN_SECRET"]
$NhostSubdomain = "btpuysamjubovffxqlfu"
$NhostRegion = "sa-east-1"

if (-not $AdminSecret) {
    Write-Host "❌ HASURA_ADMIN_SECRET não encontrado no .env.secrets!" -ForegroundColor Red
    Write-Host "Configure o admin secret no arquivo .env.secrets" -ForegroundColor Yellow
    exit 1
}

$GraphQLEndpoint = "https://$NhostSubdomain.hasura.$NhostRegion.nhost.run/v1/graphql"
$HasuraEndpoint = "https://$NhostSubdomain.hasura.$NhostRegion.nhost.run/v1/query"

Write-Host "Endpoint: $GraphQLEndpoint" -ForegroundColor Cyan

# Testar conexão primeiro
Write-Host "🔍 Testando conexão..." -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
    "x-hasura-admin-secret" = $AdminSecret
}

$testQuery = @{
    query = "{ __schema { types { name } } }"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $GraphQLEndpoint -Method POST -Body $testQuery -Headers $headers
    
    if ($response.data) {
        Write-Host "✅ Conexão bem-sucedida!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro na conexão GraphQL" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro na conexão: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verificar se as tabelas já existem
Write-Host "🔍 Verificando tabelas existentes..." -ForegroundColor Yellow

$tablesQuery = @{
    query = "{ __schema { queryType { fields { name } } } }"
} | ConvertTo-Json

try {
    $tablesResponse = Invoke-RestMethod -Uri $GraphQLEndpoint -Method POST -Body $tablesQuery -Headers $headers
    $tableFields = $tablesResponse.data.__schema.queryType.fields | Where-Object { $_.name -match "^(tenants|users|patients|appointments)" }
    
    if ($tableFields.Count -gt 0) {
        Write-Host "✅ Tabelas já existem no banco:" -ForegroundColor Green
        foreach ($field in $tableFields) {
            Write-Host "  - $($field.name)" -ForegroundColor Cyan
        }
        Write-Host "⚠️ Pulando aplicação de migrações (tabelas já existem)" -ForegroundColor Yellow
    } else {
        Write-Host "📊 Aplicando migrações..." -ForegroundColor Yellow
        
        # Ler e aplicar migração
        $migrationContent = Get-Content -Path "nhost/migrations/001_initial_schema.sql" -Raw
        
        $sqlQuery = @{
            type = "run_sql"
            args = @{
                sql = $migrationContent
                cascade = $false
                read_only = $false
            }
        } | ConvertTo-Json -Depth 10
        
        try {
            $response = Invoke-RestMethod -Uri $HasuraEndpoint -Method POST -Body $sqlQuery -Headers $headers
            Write-Host "✅ Schema aplicado com sucesso!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erro ao aplicar schema: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
        
        # Aplicar seeds
        Write-Host "🌱 Aplicando dados iniciais..." -ForegroundColor Yellow
        
        $seedContent = Get-Content -Path "nhost/seeds/001_initial_data.sql" -Raw
        
        $seedQuery = @{
            type = "run_sql"
            args = @{
                sql = $seedContent
                cascade = $false
                read_only = $false
            }
        } | ConvertTo-Json -Depth 10
        
        try {
            $response = Invoke-RestMethod -Uri $HasuraEndpoint -Method POST -Body $seedQuery -Headers $headers
            Write-Host "✅ Dados iniciais aplicados com sucesso!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erro ao aplicar dados iniciais: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "❌ Erro ao verificar tabelas: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
    }
} catch {
    Write-Host "❌ Erro ao verificar tabelas: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste final - verificar dados
Write-Host "🔍 Verificando dados..." -ForegroundColor Yellow

$finalTestQuery = @{
    query = "{ tenants { id name } subscription_plans { id name } }"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $GraphQLEndpoint -Method POST -Body $finalTestQuery -Headers $headers
    
    if ($response.data.tenants) {
        Write-Host "✅ Banco configurado com sucesso!" -ForegroundColor Green
        Write-Host "Tenants encontrados: $($response.data.tenants.Count)" -ForegroundColor Cyan
        Write-Host "Planos encontrados: $($response.data.subscription_plans.Count)" -ForegroundColor Cyan
        
        foreach ($tenant in $response.data.tenants) {
            Write-Host "  - $($tenant.name) (ID: $($tenant.id))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "⚠️ Erro ao verificar dados finais: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Execute: npm run codegen" -ForegroundColor White
Write-Host "2. Execute: npm run dev" -ForegroundColor White
Write-Host "3. Acesse: http://localhost:5173" -ForegroundColor White