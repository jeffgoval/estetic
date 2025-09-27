# Script para aplicar migrações no Nhost usando API REST
param(
    [string]$NhostSubdomain = $env:VITE_NHOST_SUBDOMAIN,
    [string]$NhostRegion = $env:VITE_NHOST_REGION,
    [Parameter(Mandatory=$true)]
    [string]$AdminSecret
)

if (-not $NhostSubdomain) {
    Write-Host "❌ VITE_NHOST_SUBDOMAIN não encontrado. Configure no .env.local" -ForegroundColor Red
    exit 1
}

if (-not $NhostRegion) {
    Write-Host "❌ VITE_NHOST_REGION não encontrado. Configure no .env.local" -ForegroundColor Red
    exit 1
}

$GraphQLEndpoint = "https://$NhostSubdomain.hasura.$NhostRegion.nhost.run/v1/graphql"
$HasuraEndpoint = "https://$NhostSubdomain.hasura.$NhostRegion.nhost.run/v1/query"

Write-Host "🚀 Aplicando migrações no Nhost..." -ForegroundColor Green
Write-Host "Endpoint: $GraphQLEndpoint" -ForegroundColor Cyan
Write-Host "Subdomain: $NhostSubdomain" -ForegroundColor Cyan
Write-Host "Region: $NhostRegion" -ForegroundColor Cyan

# Ler o arquivo de migração
$migrationContent = Get-Content -Path "nhost/migrations/001_initial_schema.sql" -Raw

# Aplicar migração usando SQL direto
$sqlQuery = @{
    type = "run_sql"
    args = @{
        sql = $migrationContent
        cascade = $false
        read_only = $false
    }
} | ConvertTo-Json -Depth 10

$headers = @{
    "Content-Type" = "application/json"
    "x-hasura-admin-secret" = $AdminSecret
}

try {
    Write-Host "📊 Aplicando schema inicial..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $HasuraEndpoint -Method POST -Body $sqlQuery -Headers $headers
    
    if ($response) {
        Write-Host "✅ Schema aplicado com sucesso!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erro ao aplicar schema: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception.Response)" -ForegroundColor Red
}

# Aplicar seeds
Write-Host "🌱 Aplicando dados iniciais (seeds)..." -ForegroundColor Yellow

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
    
    if ($response) {
        Write-Host "✅ Seeds aplicados com sucesso!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erro ao aplicar seeds: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception.Response)" -ForegroundColor Red
}

# Testar conexão GraphQL
Write-Host "🔍 Testando conexão GraphQL..." -ForegroundColor Yellow

$testQuery = @{
    query = "query { tenants { id name } }"
} | ConvertTo-Json

$graphqlHeaders = @{
    "Content-Type" = "application/json"
    "x-hasura-admin-secret" = $AdminSecret
}

try {
    $response = Invoke-RestMethod -Uri $GraphQLEndpoint -Method POST -Body $testQuery -Headers $graphqlHeaders
    
    if ($response.data.tenants) {
        Write-Host "✅ Conexão GraphQL funcionando! Encontrados $($response.data.tenants.Count) tenants" -ForegroundColor Green
        
        foreach ($tenant in $response.data.tenants) {
            Write-Host "  - $($tenant.name) (ID: $($tenant.id))" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "❌ Erro ao testar GraphQL: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Configuração do banco de dados concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Execute 'npm run codegen' para gerar os tipos TypeScript"
Write-Host "2. Execute 'npm run dev' para iniciar o desenvolvimento"
Write-Host "3. Acesse http://localhost:5173 para ver a aplicação"