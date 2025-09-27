# Sistema de Agendamentos

Este módulo implementa um sistema completo de agendamentos para clínicas de estética, incluindo calendário visual, validação de horários, drag-and-drop para reagendamento e gerenciamento de status.

## Funcionalidades Implementadas

### ✅ Componentes Principais

- **AppointmentForm**: Formulário para criar/editar agendamentos com validação de horários
- **AppointmentCard**: Card para exibir detalhes de um agendamento
- **AppointmentList**: Lista de agendamentos com filtros e busca
- **Calendar**: Calendário visual com suporte a drag-and-drop (atualizado)
- **AppointmentsPage**: Página principal com visualização em calendário e lista

### ✅ Hooks Customizados

- **useAppointments**: Hook para buscar agendamentos com filtros
- **useAppointmentActions**: Hook para ações CRUD (criar, editar, excluir, reagendar)
- **useAppointmentForm**: Hook para gerenciar formulário de agendamentos
- **useTimeSlotValidation**: Hook para validar horários e conflitos

### ✅ Funcionalidades de Validação

- Validação de conflitos de horário
- Verificação de horário de funcionamento dos profissionais
- Validação de intervalos/pausas
- Prevenção de agendamentos no passado
- Sugestão de horários disponíveis

### ✅ Funcionalidades de Interface

- Visualização em calendário e lista
- Drag-and-drop para reagendamento
- Filtros por status, profissional, paciente
- Busca por texto
- Agrupamento por data
- Status coloridos para diferentes estados

## Estrutura de Arquivos

```
src/shared/features/appointments/
├── AppointmentsPage.tsx          # Página principal
├── index.ts                      # Exports
└── README.md                     # Esta documentação

src/shared/hooks/appointments/
├── useAppointments.ts            # Hook para buscar agendamentos
├── useAppointmentActions.ts      # Hook para ações CRUD
├── useAppointmentForm.ts         # Hook para formulário
├── useTimeSlotValidation.ts      # Hook para validação de horários
└── index.ts                      # Exports

src/shared/components/organisms/
├── AppointmentForm/              # Formulário de agendamentos
├── AppointmentCard/              # Card de agendamento
├── AppointmentList/              # Lista de agendamentos
└── Calendar/                     # Calendário (atualizado)
```

## Como Usar

### 1. Página de Agendamentos

```tsx
import { AppointmentsPage } from '../features/appointments';

// Usar diretamente a página completa
<AppointmentsPage />
```

### 2. Componentes Individuais

```tsx
import { 
  AppointmentForm, 
  AppointmentList, 
  Calendar 
} from '../components/organisms';

// Formulário de agendamento
<AppointmentForm
  onSuccess={() => console.log('Agendamento criado')}
  onCancel={() => console.log('Cancelado')}
/>

// Lista de agendamentos
<AppointmentList
  appointments={appointments}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onStatusChange={handleStatusChange}
/>

// Calendário
<Calendar
  events={calendarEvents}
  onEventDrop={handleReschedule}
  onEventClick={handleEventClick}
  onDateClick={handleDateClick}
/>
```

### 3. Hooks

```tsx
import { 
  useAppointments, 
  useAppointmentActions,
  useTimeSlotValidation 
} from '../hooks/appointments';

function MyComponent() {
  // Buscar agendamentos
  const { appointments, loading } = useAppointments({
    professionalId: 'prof-1',
    status: 'scheduled'
  });

  // Ações CRUD
  const { createAppointment, updateAppointment } = useAppointmentActions();

  // Validação de horários
  const { validateTimeSlot, getAvailableTimeSlots } = useTimeSlotValidation();

  // Usar os hooks...
}
```

## Status de Agendamentos

O sistema suporta os seguintes status:

- **scheduled**: Agendado (azul)
- **confirmed**: Confirmado (verde)
- **in_progress**: Em Andamento (amarelo)
- **completed**: Concluído (verde escuro)
- **cancelled**: Cancelado (vermelho)
- **no_show**: Faltou (cinza)

## Validações Implementadas

### Validação de Horários

- ✅ Horário de início deve ser anterior ao de fim
- ✅ Não permite agendamentos no passado
- ✅ Verifica horário de funcionamento do profissional
- ✅ Valida intervalos/pausas do profissional
- ✅ Detecta conflitos com outros agendamentos

### Validação de Formulário

- ✅ Campos obrigatórios (paciente, profissional, título, datas)
- ✅ Validação de formato de data/hora
- ✅ Validação em tempo real de conflitos

## Funcionalidades de UX

### Calendário

- ✅ Visualização mensal, semanal e diária
- ✅ Navegação entre datas
- ✅ Drag-and-drop para reagendamento
- ✅ Cores por status
- ✅ Tooltip com informações
- ✅ Clique em data para criar agendamento

### Lista

- ✅ Agrupamento por data
- ✅ Filtros por status
- ✅ Busca por texto
- ✅ Ordenação múltipla
- ✅ Ações rápidas (confirmar, completar, cancelar)

### Formulário

- ✅ Sugestão de horários disponíveis
- ✅ Cálculo automático de horário de fim
- ✅ Validação em tempo real
- ✅ Seleção de pacientes e profissionais
- ✅ Tipos de serviço pré-definidos

## Integração com GraphQL

O sistema está preparado para integração com Nhost/Hasura GraphQL:

```graphql
# Buscar agendamentos
query GetAppointments {
  appointments(order_by: {start_datetime: asc}) {
    id
    title
    start_datetime
    end_datetime
    status
    patient { name phone }
    professional { name specialty }
  }
}

# Criar agendamento
mutation CreateAppointment($data: appointments_insert_input!) {
  insert_appointments_one(object: $data) {
    id
    title
    start_datetime
    end_datetime
  }
}
```

## Próximos Passos

Para completar a implementação:

1. **Configurar GraphQL Schema**: Definir tabelas e relacionamentos no Hasura
2. **Implementar Notificações**: WhatsApp/Email para lembretes
3. **Relatórios**: Análise de agendamentos e produtividade
4. **Integração com Estoque**: Consumo de materiais por procedimento
5. **Recorrência**: Agendamentos recorrentes
6. **Sala de Espera**: Integração com sistema de chamadas

## Testes

O sistema inclui testes unitários para os componentes principais:

```bash
# Executar testes
npm test AppointmentForm
```

## Dependências

- React Query para cache e sincronização
- React Hook Form para formulários
- Zod para validação de schemas
- Zustand para gerenciamento de estado
- Nhost para backend GraphQL