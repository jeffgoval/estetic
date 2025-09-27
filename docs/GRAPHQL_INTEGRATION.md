# Integração GraphQL com Nhost

Este documento descreve como a integração GraphQL foi implementada no sistema de gestão clínica.

## Visão Geral

A integração substitui os dados mock por queries e mutations GraphQL reais, utilizando:

- **Nhost** como backend-as-a-service
- **Apollo Client** para gerenciamento de estado GraphQL
- **GraphQL Code Generator** para geração automática de tipos TypeScript
- **Subscriptions** para atualizações em tempo real
- **Row Level Security (RLS)** para isolamento multi-tenant

## Estrutura de Arquivos

```
src/
├── graphql/                    # Arquivos GraphQL
│   ├── schema.graphql         # Schema base para geração de tipos
│   ├── simple-queries.graphql # Queries simplificadas para codegen
│   ├── patients.graphql       # Queries específicas de pacientes
│   ├── appointments.graphql   # Queries de agendamentos
│   ├── professionals.graphql  # Queries de profissionais
│   ├── materials.graphql      # Queries de materiais
│   ├── waiting-list.graphql   # Queries de lista de espera
│   ├── anamnesis.graphql      # Queries de anamnese
│   ├── dashboard.graphql      # Queries do dashboard
│   └── super-admin.graphql    # Queries do super admin
├── generated/
│   └── graphql.ts            # Tipos e hooks gerados automaticamente
├── shared/
│   ├── config/
│   │   ├── apollo.ts         # Configuração do Apollo Client
│   │   ├── nhost.ts          # Configuração do Nhost
│   │   └── permissions.ts    # Configurações de permissões RLS
│   ├── hooks/
│   │   ├── useGraphQLError.ts    # Hook para tratamento de erros
│   │   ├── useDataValidation.ts  # Hook para validação de dados
│   │   ├── patients/usePatients.ts # Hook atualizado para GraphQL
│   │   ├── appointments/useAppointments.ts
│   │   ├── professionals/useProfessionals.ts
│   │   ├── materials/useMaterials.ts
│   │   └── dashboard/useDashboard.ts
│   └── providers/
│       └── ApolloProvider.tsx # Provider do Apollo Client
```

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` com as configurações do Nhost:

```env
# Configuração local do Nhost
VITE_NHOST_SUBDOMAIN=localhost
VITE_NHOST_REGION=local

# URLs do GraphQL para desenvolvimento local
VITE_GRAPHQL_URL=http://localhost:8080/v1/graphql
VITE_GRAPHQL_WS_URL=ws://localhost:8080/v1/graphql

# Configurações de debug
VITE_DEBUG_MODE=true
VITE_ENABLE_APOLLO_DEVTOOLS=true
```

### 2. Inicializar Nhost Local

```bash
# Instalar Nhost CLI
npm install -g @nhost/cli

# Iniciar Nhost local
npm run nhost
```

### 3. Executar Migrações

As migrações são executadas automaticamente quando o Nhost inicia. Os arquivos estão em:

- `nhost/migrations/001_initial_schema.sql` - Schema inicial
- `nhost/seeds/001_initial_data.sql` - Dados de exemplo

### 4. Gerar Tipos TypeScript

```bash
# Gerar tipos a partir dos arquivos GraphQL
npm run codegen

# Ou em modo watch para desenvolvimento
npm run codegen:watch
```

## Uso dos Hooks

### Hook de Pacientes

```typescript
import { usePatients } from '@/shared/hooks';

function PatientsPage() {
  const {
    patients,
    loading,
    error,
    createPatient,
    fetchPatients,
    setSearchTerm,
    setFilters,
  } = usePatients();

  // Criar novo paciente
  const handleCreatePatient = async (data) => {
    try {
      await createPatient(data);
      // Paciente será adicionado automaticamente via subscription
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
    }
  };

  return (
    <div>
      {loading && <div>Carregando...</div>}
      {error && <div>Erro: {error}</div>}
      
      {patients.map(patient => (
        <div key={patient.id}>{patient.name}</div>
      ))}
    </div>
  );
}
```

### Hook de Agendamentos

```typescript
import { useAppointments } from '@/shared/hooks';

