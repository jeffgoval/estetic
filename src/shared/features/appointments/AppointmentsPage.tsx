import React, { useState } from 'react';
import { Button } from '../../components/atoms/Button';
import { Icon } from '../../components/atoms/Icon';
import { Text } from '../../components/atoms/Text';
import { Card } from '../../components/atoms/Card';
import { Modal } from '../../components/organisms/Modal';
import { Calendar, CalendarEvent } from '../../components/organisms/Calendar';
import { AppointmentList } from '../../components/organisms/AppointmentList';
import { AppointmentForm } from '../../components/organisms/AppointmentForm';
import { AppointmentCard } from '../../components/organisms/AppointmentCard';
import { useAppointments } from '../../hooks/appointments/useAppointments';
import { useAppointmentActions } from '../../hooks/appointments/useAppointmentActions';
import { useAppointmentsStore, Appointment } from '../../stores/useAppointmentsStore';
import { cn } from '../../utils/cn';

type ViewMode = 'calendar' | 'list';

export const AppointmentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  const { 
    currentDate, 
    setCurrentDate, 
    viewMode: calendarView, 
    setViewMode: setCalendarViewMode,
    filters,
    setFilters,
  } = useAppointmentsStore();

  const { appointments, loading, error, refetch } = useAppointments(filters);
  const { 
    updateAppointment, 
    deleteAppointment, 
    rescheduleAppointment,
    isUpdating,
    isDeleting,
  } = useAppointmentActions();

  // Converter agendamentos para eventos do calendário
  const calendarEvents: CalendarEvent[] = appointments.map(appointment => ({
    id: appointment.id,
    title: appointment.title,
    start: new Date(appointment.startDatetime),
    end: new Date(appointment.endDatetime),
    color: getStatusColor(appointment.status),
    data: appointment,
  }));

  function getStatusColor(status: Appointment['status']): string {
    const colors = {
      scheduled: '#3B82F6',
      confirmed: '#10B981',
      in_progress: '#F59E0B',
      completed: '#059669',
      cancelled: '#EF4444',
      no_show: '#6B7280',
    };
    return colors[status];
  }

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      deleteAppointment(appointment.id);
    }
  };

  const handleStatusChange = (appointment: Appointment, status: Appointment['status']) => {
    updateAppointment({
      id: appointment.id,
      data: { status }
    });
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleEventDrop = (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    if (event.data) {
      rescheduleAppointment({
        id: event.id,
        newStartDatetime: newStart.toISOString(),
        newEndDatetime: newEnd.toISOString(),
      });
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.data) {
      setSelectedAppointment(event.data);
      setShowAppointmentDetails(true);
    }
  };

  const handleDateClick = (date: Date) => {
    // Criar novo agendamento para a data clicada
    const startDatetime = new Date(date);
    startDatetime.setHours(9, 0, 0, 0); // 9:00 AM por padrão
    
    const endDatetime = new Date(startDatetime);
    endDatetime.setHours(10, 0, 0, 0); // 10:00 AM por padrão

    setSelectedAppointment({
      startDatetime: startDatetime.toISOString().slice(0, 16),
      endDatetime: endDatetime.toISOString().slice(0, 16),
    } as any);
    setShowAppointmentForm(true);
  };

  const handleFormSuccess = () => {
    setShowAppointmentForm(false);
    setSelectedAppointment(null);
    refetch();
  };

  const handleFormCancel = () => {
    setShowAppointmentForm(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <Text variant="h2" weight="bold">
            Agendamentos
          </Text>
          <Text variant="body" color="muted">
            Gerencie os agendamentos da sua clínica
          </Text>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filtros rápidos */}
          <div className="flex items-center space-x-2">
            <Button
              variant={filters.status === 'scheduled' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilters({ status: filters.status === 'scheduled' ? undefined : 'scheduled' })}
            >
              Agendados
            </Button>
            <Button
              variant={filters.status === 'confirmed' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilters({ status: filters.status === 'confirmed' ? undefined : 'confirmed' })}
            >
              Confirmados
            </Button>
          </div>

          {/* Toggle de visualização */}
          <div className="flex items-center bg-neutral-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-md"
            >
              <Icon name="Calendar" size={16} className="mr-2" />
              Calendário
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-md"
            >
              <Icon name="List" size={16} className="mr-2" />
              Lista
            </Button>
          </div>

          <Button onClick={handleCreateAppointment}>
            <Icon name="Plus" size={16} className="mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Conteúdo principal */}
      {viewMode === 'calendar' ? (
        <div className="space-y-4">
          {/* Controles do calendário */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Text variant="body" weight="medium">
                  Visualização:
                </Text>
                <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                  <Button
                    variant={calendarView === 'month' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setCalendarViewMode('month')}
                    className="rounded-md"
                  >
                    Mês
                  </Button>
                  <Button
                    variant={calendarView === 'week' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setCalendarViewMode('week')}
                    className="rounded-md"
                  >
                    Semana
                  </Button>
                  <Button
                    variant={calendarView === 'day' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setCalendarViewMode('day')}
                    className="rounded-md"
                  >
                    Dia
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Text variant="small" color="muted">
                  {appointments.length} agendamento(s)
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={loading}
                >
                  <Icon name="RefreshCw" size={16} />
                </Button>
              </div>
            </div>
          </Card>

          {/* Calendário */}
          <Calendar
            events={calendarEvents}
            view={calendarView}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventDrop={handleEventDrop}
            onEventEdit={handleEditAppointment}
            onEventDelete={handleDeleteAppointment}
            onEventStatusChange={handleStatusChange}
            showEventDetails={calendarView === 'day'}
          />
        </div>
      ) : (
        <AppointmentList
          appointments={appointments}
          loading={loading}
          error={error}
          onEdit={handleEditAppointment}
          onDelete={handleDeleteAppointment}
          onStatusChange={handleStatusChange}
          onReschedule={handleReschedule}
          onCreateNew={handleCreateAppointment}
        />
      )}

      {/* Modal do formulário */}
      <Modal
        isOpen={showAppointmentForm}
        onClose={handleFormCancel}
        title={selectedAppointment?.id ? 'Editar Agendamento' : 'Novo Agendamento'}
        size="lg"
      >
        <AppointmentForm
          initialData={selectedAppointment ? {
            id: selectedAppointment.id,
            patientId: selectedAppointment.patientId,
            professionalId: selectedAppointment.professionalId,
            title: selectedAppointment.title,
            description: selectedAppointment.description,
            startDatetime: selectedAppointment.startDatetime?.slice(0, 16),
            endDatetime: selectedAppointment.endDatetime?.slice(0, 16),
            serviceType: selectedAppointment.serviceType,
            notes: selectedAppointment.notes,
          } : undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Modal de detalhes */}
      <Modal
        isOpen={showAppointmentDetails}
        onClose={() => setShowAppointmentDetails(false)}
        title="Detalhes do Agendamento"
        size="md"
      >
        {selectedAppointment && (
          <AppointmentCard
            appointment={selectedAppointment}
            onEdit={(appointment) => {
              setShowAppointmentDetails(false);
              handleEditAppointment(appointment);
            }}
            onDelete={(appointment) => {
              setShowAppointmentDetails(false);
              handleDeleteAppointment(appointment);
            }}
            onStatusChange={handleStatusChange}
            onReschedule={(appointment) => {
              setShowAppointmentDetails(false);
              handleReschedule(appointment);
            }}
          />
        )}
      </Modal>
    </div>
  );
};