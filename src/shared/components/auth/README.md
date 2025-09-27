# Sistema de Autenticação

Este módulo implementa um sistema completo de autenticação usando Nhost com suporte a multi-tenancy.

## Funcionalidades

- ✅ Autenticação com email/senha
- ✅ Cadastro de novos usuários
- ✅ Recuperação de senha
- ✅ Sistema de permissões baseado em roles
- ✅ Multi-tenancy com isolamento de dados
- ✅ Proteção de rotas
- ✅ Detecção e troca de tenant
- ✅ Criação automática de tenant no primeiro cadastro

## Componentes

### AuthProvider
Provider que envolve a aplicação com o contexto do Nhost.

```tsx
import { AuthProvider } from '../providers/AuthProvider';

function App() {
  return (
    <AuthProvider>
      {/* Sua aplicação */}
    </AuthProvider>
  );
}
```

### ProtectedRoute
Componente para proteger rotas que requerem autenticação e/ou permissões específicas.

```tsx
import { ProtectedRoute } from '../components/auth';

// Rota que requer apenas autenticação
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Rota que requer permissões específicas
<ProtectedRoute 
  requiredPermissions={['manage_users']}
  allowedRoles={['owner', 'admin']}
>
  <UsersPage />
</ProtectedRoute>
```

### LoginPage
Página de login e cadastro com email/senha.

```tsx
import { LoginPage } from '../components/auth';

<Route path="/login" element={<LoginPage />} />
```

### ForgotPasswordPage
Página para recuperação de senha.

```tsx
import { ForgotPasswordPage } from '../components/auth';

<Route path="/forgot-password" element={<ForgotPasswordPage />} />
```

### TenantSwitcher
Componente para trocar entre tenants (quando o usuário tem acesso a múltiplos).

```tsx
import { TenantSwitcher } from '../components/auth';

<TenantSwitcher />
```

## Hooks

### useAuth
Hook principal para gerenciar autenticação.

```tsx
import { useAuth } from '../hooks/auth';

function MyComponent() {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    signOut, 
    signIn,
    signUp,
    refreshUserData 
  } = useAuth();

  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <div>Não autenticado</div>;

  return (
    <div>
      <p>Olá, {user.displayName}!</p>
      <button onClick={signOut}>Sair</button>
    </div>
  );
}
```

### usePermissions
Hook para verificar permissões do usuário.

```tsx
import { usePermissions } from '../hooks/auth';

function MyComponent() {
  const { 
    hasPermission,
    canManageUsers,
    canViewReports,
    isOwner 
  } = usePermissions();

  return (
    <div>
      {canManageUsers && <button>Gerenciar Usuários</button>}
      {canViewReports && <button>Ver Relatórios</button>}
      {hasPermission('manage_inventory') && <button>Estoque</button>}
    </div>
  );
}
```

### useTenant
Hook para gerenciar tenants.

```tsx
import { useTenant } from '../hooks/auth';

function MyComponent() {
  const { 
    currentTenant, 
    availableTenants, 
    switchTenant 
  } = useTenant();

  return (
    <div>
      <p>Clínica atual: {currentTenant?.name}</p>
      {availableTenants.length > 1 && (
        <select onChange={(e) => switchTenant(e.target.value)}>
          {availableTenants.map(tenant => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
```

## Roles e Permissões

### Roles Disponíveis
- `super_admin`: Acesso total ao sistema (gerenciar todos os tenants)
- `owner`: Proprietário da clínica (acesso total ao tenant)
- `admin`: Administrador da clínica (acesso limitado)
- `professional`: Profissional da clínica (acesso a pacientes e agendamentos)
- `receptionist`: Recepcionista (acesso básico)

### Permissões por Role

| Permissão | super_admin | owner | admin | professional | receptionist |
|-----------|-------------|-------|-------|--------------|--------------|
| manage_users | ✅ | ✅ | ❌ | ❌ | ❌ |
| manage_patients | ✅ | ✅ | ✅ | ✅ | ✅ |
| manage_appointments | ✅ | ✅ | ✅ | ✅ | ✅ |
| manage_professionals | ✅ | ✅ | ✅ | ❌ | ❌ |
| manage_inventory | ✅ | ✅ | ✅ | ❌ | ❌ |
| view_reports | ✅ | ✅ | ✅ | ✅ | ❌ |
| manage_settings | ✅ | ✅ | ✅ | ❌ | ❌ |
| manage_billing | ✅ | ✅ | ❌ | ❌ | ❌ |
| super_admin | ✅ | ❌ | ❌ | ❌ | ❌ |

## Configuração

### Variáveis de Ambiente
Crie um arquivo `.env.local` com as seguintes variáveis:

```env
VITE_NHOST_SUBDOMAIN=your-nhost-subdomain
VITE_NHOST_REGION=your-nhost-region
```

Para desenvolvimento local:
```env
VITE_NHOST_SUBDOMAIN=localhost
VITE_NHOST_REGION=local
```

### Configuração de Email
No arquivo `nhost/nhost.toml`, configure as opções de autenticação:

```toml
[auth.settings]
allowed_roles = "user,professional,admin,owner,super_admin"
default_allowed_roles = "user"
default_role = "user"
disable_new_users = false
```

## Fluxo de Autenticação

1. **Login/Cadastro**: Usuário preenche email e senha
2. **Autenticação**: Sistema valida credenciais no Nhost
3. **Verificação**: Sistema verifica se usuário existe no banco
4. **Criação**: Se não existe, cria usuário e tenant automaticamente
5. **Sessão**: Estabelece sessão autenticada com dados do usuário e tenant

## Multi-Tenancy

O sistema implementa multi-tenancy onde:
- Cada clínica é um tenant isolado
- Usuários pertencem a um tenant específico
- Dados são isolados por tenant usando Row Level Security (RLS)
- No primeiro login, um tenant é criado automaticamente para o usuário
- Usuários podem ter acesso a múltiplos tenants (funcionalidade futura)

## Segurança

- **Row Level Security (RLS)**: Isolamento de dados no nível do banco
- **JWT Tokens**: Autenticação baseada em tokens seguros
- **Permissões Granulares**: Controle fino de acesso por funcionalidade
- **Validação de Sessão**: Verificação contínua de autenticação
- **Logout Seguro**: Limpeza completa de sessão e tokens