import React, { useState } from 'react';
import { Card } from '../../atoms/Card';
import { Text } from '../../atoms/Text';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { SearchBox } from '../../molecules/SearchBox';
import { Dropdown } from '../../molecules/Dropdown';
import { AppointmentCard } from '../AppointmentCard';
import { EmptyState } from '../../atoms/EmptyState';
import { LoadingState } from '../../atoms/LoadingState';
import { ErrorState } from '../../atoms/ErrorState';
import { Appointment } from '../../../stores/useAppointmentsStore';
import { cn } from '../../../utils/cn';

interface AppointmentListProps {
  appointments: Appointment[];
  loading?: boolean;
  error?: string;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  onStatusChange?: (appointment: Appointment, status: Appointment['status']) => void;
  onReschedule?: (appointment: Appointment) => void;
  onCreateNew?: () => void;
  className?: string;
}

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'no_show', label: 'Faltou' },
];

const sortOptions = [
  { value: 'date_asc', label: 'Data (mais próximo)' },
  { value: 'date_desc', label: 'Data (mais distante)' },
  { value: 'patient_name', label: 'Nome do paciente' },
  { value: 'professional_name', label: 'Nome do profissional' },
  { value: 'status', label: 'Status' },
];

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  loading = false,
  error,
  onEdit,
  onDelete,
  onStatusChange,
  onReschedule,
  onCreateNew,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');

  // Filtrar e ordenar agendamentos
  const filteredAndSortedAppointments = React.useMemo(() => {
    let filtered = appointments;

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.title.toLowerCase().includes(term) ||
        appointment.patient?.name.toLowerCase().includes(term) ||
        appointment.professional?.name.toLowerCase().includes(term) ||
        appointment.serviceType?.toLowerCase().includes(term)
      );
    }

    // Filtro por status
    if (statusFilter) {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime();
        case 'date_desc':
          return new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime();
        case 'patient_name':
          return (a.patient?.name || '').localeCompare(b.patient?.name || '');
        case 'professional_name':
          return (a.professional?.name || '').localeCompare(b.professional?.name || '');
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [appointments, searchTerm, statusFilter, sortBy]);

  // Agrupar por data
  const groupedAppointments = React.useMemo(() => {
    const groups: { [key: string]: Appointment[] } = {};
    
    filteredAndSortedAppointments.forEach(appointment => {
      const date = new Date(appointment.startDatetime).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
    });

    return groups;
  }, [filteredAndSortedAppointments]);

  if (loading) {
    return <LoadingState message="Carregando agendamentos..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header com filtros */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Text variant="h3" weight="semibold">
              Agendamentos
            </Text>
            <Text variant="body" color="muted">
              {filteredAndSortedAppointments.length} agendamento(s)
            </Text>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <SearchBox
              placeholder="Buscar agendamentos..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="w-full sm:w-64"
            />

            <Dropdown
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
              className="w-full sm:w-auto"
            />

            <Dropdown
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Ordenar por"
              className="w-full sm:w-auto"
            />

            {onCreateNew && (
              <Button onClick={onCreateNew} className="w-full sm:w-auto">
                <Icon name="Plus" size={16} className="mr-2" />
                Novo Agendamento
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Lista de agendamentos */}
      {filteredAndSortedAppointments.length === 0 ? (
        <EmptyState
          icon="Calendar"
          title="Nenhum agendamento encontrado"
          description={
            searchTerm || statusFilter
              ? "Tente ajustar os filtros para encontrar agendamentos."
              : "Comece criando seu primeiro agendamento."
          }
          action={
            onCreateNew && !searchTerm && !statusFilter ? (
              <Button onClick={onCreateNew}>
                <Icon name="Plus" size={16} className="mr-2" />
                Criar Agendamento
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
            <div key={date}>
              <div className="flex items-center space-x-3 mb-4">
                <Text variant="h4" weight="semibold" color="muted">
                  {date}
                </Text>
                <div className="flex-1 h-px bg-neutral-200" />
                <Text variant="small" color="muted">
                  {dayAppointments.length} agendamento(s)
                </Text>
              </div>

              <div className="grid gap-4">
                {dayAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onReschedule={onReschedule}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};