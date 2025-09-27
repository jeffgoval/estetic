import React from 'react';
import { Card } from '../../atoms/Card';
import { Text } from '../../atoms/Text';
import { Icon } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import { StatusIndicator } from '../../molecules/StatusIndicator';
import { Appointment } from '../../../stores/useAppointmentsStore';
import { cn } from '../../../utils/cn';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  onStatusChange?: (appointment: Appointment, status: Appointment['status']) => void;
  onReschedule?: (appointment: Appointment) => void;
  className?: string;
  compact?: boolean;
}

const statusConfig = {
  scheduled: { label: 'Agendado', color: 'blue' as const, icon: 'Calendar' as const },
  confirmed: { label: 'Confirmado', color: 'green' as const, icon: 'CheckCircle' as const },
  in_progress: { label: 'Em Andamento', color: 'yellow' as const, icon: 'Clock' as const },
  completed: { label: 'Concluído', color: 'green' as const, icon: 'Check' as const },
  cancelled: { label: 'Cancelado', color: 'red' as const, icon: 'X' as const },
  no_show: { label: 'Faltou', color: 'gray' as const, icon: 'AlertCircle' as const },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
  onReschedule,
  className,
  compact = false,
}) => {
  const startDate = new Date(appointment.startDatetime);
  const endDate = new Date(appointment.endDatetime);
  const status = statusConfig[appointment.status];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDuration = () => {
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
    return `${minutes}min`;
  };

  const isToday = () => {
    const today = new Date();
    return startDate.toDateString() === today.toDateString();
  };

  const isPast = () => {
    return endDate < new Date();
  };

  const canReschedule = () => {
    return !isPast() && appointment.status !== 'completed' && appointment.status !== 'cancelled';
  };

  const canChangeStatus = () => {
    return !isPast() || appointment.status === 'scheduled' || appointment.status === 'confirmed';
  };

  if (compact) {
    return (
      <div
        className={cn(
          'p-3 border-l-4 bg-white hover:bg-neutral-50 cursor-pointer transition-colors',
          status.color === 'blue' && 'border-l-blue-500',
          status.color === 'green' && 'border-l-green-500',
          status.color === 'yellow' && 'border-l-yellow-500',
          status.color === 'red' && 'border-l-red-500',
          status.color === 'gray' && 'border-l-gray-500',
          className
        )}
        onClick={() => onEdit?.(appointment)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <Text variant="small" weight="medium" className="truncate">
              {appointment.title}
            </Text>
            <Text variant="small" color="muted" className="truncate">
              {appointment.patient?.name} • {formatTime(startDate)} - {formatTime(endDate)}
            </Text>
          </div>
          <Badge variant={status.color} size="sm">
            {status.label}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('p-4 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Text variant="body" weight="semibold" className="truncate">
              {appointment.title}
            </Text>
            {isToday() && (
              <Badge variant="blue" size="sm">
                Hoje
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-neutral-600">
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={14} />
              <span>{formatDate(startDate)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={14} />
              <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Timer" size={14} />
              <span>{getDuration()}</span>
            </div>
          </div>
        </div>

        <StatusIndicator
          status={appointment.status}
          variant={status.color}
          icon={status.icon}
          label={status.label}
        />
      </div>

      {/* Informações do Paciente e Profissional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="User" size={16} className="text-neutral-400" />
          <div>
            <Text variant="small" weight="medium">
              {appointment.patient?.name}
            </Text>
            {appointment.patient?.phone && (
              <Text variant="small" color="muted">
                {appointment.patient.phone}
              </Text>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Icon name="UserCheck" size={16} className="text-neutral-400" />
          <div>
            <Text variant="small" weight="medium">
              {appointment.professional?.name}
            </Text>
            {appointment.professional?.specialty && (
              <Text variant="small" color="muted">
                {appointment.professional.specialty}
              </Text>
            )}
          </div>
        </div>
      </div>

      {/* Tipo de Serviço */}
      {appointment.serviceType && (
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Briefcase" size={16} className="text-neutral-400" />
          <Text variant="small" color="muted">
            {appointment.serviceType}
          </Text>
        </div>
      )}

      {/* Descrição */}
      {appointment.description && (
        <div className="mb-3">
          <Text variant="small" color="muted">
            {appointment.description}
          </Text>
        </div>
      )}

      {/* Observações */}
      {appointment.notes && (
        <div className="mb-3 p-2 bg-neutral-50 rounded">
          <Text variant="small" color="muted">
            <strong>Obs:</strong> {appointment.notes}
          </Text>
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="flex items-center space-x-2">
          {canChangeStatus() && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange?.(appointment, 'confirmed')}
                disabled={appointment.status === 'confirmed'}
              >
                <Icon name="CheckCircle" size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange?.(appointment, 'completed')}
                disabled={appointment.status === 'completed'}
              >
                <Icon name="Check" size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange?.(appointment, 'cancelled')}
                disabled={appointment.status === 'cancelled'}
              >
                <Icon name="X" size={14} />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {canReschedule() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReschedule?.(appointment)}
            >
              <Icon name="Calendar" size={14} />
              Reagendar
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(appointment)}
          >
            <Icon name="Edit" size={14} />
            Editar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(appointment)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};