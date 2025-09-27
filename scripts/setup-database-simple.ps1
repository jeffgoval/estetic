# Script simples para configurar o banco de dados do Nhost

Write-Host "🚀 Configurando banco de dados do Nhost..." -ForegroundColor Green

# Ler admin secret do arquivo
if (-not (Test-Path ".env.secrets")) {
    Write-Host "❌ Arquivo .env.secrets não encontrado!" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content ".env.secrets"
$AdminSecret = ""

foreach ($line in $envContent) {
    if ($line -match "^HASURA_ADMIN_SECRET=(.+)$") {
        $AdminSecret = $matches[1].Trim()
        break
    }
}

if (-not $AdminSecret) {
    Write-Host "❌ HASURA_ADMIN_SECRET não encontrado!" -ForegroundColor Red
    exit 1
}

$GraphQLEndpoint = "https://btpuysamjubovffxqlfu.hasura.sa-east-1.nhost.run/v1/graphql"
$HasuraEndpoint = "https://btpuysamjubovffxqlfu.hasura.sa-east-1.nhost.run/v1/query"

Write-Host "Endpoint: $GraphQLEndpoint" -ForegroundColor Cyan

# Headers
$headers = @{
    "Content-Type" = "application/json"
    "x-hasura-admin-secret" = $AdminSecret
}

# Testar conexão
Write-Host "🔍 Testando conexão..." -ForegroundColor Yellow

$testQuery = '{"query": "{ __schema { types { name } } }"}'

try {
    $response = Invoke-RestMethod -Uri $GraphQLEndpoint -Method POST -Body $testQuery -Headers $headers
    Write-Host "✅ Conexão bem-sucedida!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro na conexão: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verificar se tabelas existem
Write-Host "🔍 Verificando tabelas..." -ForegroundColor Yellow

$tablesQuery = '{"query": "{ tenants { id } }"}'

try {
    $tablesResponse = Invoke-RestMethod -Uri $GraphQLEndpoint -Method POST -Body $tablesQuery -Headers $headers
    
    if ($tablesResponse.data.tenants) {
        Write-Host "✅ Tabelas já existem! Encontrados $($tablesResponse.data.tenants.Count) tenants" -ForegroundColor Green
    } else {
        Write-Host "📊 Aplicando migrações..." -ForegroundColor Yellow
        
        # Aplicar migração
        $migrationContent = Get-Content -Path "nhost/migrations/001_initial_schema.sql" -Raw
        $sqlQuery = @{
            type = "run_sql"
            args = @{
                sql = $migrationContent
            }
        } | ConvertTo-Json -Depth 10
        
        $migrationResponse = Invoke-RestMethod -Uri $HasuraEndpoint -Method POST -Body $sqlQuery -Headers $headers
        Write-Host "✅ Schema aplicado!" -ForegroundColor Green
        
        # Aplicar seeds
        Write-Host "🌱 Aplicando dados iniciais..." -ForegroundColor Yellow
        $seedContent = Get-Content -Path "nhost/seeds/001_initial_data.sql" -Raw
        $seedQuery = @{
            type = "run_sql"
            args = @{
                sql = $seedContent
            }
        } | ConvertTo-Json -Depth 10
        
        $seedResponse = Invoke-RestMethod -Uri $HasuraEndpoint -Method POST -Body $seedQuery -Headers $headers
        Write-Host "✅ Dados iniciais aplicados!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Erro: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Tentando aplicar migrações..." -ForegroundColor Yellow
    
    # Aplicar migração mesmo assim
    $migrationContent = Get-Content -Path "nhost/migrations/001_initial_schema.sql" -Raw
    $sqlQuery = @{
        type = "run_sql"
        args = @{
            sql = $migrationContent
        }
    } | ConvertTo-Json -Depth 10
    
    try {
        $migrationResponse = Invoke-RestMethod -Uri $HasuraEndpoint -Method POST -Body $sqlQuery -Headers $headers
        Write-Host "✅ Schema aplicado!" -ForegroundColor Green
        
        # Aplicar seeds
        $seedContent = Get-Content -Path "nhost/seeds/001_initial_data.sql" -Raw
        $seedQuery = @{
            type = "run_sql"
            args = @{
                sql = $seedContent
            }
        } | ConvertTo-Json -Depth 10
        
        $seedResponse = Invoke-RestMethod -Uri $HasuraEndpoint -Method POST -Body $seedQuery -Headers $headers
        Write-Host "✅ Dados iniciais aplicados!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao aplicar migrações: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "Execute: npm run codegen" -ForegroundColor Cyan
Write-Host "Execute: npm run dev" -ForegroundColor Cyan