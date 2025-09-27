# Guia de Configuração de Produção

Este documento descreve como configurar e fazer deploy do sistema de gestão clínica em produção.

## 📋 Pré-requisitos

- Conta no Nhost Cloud
- Conta no Vercel ou Netlify
- Domínio personalizado (opcional)
- Conta no Google Cloud Console (para OAuth)
- Conta no Sentry (para monitoramento de erros)

## 🏗️ 1. Configuração do Nhost em Produção

### 1.1 Criar Projeto no Nhost Cloud

1. Acesse [Nhost Cloud](https://app.nhost.io)
2. Crie um novo projeto
3. Escolha a região mais próxima (recomendado: `sa-east-1` para Brasil)
4. Anote o `subdomain` e `region` do projeto

### 1.2 Configurar Variáveis de Ambiente no Nhost

No painel do Nhost, configure as seguintes variáveis:

```bash
# Secrets necessários
HASURA_GRAPHQL_ADMIN_SECRET=seu-admin-secret-super-seguro
NHOST_WEBHOOK_SECRET=seu-webhook-secret-super-seguro

# Configurações SMTP (exemplo com Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
SMTP_SENDER=noreply@suaempresa.com

# Google OAuth
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

### 1.3 Aplicar Migrações e Seeds

```bash
# Conectar ao projeto de produção
nhost login
nhost link --project-id seu-project-id

# Aplicar migrações
nhost hasura migrate apply --endpoint https://seu-subdomain.nhost.run/console

# Aplicar seeds (dados iniciais)
nhost hasura seed apply --endpoint https://seu-subdomain.nhost.run/console
```

### 1.4 Configurar Permissões do Hasura

1. Acesse o console do Hasura em produção
2. Configure as permissões conforme definido em `src/shared/config/permissions.ts`
3. Ative Row Level Security (RLS) para todas as tabelas multi-tenant

## 🌐 2. Configuração do Google OAuth

### 2.1 Configurar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou use um existente
3. Ative a API do Google+ 
4. Vá para "Credenciais" > "Criar credenciais" > "ID do cliente OAuth 2.0"

### 2.2 Configurar URLs Autorizadas

**JavaScript Origins:**
```
https://seu-dominio.com
https://www.seu-dominio.com
https://seu-subdomain.nhost.run
```

**Redirect URIs:**
```
https://seu-subdomain.nhost.run/v1/auth/signin/provider/google/callback
```

## 🚀 3. Deploy no Vercel

### 3.1 Configurar Variáveis de Ambiente

No painel do Vercel, configure:

```bash
VITE_NHOST_SUBDOMAIN=seu-subdomain
VITE_NHOST_REGION=sa-east-1
VITE_GOOGLE_CLIENT_ID=seu-google-client-id
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_ENABLE_APOLLO_DEVTOOLS=false
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_SENTRY_DSN=seu-sentry-dsn
VITE_CACHE_VERSION=1.0.0
```

### 3.2 Deploy Automático

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel --prod
```

## 🌍 4. Deploy no Netlify (Alternativa)

### 4.1 Configurar Variáveis de Ambiente

No painel do Netlify, configure as mesmas variáveis do Vercel.

### 4.2 Deploy Automático

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login no Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

## 🔒 5. Configuração de Domínio e SSL

### 5.1 Configurar Domínio Personalizado

**No Vercel:**
1. Vá para Settings > Domains
2. Adicione seu domínio
3. Configure os DNS records conforme instruído

**No Netlify:**
1. Vá para Domain settings
2. Adicione seu domínio personalizado
3. Configure os DNS records

### 5.2 Configurar SSL/TLS

Tanto Vercel quanto Netlify configuram SSL automaticamente via Let's Encrypt.

### 5.3 Atualizar Configurações do Nhost

Após configurar o domínio, atualize no Nhost:

1. Vá para Settings > Hasura
2. Atualize `cors_domain` para incluir seu domínio
3. Vá para Settings > Auth
4. Atualize `client_url` e `allowed_urls`

## 📊 6. Monitoramento e Observabilidade

### 6.1 Configurar Sentry

1. Crie conta no [Sentry](https://sentry.io)
2. Crie um novo projeto React
3. Copie o DSN e configure na variável `VITE_SENTRY_DSN`

### 6.2 Configurar Monitoramento de Performance

O sistema inclui hooks de monitoramento de performance que são ativados automaticamente em produção.

## 🔧 7. Scripts de Deploy

### 7.1 Script Automatizado

Execute o script de deploy:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 7.2 Deploy Manual

```bash
# Instalar dependências
npm ci

# Executar testes
npm run test:run

# Build
npm run build

# Deploy (escolha uma opção)
vercel --prod
# ou
netlify deploy --prod --dir=dist
```

## ✅ 8. Checklist de Produção

- [ ] Projeto Nhost criado e configurado
- [ ] Migrações aplicadas
- [ ] Seeds aplicados (dados iniciais)
- [ ] Permissões do Hasura configuradas
- [ ] Google OAuth configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado (Vercel/Netlify)
- [ ] Domínio personalizado configurado
- [ ] SSL/TLS ativo
- [ ] Monitoramento configurado
- [ ] Testes de produção realizados

## 🚨 9. Troubleshooting

### Erro de CORS
- Verifique se o domínio está configurado no Nhost
- Confirme as URLs no Google OAuth

### Erro de Autenticação
- Verifique as credenciais do Google OAuth
- Confirme as redirect URIs

### Erro de GraphQL
- Verifique as permissões do Hasura
- Confirme se as migrações foram aplicadas

### Performance Issues
- Ative o monitoramento de performance
- Verifique o bundle size
- Configure CDN se necessário

## 📞 10. Suporte

Para problemas específicos:
- Nhost: [Documentação](https://docs.nhost.io)
- Vercel: [Documentação](https://vercel.com/docs)
- Netlify: [Documentação](https://docs.netlify.com)