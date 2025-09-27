# Estrutura de Componentes Compartilhados

Esta pasta contém todos os componentes, hooks, stores e utilitários compartilhados do sistema de gestão clínica.

## 📁 Estrutura de Pastas

```
src/shared/
├── components/          # Componentes UI organizados por atomic design
│   ├── atoms/          # Componentes básicos (Button, Input, etc.)
│   ├── molecules/      # Combinações de atoms (FormField, SearchBox, etc.)
│   ├── organisms/      # Componentes complexos (DataTable, Calendar, etc.)
│   └── templates/      # Layouts de página (DashboardLayout, etc.)
├── stores/             # Stores Zustand para gerenciamento de estado
├── hooks/              # Hooks customizados reutilizáveis
├── utils/              # Utilitários e helpers
├── config/             # Configurações e constantes
└── examples/           # Exemplos de uso dos componentes
```

## 🧩 Componentes (Atomic Design)

### Atoms (Componentes Básicos)
- **Button**: Botões com variantes (default, secondary, ghost, etc.)
- **Input**: Campos de entrada com validação
- **Card**: Container básico com variantes
- **Text**: Componente de texto tipográfico
- **Badge**: Indicadores de status
- **Avatar**: Imagens de perfil
- **Icon**: Ícones do Lucide React
- **Spinner**: Indicadores de carregamento

### Molecules (Combinações)
- **DatePicker**: Seletor de data
- **Dropdown**: Menu suspenso
- **FormField**: Campo de formulário completo
- **Pagination**: Navegação de páginas
- **SearchBox**: Caixa de busca
- **StatusIndicator**: Indicador de status com ícone

### Organisms (Componentes Complexos)
- **Calendar**: Calendário interativo com eventos
- **DataTable**: Tabela de dados com paginação e filtros
- **Form**: Formulário com validação Zod
- **Modal**: Modal reutilizável

### Templates (Layouts)
- **DashboardLayout**: Layout principal do dashboard

## 🏪 Stores (Zustand)

### Stores Principais
- **useAppStore**: Estado global da aplicação (usuário, tenant)
- **usePatientsStore**: Gerenciamento de pacientes
- **useAppointmentsStore**: Gerenciamento de agendamentos
- **useProfessionalsStore**: Gerenciamento de profissionais
- **useMaterialsStore**: Gerenciamento de estoque
- **useUIStore**: Estado da interface (toasts, modais, tema)

### Características dos Stores
- ✅ TypeScript completo
- ✅ DevTools integrado
- ✅ Persistência (quando necessário)
- ✅ Filtros e busca
- ✅ Paginação
- ✅ Estados de carregamento

## 🎣 Hooks Customizados

- **useApi**: Hook para chamadas de API com loading e error handling
- **useDebounce**: Debounce de valores
- **useLocalStorage**: Persistência no localStorage
- **usePagination**: Lógica de paginação

## 🛠 Utilitários

### Formatters
- Formatação de moeda, data, telefone, CPF
- Formatação de texto e arquivos
- Tempo relativo

### Validators (Zod)
- Validadores para email, telefone, CPF, etc.
- Schemas para entidades (paciente, profissional, etc.)
- Validação de formulários

### Configurações
- Constantes da aplicação
- Configurações de API, paginação, upload
- Feature flags

## 📖 Como Usar

### Importando Componentes
```tsx
import { Button, Card, Text } from '@/shared/components';

// Ou importação específica
import { Button } from '@/shared/components/atoms/Button';
```

### Usando Stores
```tsx
import { usePatientsStore } from '@/shared/stores';

const MyComponent = () => {
  const { patients, loading, addPatient } = usePatientsStore();
  
  // Usar o store...
};
```

### Usando Hooks
```tsx
import { useApi, useDebounce } from '@/shared/hooks';

const MyComponent = () => {
  const api = useApi();
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Usar os hooks...
};
```

### Usando Utilitários
```tsx
import { formatters, validators } from '@/shared/utils';

// Formatação
const formattedPrice = formatters.currency(150.50);
const formattedDate = formatters.date(new Date());

// Validação
const patientSchema = validators.schemas.patient;
```

## 🎨 Design System

### Cores (TailwindCSS)
- **Primary**: Tom terroso principal (`hsl(30 25% 59%)`)
- **Secondary**: Tom neutro claro (`hsl(30 20% 85%)`)
- **Success**: Verde (`hsl(142 71% 45%)`)
- **Error**: Vermelho (`hsl(0 84% 60%)`)
- **Warning**: Amarelo (`hsl(38 92% 50%)`)

### Tipografia
- **Fontes**: Inter, Roboto, Montserrat
- **Variantes**: h1, h2, h3, h4, body, caption, small
- **Pesos**: normal, medium, semibold, bold

### Espaçamento
- Seguindo escala do TailwindCSS
- Padding padrão dos cards: `p-4` (16px)
- Espaçamento entre elementos: `space-y-4` (16px)

## 🔧 Configuração

### Variáveis de Ambiente
```env
VITE_API_URL=http://localhost:1337
VITE_GRAPHQL_URL=http://localhost:1337/v1/graphql
VITE_STORAGE_URL=http://localhost:1337/v1/storage
```

### Configurações Principais
- Paginação padrão: 10 itens por página
- Duração de toast: 5 segundos
- Tamanho máximo de upload: 5MB
- Horário de trabalho padrão: 08:00 - 18:00

## 📝 Exemplos

Veja o arquivo `examples/ComponentUsage.tsx` para exemplos completos de uso de todos os componentes, stores e utilitários.

## 🚀 Próximos Passos

1. Implementar testes unitários para componentes
2. Adicionar Storybook para documentação visual
3. Implementar mais variantes de componentes
4. Adicionar animações com Framer Motion
5. Implementar sistema de temas mais robusto