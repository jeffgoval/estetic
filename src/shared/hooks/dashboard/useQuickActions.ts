import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../usePermissions';
import { PERMISSIONS } from '../../permissions';
import type { QuickAction } from '../../features/dashboard/types';

export const useQuickActions = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const allActions = useMemo((): QuickAction[] => [
    {
      id: 'new-appointment',
      title: 'Nova Consulta',
      description: 'Agendar consulta',
      icon: 'Calendar',
      color: 'primary',
      path: '/agenda',
      permissions: [PERMISSIONS.APPOINTMENT_CREATE],
    },
    {
      id: 'new-patient',
      title: 'Novo Paciente',
      description: 'Cadastrar paciente',
      icon: 'Users',
      color: 'secondary',
      path: '/pacientes',
      permissions: [PERMISSIONS.PATIENT_CREATE],
    },
    {
      id: 'waiting-list',
      title: 'Lista de Espera',
      description: 'Gerenciar espera',
      icon: 'Clock',
      color: 'warning',
      path: '/lista-espera',
      permissions: [PERMISSIONS.WAITING_LIST_VIEW],
    },
    {
      id: 'inventory',
      title: 'Estoque',
      description: 'Controlar materiais',
      icon: 'Package',
      color: 'primary',
      path: '/estoque',
      permissions: [PERMISSIONS.INVENTORY_VIEW],
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Ver relatórios',
      icon: 'BarChart3',
      color: 'secondary',
      path: '/relatorios',
      permissions: [PERMISSIONS.REPORTS_VIEW],
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Mensagens',
      icon: 'MessageSquare',
      color: 'success',
      path: '/whatsapp',
      permissions: [PERMISSIONS.WHATSAPP_VIEW],
    },
    {
      id: 'ai-agent',
      title: 'Agente IA',
      description: 'Leads e conversões',
      icon: 'Bot',
      color: 'primary',
      path: '/agente-ia',
      permissions: [PERMISSIONS.AI_AGENT_VIEW],
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Ajustar sistema',
      icon: 'Settings',
      color: 'neutral',
      path: '/configuracoes',
      permissions: [PERMISSIONS.SETTINGS_VIEW],
    },
  ], []);

  // Filtrar ações baseado nas permissões do usuário
  const availableActions = useMemo(() => 
    allActions.filter(action => 
      action.permissions.some(permission => hasPermission(permission))
    ),
    [allActions, hasPermission]
  );

  const handleActionClick = (action: QuickAction) => {
    navigate(action.path);
  };

  return {
    actions: availableActions,
    handleActionClick,
  };
};