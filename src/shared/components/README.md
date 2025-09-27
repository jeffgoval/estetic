# Biblioteca de Componentes UI

Esta biblioteca fornece um conjunto completo de componentes UI seguindo o padrão Atomic Design, otimizada para o sistema de gestão clínica.

## Estrutura

```
components/
├── atoms/          # Componentes básicos (Button, Input, etc.)
├── molecules/      # Combinações de átomos (FormField, SearchBox, etc.)
├── organisms/      # Componentes complexos (DataTable, Modal, etc.)
├── templates/      # Layouts de página (DashboardLayout, SimpleLayout, etc.)
└── examples/       # Exemplos de uso
```

## Componentes Principais

### Átomos (Atoms)

#### Button
```tsx
import { Button } from '@/shared/components';

<Button variant="primary" size="md" loading={false}>
  Clique aqui
</Button>
```

**Variantes:** `primary`, `secondary`, `outline`, `ghost`, `destructive`
**Tamanhos:** `sm`, `md`, `lg`

#### Input
```tsx
import { Input } from '@/shared/components';

<Input
  label="Nome"
  placeholder="Digite seu nome"
  error="Campo obrigatório"
  helperText="Texto de ajuda"
/>
```

#### Card
```tsx
import { Card } from '@/shared/components';

<Card variant="elevated" padding="lg">
  Conteúdo do card
</Card>
```

#### Icon
```tsx
import { Icon } from '@/shared/components';
import { Users } from 'lucide-react';

// Usando ícone direto
<Icon icon={Users} size="md" />

// Usando nome do ícone
<Icon name="Users" size="md" />
```

#### Text
```tsx
import { Text } from '@/shared/components';

<Text variant="h1" color="primary" weight="bold">
  Título Principal
</Text>
```

#### Estados de Loading/Empty/Error
```tsx
import { LoadingState, EmptyState, ErrorState } from '@/shared/components';

<LoadingState message="Carregando..." />

<EmptyState
  title="Nenhum item encontrado"
  description="Adicione o primeiro item"
  action={{ label: 'Adicionar', onClick: handleAdd }}
/>

<ErrorState
  message="Erro ao carregar"
  retry={{ onClick: handleRetry }}
/>
```

### Organismos (Organisms)

#### DataTable
```tsx
import { DataTable } from '@/shared/components';

const columns = [
  { key: 'name', header: 'Nome', sortable: true },
  { key: 'email', header: 'Email' },
  { 
    key: 'status', 
    header: 'Status',
    render: (item) => <Badge>{item.status}</Badge>
  },
];

<DataTable
  data={patients}
  columns={columns}
  loading={loading}
  onRowClick={handleRowClick}
/>
```

#### Modal
```tsx
import { Modal } from '@/shared/components';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Título do Modal"
  size="lg"
>
  Conteúdo do modal
</Modal>
```

#### Form
```tsx
import { Form } from '@/shared/components';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
});

<Form
  schema={schema}
  onSubmit={handleSubmit}
  title="Cadastro de Paciente"
  submitLabel="Salvar"
>
  <FormField name="name" label="Nome" />
  <FormField name="email" label="Email" type="email" />
</Form>
```

#### Sidebar
```tsx
import { Sidebar } from '@/shared/components';

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Home', active: true },
  { id: 'patients', label: 'Pacientes', icon: 'Users', badge: '10' },
];

const user = {
  name: 'Dr. João',
  email: 'joao@clinica.com',
};

<Sidebar
  items={items}
  user={user}
  onUserMenuClick={handleSettings}
  onLogout={handleLogout}
/>
```

#### Header
```tsx
import { Header } from '@/shared/components';

<Header
  title="Gestão de Pacientes"
  breadcrumbs={[
    { label: 'Home' },
    { label: 'Pacientes' },
  ]}
  actions={
    <Button>
      <Icon name="Plus" />
      Novo Paciente
    </Button>
  }
/>
```

### Templates

#### SimpleLayout
```tsx
import { SimpleLayout } from '@/shared/components';

<SimpleLayout
  title="Página de Pacientes"
  breadcrumbs={breadcrumbs}
  actions={<Button>Novo</Button>}
  sidebar={<Sidebar items={items} />}
>
  Conteúdo da página
</SimpleLayout>
```

#### DashboardLayout
```tsx
import { DashboardLayout } from '@/shared/components';

<DashboardLayout
  sidebarItems={sidebarItems}
  user={user}
  title="Dashboard"
  onLogout={handleLogout}
>
  Conteúdo do dashboard
</DashboardLayout>
```

## Sistema de Temas

### ThemeProvider
```tsx
import { ThemeProvider } from '@/shared/contexts';

<ThemeProvider>
  <App />
</ThemeProvider>
```

### Hook de Tema Personalizado
```tsx
import { useCustomTheme } from '@/shared/hooks';

const { applyTenantTheme } = useCustomTheme();

// Aplicar tema do tenant
applyTenantTheme({
  primaryColor: 'hsl(200 100% 50%)',
  secondaryColor: 'hsl(200 50% 80%)',
});
```

## Cores do Sistema

O sistema usa uma paleta terrosa e acolhedora:

- **Primary:** `hsl(30 25% 59%)` - Tom terroso principal
- **Secondary:** `hsl(30 20% 85%)` - Tom neutro claro
- **Success:** `hsl(142 71% 45%)` - Verde para sucesso
- **Error:** `hsl(0 84% 60%)` - Vermelho para erros
- **Warning:** `hsl(38 92% 50%)` - Amarelo para avisos

## Responsividade

Todos os componentes são responsivos por padrão, usando classes do Tailwind CSS:

- **Mobile:** Base (sem prefixo)
- **Tablet:** `md:` (768px+)
- **Desktop:** `lg:` (1024px+)
- **Large Desktop:** `xl:` (1280px+)

## Acessibilidade

Os componentes seguem as diretrizes WCAG 2.1:

- Suporte a navegação por teclado
- Atributos ARIA apropriados
- Contraste adequado de cores
- Textos alternativos para ícones
- Estados de foco visíveis

## Exemplos Completos

Veja o arquivo `examples/ComponentShowcase.tsx` para exemplos completos de uso de todos os componentes.

## Customização

### Cores Personalizadas
```tsx
// No tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: 'hsl(var(--color-primary))',
      // ...
    }
  }
}
```

### Componentes Personalizados
```tsx
// Estendendo um componente existente
const CustomButton = styled(Button)`
  // Estilos personalizados
`;
```

## Boas Práticas

1. **Composição:** Use composição ao invés de herança
2. **Props:** Mantenha as props simples e tipadas
3. **Acessibilidade:** Sempre inclua labels e atributos ARIA
4. **Performance:** Use React.memo para componentes pesados
5. **Testes:** Teste comportamentos, não implementação
6. **Documentação:** Documente props e exemplos de uso

## Contribuição

1. Siga o padrão Atomic Design
2. Use TypeScript para tipagem
3. Inclua testes para novos componentes
4. Documente props e exemplos
5. Mantenha consistência visual