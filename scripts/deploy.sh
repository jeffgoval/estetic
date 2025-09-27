#!/bin/bash

# Script de deploy para produção
# Este script automatiza o processo de deploy do sistema de gestão clínica

set -e  # Parar execução em caso de erro

echo "🚀 Iniciando processo de deploy para produção..."

# Verificar se estamos na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Deploy deve ser feito a partir da branch main. Branch atual: $CURRENT_BRANCH"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Há mudanças não commitadas. Faça commit antes do deploy."
    exit 1
fi

echo "✅ Verificações iniciais passaram"

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Executar testes
echo "🧪 Executando testes..."
npm run test:run

# Executar linting
echo "🔍 Verificando código..."
npm run lint

# Gerar tipos GraphQL
echo "🔄 Gerando tipos GraphQL..."
npm run codegen

# Build do projeto
echo "🏗️  Fazendo build do projeto..."
npm run build

echo "✅ Build concluído com sucesso!"

# Verificar se o diretório dist foi criado
if [ ! -d "dist" ]; then
    echo "❌ Diretório dist não foi criado. Verifique o build."
    exit 1
fi

echo "📊 Estatísticas do build:"
du -sh dist/
echo "Arquivos principais:"
ls -la dist/

echo "🎉 Deploy preparado com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Configure as variáveis de ambiente no Vercel/Netlify"
echo "2. Configure o domínio personalizado"
echo "3. Configure SSL/TLS"
echo "4. Configure o Nhost para produção"
echo ""
echo "Para Vercel: vercel --prod"
echo "Para Netlify: netlify deploy --prod --dir=dist"