function SchedulePage() {
  const {
    appointments,
    loading,
    createAppointment,
    setFilters,
  } = useAppointments({
    dateRange: {
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-31T23:59:59Z'
    }
  });

  return (
    <div>
      {appointments.map(appointment => (
        <div key={appointment.id}>
          {appointment.title} - {appointment.patient?.name}
        </div>
      ))}
    </div>
  );
}
```

### Hook de Dashboard

```typescript
import { useDashboard } from '@/shared/hooks';

function DashboardPage() {
  const {
    stats,
    todayAppointments,
    lowStockMaterials,
    loading,
  } = useDashboard();

  return (
    <div>
      <div>Total de Pacientes: {stats.totalPatients}</div>
      <div>Agendamentos Hoje: {stats.todayAppointmentsCount}</div>
      <div>Materiais em Falta: {stats.lowStockCount}</div>
    </div>
  );
}
```

## Validação de Dados

O sistema inclui validação usando Zod:

```typescript
import { useDataValidation } from '@/shared/hooks';

function PatientForm() {
  const { validatePatient, sanitizeForGraphQL } = useDataValidation();

  const handleSubmit = (data) => {
    const validation = validatePatient(data);
    
    if (!validation.success) {
      console.error('Erros de validação:', validation.errors);
      return;
    }

    const sanitizedData = sanitizeForGraphQL(validation.data);
    // Enviar dados sanitizados para GraphQL
  };
}
```

## Tratamento de Erros

```typescript
import { useGraphQLError } from '@/shared/hooks';

function MyComponent() {
  const { showError, isPermissionError } = useGraphQLError();

  const handleError = (error) => {
    if (isPermissionError(error)) {
      showError(error, 'Acesso Negado');
    } else {
      showError(error);
    }
  };
}
```

## Subscriptions em Tempo Real

As subscriptions são configuradas automaticamente nos hooks e fornecem atualizações em tempo real:

```typescript
// Exemplo de subscription para pacientes
subscription PatientsSubscription {
  patients(where: { tenant_id: { _eq: $tenant_id } }) {
    id
    name
    phone
    email
    # ... outros campos
  }
}
```

## Permissões e RLS

O sistema implementa Row Level Security (RLS) para isolamento multi-tenant:

```sql
-- Exemplo de política RLS para pacientes
CREATE POLICY "Users can only access their tenant's patients" ON patients
  FOR ALL USING (tenant_id = current_tenant_id());
```

As permissões são definidas em `src/shared/config/permissions.ts` e verificadas automaticamente pelo Hasura.

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar aplicação
npm run nhost           # Iniciar Nhost local
npm run codegen         # Gerar tipos GraphQL
npm run codegen:watch   # Gerar tipos em modo watch

# Produção
npm run build           # Build da aplicação
```

## Troubleshooting

### Erro de Conexão GraphQL

1. Verifique se o Nhost está rodando: `npm run nhost`
2. Confirme as URLs no `.env.local`
3. Verifique se as migrações foram aplicadas

### Tipos GraphQL Não Encontrados

1. Execute `npm run codegen` para gerar os tipos
2. Verifique se os arquivos `.graphql` estão corretos
3. Confirme se o schema está atualizado

### Erro de Permissão

1. Verifique se o usuário está autenticado
2. Confirme se o tenant_id está sendo passado corretamente
3. Verifique as políticas RLS no banco de dados

### Subscription Não Funciona

1. Confirme se o WebSocket está configurado corretamente
2. Verifique se o token de autenticação está sendo enviado
3. Teste a conexão WebSocket no Apollo DevTools

## Próximos Passos

1. **Implementar cache otimizado** - Configurar políticas de cache mais específicas
2. **Adicionar paginação** - Implementar paginação cursor-based
3. **Otimizar queries** - Adicionar DataLoader para N+1 queries
4. **Implementar offline** - Adicionar suporte offline com Apollo Cache
5. **Monitoramento** - Adicionar métricas e logging de performance