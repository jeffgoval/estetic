# Dashboard Module

Este módulo implementa o sistema de dashboard da clínica, fornecendo uma visão geral das métricas importantes, atividades recentes e ações rápidas.

## Funcionalidades

- **Métricas em tempo real**: Consultas do dia, total de pacientes, lista de espera, itens em falta
- **Gráficos e visualizações**: Componentes de gráficos para análise de dados
- **Atividade recente**: Lista das últimas ações realizadas na clínica
- **Ações rápidas**: Acesso rápido às funcionalidades mais utilizadas

## Componentes

### Atoms
- `MetricCard`: Card para exibir métricas individuais
- `QuickActionButton`: Botão para ações rápidas

### Molecules
- `MetricsGrid`: Grid de cards de métricas
- `QuickActionsGrid`: Grid de ações rápidas

### Organisms
- `DashboardStats`: Componente principal de estatísticas
- `RecentActivity`: Lista de atividades recentes
- `DashboardCharts`: Componente de gráficos

### Templates
- `DashboardLayout`: Layout principal do dashboard

## Hooks

- `useDashboardData`: Hook para buscar dados do dashboard
- `useDashboardStats`: Hook para métricas em tempo real
- `useRecentActivity`: Hook para atividades recentes

## Store

- `useDashboardStore`: Store Zustand para gerenciar estado do dashboard

## Tipos

- `DashboardStats`: Interface para estatísticas do dashboard
- `RecentActivity`: Interface para atividades recentes
- `QuickAction`: Interface para ações rápidas