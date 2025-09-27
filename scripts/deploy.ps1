# Script de deploy para produção (PowerShell)
# Este script automatiza o processo de deploy do sistema de gestão clínica

param(
    [switch]$SkipTests,
    [switch]$SkipLint,
    [string]$Platform = "vercel"
)

Write-Host "🚀 Iniciando processo de deploy para produção..." -ForegroundColor Green

# Verificar se estamos na branch main
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "❌ Deploy deve ser feito a partir da branch main. Branch atual: $currentBranch" -ForegroundColor Red
    exit 1
}

# Verificar se há mudanças não commitadas
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "❌ Há mudanças não commitadas. Faça commit antes do deploy." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Verificações iniciais passaram" -ForegroundColor Green

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao instalar dependências" -ForegroundColor Red
    exit 1
}

# Executar testes (se não for pulado)
if (-not $SkipTests) {
    Write-Host "🧪 Executando testes..." -ForegroundColor Yellow
    npm run test:run
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Testes falharam" -ForegroundColor Red
        exit 1
    }
}

# Executar linting (se não for pulado)
if (-not $SkipLint) {
    Write-Host "🔍 Verificando código..." -ForegroundColor Yellow
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Linting falhou" -ForegroundColor Red
        exit 1
    }
}

# Gerar tipos GraphQL
Write-Host "🔄 Gerando tipos GraphQL..." -ForegroundColor Yellow
npm run codegen
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao gerar tipos GraphQL" -ForegroundColor Red
    exit 1
}

# Build do projeto
Write-Host "🏗️ Fazendo build do projeto..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green

# Verificar se o diretório dist foi criado
if (-not (Test-Path "dist")) {
    Write-Host "❌ Diretório dist não foi criado. Verifique o build." -ForegroundColor Red
    exit 1
}

Write-Host "📊 Estatísticas do build:" -ForegroundColor Cyan
$distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
$distSizeMB = [math]::Round($distSize / 1MB, 2)
Write-Host "Tamanho total: $distSizeMB MB"

Write-Host "Arquivos principais:" -ForegroundColor Cyan
Get-ChildItem -Path "dist" | Format-Table Name, Length, LastWriteTime

# Deploy baseado na plataforma escolhida
switch ($Platform.ToLower()) {
    "vercel" {
        Write-Host "🚀 Fazendo deploy no Vercel..." -ForegroundColor Yellow
        npm run deploy:vercel
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Deploy no Vercel falhou" -ForegroundColor Red
            exit 1
        }
    }
    "netlify" {
        Write-Host "🚀 Fazendo deploy no Netlify..." -ForegroundColor Yellow
        npm run deploy:netlify
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Deploy no Netlify falhou" -ForegroundColor Red
            exit 1
        }
    }
    default {
        Write-Host "⚠️ Plataforma '$Platform' não reconhecida. Deploy manual necessário." -ForegroundColor Yellow
    }
}

Write-Host "🎉 Deploy preparado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure as variáveis de ambiente no Vercel/Netlify"
Write-Host "2. Configure o domínio personalizado"
Write-Host "3. Configure SSL/TLS"
Write-Host "4. Configure o Nhost para produção"
Write-Host ""
Write-Host "Comandos úteis:" -ForegroundColor Cyan
Write-Host "Para Vercel: npm run deploy:vercel"
Write-Host "Para Netlify: npm run deploy:netlify"
Write-Host "Para Docker: npm run docker:build && npm run docker:run"