# ✅ Checklist de Deploy para Produção

Use este checklist para garantir que todos os passos necessários foram seguidos antes do deploy em produção.

## 🔧 Pré-Deploy

### Configuração do Ambiente
- [ ] Projeto Nhost criado no Nhost Cloud
- [ ] Região configurada (recomendado: `sa-east-1` para Brasil)
- [ ] Subdomain e region anotados
- [ ] Arquivo `.env.production` configurado com valores corretos

### Configuração do Banco de Dados
- [ ] Migrações aplicadas no ambiente de produção
- [ ] Seeds aplicados (dados iniciais)
- [ ] Row Level Security (RLS) ativado em todas as tabelas
- [ ] Permissões do Hasura configuradas corretamente
- [ ] Backup automático configurado

### Configuração de Autenticação
- [ ] Projeto Google Cloud Console criado
- [ ] OAuth 2.0 configurado com URLs corretas
- [ ] Client ID e Client Secret configurados no Nhost
- [ ] Redirect URIs configuradas
- [ ] Domínios autorizados configurados

### Configuração de Email
- [ ] Provedor SMTP configurado (Gmail, SendGrid, etc.)
- [ ] Credenciais SMTP configuradas no Nhost
- [ ] Templates de email testados
- [ ] Domínio de envio configurado

## 🏗️ Build e Testes

### Qualidade do Código
- [ ] Todos os testes passando (`npm run test:run`)
- [ ] Linting sem erros (`npm run lint`)
- [ ] TypeScript sem erros (`tsc --noEmit`)
- [ ] Build executado com sucesso (`npm run build`)

### Geração de Tipos
- [ ] GraphQL Codegen executado (`npm run codegen`)
- [ ] Tipos TypeScript atualizados
- [ ] Sem erros de tipagem

### Testes de Integração
- [ ] Conexão com GraphQL testada
- [ ] Autenticação testada
- [ ] Operações CRUD testadas
- [ ] Permissões testadas

## 🚀 Deploy

### Configuração da Plataforma (Vercel/Netlify)
- [ ] Conta criada na plataforma escolhida
- [ ] Projeto conectado ao repositório Git
- [ ] Variáveis de ambiente configuradas
- [ ] Build settings configurados
- [ ] Deploy de teste realizado

### Configuração de Domínio
- [ ] Domínio personalizado configurado (se aplicável)
- [ ] DNS records configurados
- [ ] SSL/TLS ativo e funcionando
- [ ] Redirecionamento HTTP → HTTPS ativo

### Configuração de Segurança
- [ ] Headers de segurança configurados
- [ ] CORS configurado no Nhost
- [ ] Rate limiting configurado
- [ ] Monitoramento de segurança ativo

## 📊 Monitoramento

### Observabilidade
- [ ] Sentry configurado para monitoramento de erros
- [ ] Métricas de performance ativas
- [ ] Logs de aplicação configurados
- [ ] Health checks implementados

### Analytics (Opcional)
- [ ] Google Analytics configurado (respeitando LGPD)
- [ ] Eventos importantes sendo rastreados
- [ ] Consentimento de cookies implementado

## 🔒 Segurança e Compliance

### Segurança
- [ ] Todas as variáveis sensíveis como secrets
- [ ] Nenhuma informação sensível no código
- [ ] Headers de segurança implementados
- [ ] Validação de entrada implementada

### LGPD/GDPR
- [ ] Política de privacidade atualizada
- [ ] Consentimento para coleta de dados
- [ ] Direito ao esquecimento implementado
- [ ] Portabilidade de dados disponível

## 🧪 Testes Pós-Deploy

### Funcionalidade Básica
- [ ] Login com Google funcionando
- [ ] Criação de pacientes funcionando
- [ ] Agendamento de consultas funcionando
- [ ] Dashboard carregando corretamente
- [ ] Relatórios sendo gerados

### Performance
- [ ] Tempo de carregamento < 3 segundos
- [ ] Core Web Vitals dentro dos limites
- [ ] Bundle size otimizado
- [ ] Lazy loading funcionando

### Responsividade
- [ ] Layout responsivo em mobile
- [ ] Layout responsivo em tablet
- [ ] Layout responsivo em desktop
- [ ] Navegação funcionando em todos os dispositivos

## 📋 Documentação

### Documentação Técnica
- [ ] README atualizado
- [ ] Documentação de API atualizada
- [ ] Guia de deploy atualizado
- [ ] Troubleshooting documentado

### Documentação do Usuário
- [ ] Manual do usuário atualizado
- [ ] Tutoriais em vídeo criados (opcional)
- [ ] FAQ atualizado
- [ ] Suporte técnico preparado

## 🚨 Plano de Contingência

### Rollback
- [ ] Plano de rollback documentado
- [ ] Backup da versão anterior disponível
- [ ] Processo de rollback testado
- [ ] Responsáveis pelo rollback definidos

### Monitoramento Pós-Deploy
- [ ] Alertas configurados para erros críticos
- [ ] Monitoramento de performance ativo
- [ ] Logs sendo coletados
- [ ] Equipe de suporte notificada

## 📞 Comunicação

### Stakeholders
- [ ] Equipe de desenvolvimento notificada
- [ ] Equipe de suporte notificada
- [ ] Usuários finais notificados (se necessário)
- [ ] Cronograma de deploy comunicado

### Canais de Comunicação
- [ ] Canal de comunicação para emergências definido
- [ ] Contatos de suporte atualizados
- [ ] Escalação de problemas definida

---

## ✅ Aprovação Final

- [ ] **Desenvolvedor Principal**: _________________ Data: _______
- [ ] **Tech Lead**: _________________ Data: _______
- [ ] **Product Owner**: _________________ Data: _______
- [ ] **DevOps/SRE**: _________________ Data: _______

---

**Data do Deploy**: _________________
**Versão**: _________________
**Responsável**: _________________

## 📝 Notas Adicionais

_Use este espaço para anotar observações específicas deste deploy:_

---

**⚠️ IMPORTANTE**: Não prossiga com o deploy se algum item crítico não estiver marcado. Em caso de dúvidas, consulte a documentação em `docs/PRODUCTION_SETUP.md`.