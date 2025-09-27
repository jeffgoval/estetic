import React from 'react';
import { Card } from '../../atoms/Card';
import { Text } from '../../atoms/Text';
import { Spinner } from '../../atoms/Spinner';
import { cn } from '../../../utils/cn';
import { useDashboardCharts } from '../../../hooks/dashboard/useDashboardCharts';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface DashboardChartsProps {
  className?: string;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  className,
}) => {
  const { chartData, loading, error } = useDashboardCharts();

  const COLORS = {
    primary: '#3B82F6',
    secondary: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    neutral: '#6B7280',
  };

  const statusColors = {
    scheduled: COLORS.primary,
    confirmed: COLORS.secondary,
    completed: COLORS.neutral,
    cancelled: COLORS.error,
  };

  if (loading) {
    return (
      <Card className={cn('p-6 flex items-center justify-center', className)}>
        <div className="flex items-center space-x-2">
          <Spinner size="sm" />
          <Text color="muted">Carregando gráficos...</Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <Text color="error" className="mb-2">
            Erro ao carregar gráficos
          </Text>
          <Text variant="small" color="muted">
            {error}
          </Text>
        </div>
      </Card>
    );
  }

  if (!chartData) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <Text color="muted">
            Nenhum dado disponível para gráficos
          </Text>
        </div>
      </Card>
    );
  }

  // Preparar dados para os gráficos
  const appointmentStatusData = Object.entries(chartData.appointmentsByStatus).map(([status, count]) => ({
    name: status === 'scheduled' ? 'Agendado' : 
          status === 'confirmed' ? 'Confirmado' :
          status === 'completed' ? 'Concluído' : 'Cancelado',
    value: count,
    color: statusColors[status as keyof typeof statusColors],
  }));

  const professionalData = chartData.appointmentsByProfessional.map(item => ({
    name: item.professionalName,
    consultas: item.count,
  }));

  return (
    <div className={cn('space-y-6', className)}>
      <div className="mb-6">
        <Text variant="h3" weight="semibold" className="mb-2">
          Análises e Gráficos
        </Text>
        <Text variant="body" color="muted">
          Visualização dos dados da clínica
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Status dos Agendamentos */}
        <Card className="p-6">
          <Text variant="h4" weight="semibold" className="mb-4">
            Status dos Agendamentos
          </Text>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfico de Consultas por Profissional */}
        <Card className="p-6">
          <Text variant="h4" weight="semibold" className="mb-4">
            Consultas por Profissional
          </Text>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={professionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="consultas" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfico de Crescimento de Pacientes */}
        {chartData.patientsGrowth.length > 0 && (
          <Card className="p-6">
            <Text variant="h4" weight="semibold" className="mb-4">
              Crescimento de Pacientes
            </Text>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.patientsGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke={COLORS.secondary} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Gráfico de Receita por Mês */}
        {chartData.revenueByMonth.length > 0 && (
          <Card className="p-6">
            <Text variant="h4" weight="semibold" className="mb-4">
              Receita por Mês
            </Text>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                  />
                  <Bar dataKey="revenue" fill={COLORS.warning} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};