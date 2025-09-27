# Script para testar conexão com Nhost
param(
    [Parameter(Mandatory=$true)]
    [string]$AdminSecret,
    [string]$NhostSubdomain = "btpuysamjubovffxqlfu",
    [string]$NhostRegion = "sa-east-1"
)

$GraphQLEndpoint = "https://$NhostSubdomain.hasura.$NhostRegion.nhost.run/v1/graphql"

Write-Host "🔍 Testando conexão com Nhost..." -ForegroundColor Yellow
Write-Host "Endpoint: $GraphQLEndpoint" -ForegroundColor Cyan

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
        Write-Host "Schema contém $($response.data.__schema.types.Count) tipos" -ForegroundColor Cyan
        
        # Testar se já existem tabelas
        $tablesQuery = @{
            query = "{ __schema { queryType { fields { name } } } }"
        } | ConvertTo-Json
        
        $tablesResponse = Invoke-RestMethod -Uri $GraphQLEndpoint -Method POST -Body $tablesQuery -Headers $headers
        
        $tableFields = $tablesResponse.data.__schema.queryType.fields | Where-Object { $_.name -match "^(tenants|users|patients|appointments)" }
        
        if ($tableFields.Count -gt 0) {
            Write-Host "✅ Tabelas já existem no banco:" -ForegroundColor Green
            foreach ($field in $tableFields) {
                Write-Host "  - $($field.name)" -ForegroundColor Cyan
            }
        } else {
            Write-Host "⚠️ Nenhuma tabela encontrada. Migrações precisam ser aplicadas." -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Resposta inválida do GraphQL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro na conexão: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detalhes: $responseBody" -ForegroundColor Red
    }
}