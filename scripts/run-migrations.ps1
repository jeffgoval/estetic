# Script para aplicar migracoes no Nhost

Write-Host "Configurando banco de dados..." -ForegroundColor Green

# Ler admin secret
if (-not (Test-Path ".env.secrets")) {
    Write-Host "Arquivo .env.secrets nao encontrado!" -ForegroundColor Red
    exit 1
}

$AdminSecret = ""
$lines = Get-Content ".env.secrets"
foreach ($line in $lines) {
    if ($line -match "^HASURA_ADMIN_SECRET=(.+)$") {
        $AdminSecret = $matches[1].Trim()
        break
    }
}

if (-not $AdminSecret) {
    Write-Host "HASURA_ADMIN_SECRET nao configurado!" -ForegroundColor Red
    exit 1
}

$endpoint = "https://btpuysamjubovffxqlfu.hasura.sa-east-1.nhost.run/v1/query"
$headers = @{
    "Content-Type" = "application/json"
    "x-hasura-admin-secret" = $AdminSecret
}

Write-Host "Aplicando schema..." -ForegroundColor Yellow

# Aplicar migracao
$migration = Get-Content -Path "nhost/migrations/001_initial_schema.sql" -Raw
$body = @{
    type = "run_sql"
    args = @{
        sql = $migration
    }
} | ConvertTo-Json -Depth 10

try {
    Invoke-RestMethod -Uri $endpoint -Method POST -Body $body -Headers $headers | Out-Null
    Write-Host "Schema aplicado!" -ForegroundColor Green
} catch {
    Write-Host "Schema pode ja existir" -ForegroundColor Yellow
}

Write-Host "Aplicando dados iniciais..." -ForegroundColor Yellow

# Aplicar seeds
$seeds = Get-Content -Path "nhost/seeds/001_initial_data.sql" -Raw
$body = @{
    type = "run_sql"
    args = @{
        sql = $seeds
    }
} | ConvertTo-Json -Depth 10

try {
    Invoke-RestMethod -Uri $endpoint -Method POST -Body $body -Headers $headers | Out-Null
    Write-Host "Dados aplicados!" -ForegroundColor Green
} catch {
    Write-Host "Dados podem ja existir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Banco configurado!" -ForegroundColor Green
Write-Host "Execute: npm run codegen" -ForegroundColor Cyan