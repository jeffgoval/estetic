# Módulo de Gestão de Estoque

Este módulo implementa um sistema completo de gestão de estoque para clínicas, incluindo controle de materiais, categorias, movimentações e alertas.

## Funcionalidades

### ✅ Implementadas

- **Gestão de Materiais**: CRUD completo de materiais com informações detalhadas
- **Categorização**: Sistema de categorias para organizar materiais
- **Controle de Estoque**: Rastreamento de quantidades mínimas, máximas e atuais
- **Movimentações**: Registro de entradas e saídas com histórico completo
- **Alertas**: Sistema de alertas para estoque baixo e sem estoque
- **Filtros e Busca**: Filtros avançados e busca por nome, marca ou categoria
- **Interface Responsiva**: Design adaptável para desktop e mobile

### 🔄 Em Desenvolvimento

- **Relatórios**: Relatórios de consumo, custos e produtividade
- **Integração GraphQL**: Substituição dos dados simulados por GraphQL
- **Notificações**: Sistema de notificações para alertas críticos

## Estrutura do Módulo

```
src/shared/features/inventory/
├── types/                          # Definições de tipos TypeScript
│   └── index.ts
├── hooks/                          # Hooks customizados
│   ├── useMaterials.ts            # Gestão de materiais e alertas
│   ├── useCategories.ts           # Gestão de categorias
│   └── useMaterialEntries.ts      # Gestão de movimentações
├── components/
│   ├── atoms/                     # Componentes atômicos
│   │   ├── StockBadge/           # Badge de status do estoque
│   │   └── EntryTypeBadge/       # Badge de tipo de movimentação
│   ├── molecules/                 # Componentes moleculares
│   │   ├── MaterialCard/         # Card de material
│   │   └── InventoryFilters/     # Filtros de inventário
│   └── organisms/                 # Componentes complexos
│       ├── MaterialList/         # Lista de materiais
│       ├── MaterialForm/         # Formulário de material
│       ├── CategoryManager/      # Gerenciador de categorias
│       ├── MaterialEntryForm/    # Formulário de movimentação
│       ├── MaterialEntryList/    # Lista de movimentações
│       └── StockAlerts/          # Alertas de estoque
├── InventoryPage.tsx              # Página principal
├── index.ts                       # Exports do módulo
└── README.md                      # Documentação
```

## Uso

### Importação da Página Principal

```tsx
import { InventoryPage } from '@/shared/features/inventory';

// Em uma rota
<Route path="/inventory" component={InventoryPage} />
```

### Uso de Componentes Individuais

```tsx
import { 
  MaterialList, 
  MaterialForm, 
  StockAlerts,
  useMaterials,
  useCategories 
} from '@/shared/features/inventory';

function CustomInventoryPage() {
  const { materials, loading } = useMaterials();
  const { categories } = useCategories();

  return (
    <div>
      <StockAlerts alerts={alerts} />
      <MaterialList 
        materials={materials} 
        categories={categories}
        loading={loading}
      />
    </div>
  );
}
```

## Tipos Principais

### Material
```typescript
interface Material {
  id: string;
  tenantId: string;
  categoryId?: string;
  name: string;
  brand?: string;
  description?: string;
  unitType: string;
  minStockLevel: number;
  maxStockLevel: number;
  currentStock: number;
  unitCost: number;
  supplierName?: string;
  supplierContact?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: MaterialCategory;
}
```

### MaterialEntry
```typescript
interface MaterialEntry {
  id: string;
  tenantId: string;
  materialId: string;
  entryType: 'in' | 'out';
  quantity: number;
  unitCost: number;
  totalCost: number;
  expiryDate?: string;
  batchNumber?: string;
  supplierName?: string;
  invoiceNumber?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  material?: Material;
}
```

## Hooks Disponíveis

### useMaterials(filters?)
Gerencia materiais e alertas de estoque.

```typescript
const { 
  materials, 
  loading, 
  error, 
  createMaterial, 
  updateMaterial, 
  deleteMaterial 
} = useMaterials(filters);
```

### useCategories()
Gerencia categorias de materiais.

```typescript
const { 
  categories, 
  loading, 
  error, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = useCategories();
```

### useMaterialEntries(materialId?)
Gerencia movimentações de estoque.

```typescript
const { 
  entries, 
  loading, 
  error, 
  totals, 
  createEntry, 
  updateEntry, 
  deleteEntry 
} = useMaterialEntries(materialId);
```

## Componentes Principais

### MaterialList
Lista de materiais com filtros, busca e ações.

**Props:**
- `materials`: Array de materiais
- `categories`: Array de categorias
- `loading`: Estado de carregamento
- `onCreateMaterial`: Callback para criar material
- `onEditMaterial`: Callback para editar material
- `onDeleteMaterial`: Callback para excluir material
- `onAddStock`: Callback para adicionar estoque
- `onRemoveStock`: Callback para remover estoque

### MaterialForm
Formulário para criar/editar materiais.

**Props:**
- `material`: Material para edição (opcional)
- `categories`: Array de categorias
- `onSubmit`: Callback de submissão
- `onCancel`: Callback de cancelamento
- `loading`: Estado de carregamento

### StockAlerts
Componente de alertas de estoque.

**Props:**
- `alerts`: Array de alertas
- `onDismiss`: Callback para dispensar alerta
- `loading`: Estado de carregamento

## Integração com Backend

Atualmente o módulo usa dados simulados para desenvolvimento. Para integração com GraphQL:

1. Substitua os dados simulados nos hooks por queries GraphQL
2. Implemente mutations para operações CRUD
3. Configure subscriptions para atualizações em tempo real
4. Adicione tratamento de erros específico do backend

## Requisitos Atendidos

Este módulo atende aos seguintes requisitos da especificação:

- **5.1**: Visualização de materiais com quantidades atuais ✅
- **5.2**: Cadastro de materiais com categorias, estoque mínimo/máximo e custo ✅
- **5.3**: Registro de entradas com aumento de estoque e custo ✅
- **5.4**: Registro de saídas/consumo com diminuição de estoque ✅
- **5.5**: Alertas quando estoque fica abaixo do mínimo ✅
- **5.6**: Relatórios de consumo por período e custos 🔄 (em desenvolvimento)

## Próximos Passos

1. Implementar relatórios e analytics
2. Integrar com GraphQL/Nhost
3. Adicionar notificações push para alertas críticos
4. Implementar importação/exportação de dados
5. Adicionar códigos de barras para materiais
6. Criar dashboard executivo de estoque