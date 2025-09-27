import React from 'react';
import { Text } from '../../components/atoms/Text';
import { DashboardStats } from '../../components/organisms/DashboardStats';
import { RecentActivity } from '../../components/organisms/RecentActivity';
import { QuickActions } from '../../components/organisms/QuickActions';
import { DashboardCharts } from '../../components/organisms/DashboardCharts';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

interface DashboardPageProps {
  className?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  className,
}) => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuário';
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header de Boas-vindas */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h2" weight="bold" className="text-white mb-2">
              {getGreeting()}, {getUserName()}!
            </Text>
            <Text variant="body" className="text-white/80">
              Aqui está um resumo da sua clínica hoje
            </Text>
          </div>
          <div className="hidden md:block text-right">
            <Text variant="small" className="text-white/70">
              Hoje
            </Text>
            <Text variant="h4" weight="semibold" className="text-white">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </Text>
          </div>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <DashboardStats />

      {/* Grid com Atividade Recente e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivity />
        <QuickActions />
      </div>

      {/* Gráficos e Análises */}
      <DashboardCharts />
    </div>
  );
};