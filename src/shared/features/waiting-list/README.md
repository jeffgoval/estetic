# Módulo de Lista de Espera

Este módulo gerencia a lista de espera de pacientes, permitindo:

## Funcionalidades

- **Gestão de Lista de Espera**: Adicionar, editar e remover pacientes da lista de espera
- **Gerenciamento de Prioridades**: Definir níveis de prioridade para pacientes
- **Sugestões de Horários**: Sugerir horários disponíveis baseados nas preferências
- **Agendamento Automático**: Converter entradas da lista de espera em agendamentos

## Componentes

### Organismos
- `WaitingListTable`: Tabela principal com lista de espera
- `WaitingListForm`: Formulário para adicionar/editar entrada na lista
- `AvailableSlotsSuggestions`: Sugestões de horários disponíveis
- `PriorityManager`: Gerenciamento de prioridades

### Moléculas
- `WaitingListFilters`: Filtros para a lista de espera
- `WaitingListCard`: Card individual de entrada na lista
- `PriorityBadge`: Badge indicador de prioridade

## Hooks

- `useWaitingList`: Hook principal para gerenciar lista de espera
- `useAvailableSlots`: Hook para buscar horários disponíveis
- `useWaitingListActions`: Hook para ações da lista de espera

## Requisitos Atendidos

- 6.1: Adicionar pacientes à lista de espera quando não há horário desejado
- 6.2: Definir preferências de data/hora e prioridade
- 6.3: Sugerir pacientes da lista de espera para vagas disponíveis
- 6.4: Remover automaticamente da lista ao confirmar agendamento