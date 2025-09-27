import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { PermissionGate } from '@/react-app/components/ProtectedRoute';
import { PERMISSIONS } from '@/shared/permissions';
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  User,
  Phone,
  Filter,
  X,
  Save,
  Edit,
  Trash2
} from 'lucide-react';
import type { Procedure } from '@/shared/types';

interface Appointment {
  id: number;
  title: string;
  start_datetime: string;
  end_datetime: string;
  patient_name: string;
  patient_phone: string;
  dentist_name: string;
  dentist_id: number;
  professional_id?: number;
  patient_id: number;
  status: string;
  appointment_type: string;
  service_type?: string;
  description?: string;
  notes?: string;
}

interface Professional {
  id: number;
  name: string;
}

interface Patient {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

interface WorkingHours {
  [key: string]: {
    enabled: boolean;
    start: string;
    end: string;
    break_start?: string;
    break_end?: string;
  };
}

export default function Schedule() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>('day');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({});
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Form state for new appointment
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '',
    professional_id: '',
    description: '',
    service_type: '',
    notes: '',
    start_date: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchProfessionals();
      fetchPatients();
      fetchProcedures();
      loadWorkingHours();
    }
  }, [user, currentDate, selectedProfessional, selectedView]);

  const fetchProfessionals = async () => {
    try {
      const response = await fetch('/api/professionals', {
        credentials: 'include'
      });
      const data = await response.json();
      setProfessionals(data);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  const fetchProcedures = async () => {
    try {
      const response = await fetch('/api/procedures', {
        credentials: 'include'
      });
      const data = await response.json();
      setProcedures(data);
    } catch (error) {
      console.error('Error fetching procedures:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients', {
        credentials: 'include'
      });
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const loadWorkingHours = async () => {
    try {
      const response = await fetch('/api/tenant/settings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkingHours(data.working_hours || {});
      }
    } catch (error) {
      console.error('Error loading working hours:', error);
    }
  };

  const isValidTimeSlot = (date: Date, time: string) => {
    const hour = parseInt(time.split(':')[0]);
    const dayOfWeek = date.getDay();
    
    // Map JavaScript day (0=Sunday) to our working hours keys
    const dayMap = {
      0: 'sunday',
      1: 'monday', 
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    
    const dayKey = dayMap[dayOfWeek as keyof typeof dayMap];
    const dayHours = workingHours[dayKey];
    
    // Check if day is enabled
    if (!dayHours || !dayHours.enabled) {
      return false;
    }
    
    // Check if time is within working hours
    const startHour = parseInt(dayHours.start?.split(':')[0] || '8');
    const endHour = parseInt(dayHours.end?.split(':')[0] || '18');
    
    if (hour < startHour || hour >= endHour) {
      return false;
    }
    
    // Check if time is during lunch break
    if (dayHours.break_start && dayHours.break_end) {
      const breakStartHour = parseInt(dayHours.break_start.split(':')[0]);
      const breakEndHour = parseInt(dayHours.break_end.split(':')[0]);
      
      if (hour >= breakStartHour && hour < breakEndHour) {
        return false;
      }
    }
    
    return true;
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (selectedView === 'day') {
      return { start, end };
    } else if (selectedView === 'week') {
      // Get start of week (Monday)
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      
      return { start, end };
    } else { // month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      
      return { start, end };
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();
      
      let url = '/api/appointments';
      const params = new URLSearchParams();
      
      if (selectedView === 'day') {
        params.append('date', start.toISOString().split('T')[0]);
      } else {
        params.append('start_date', start.toISOString().split('T')[0]);
        params.append('end_date', end.toISOString().split('T')[0]);
      }
      
      if (selectedProfessional !== 'all') {
        params.append('dentist_id', selectedProfessional);
      }

      const response = await fetch(`${url}?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    if (!isValidTimeSlot(date, time)) {
      return; // Don't allow clicking on invalid time slots
    }
    
    // Calculate end time (1 hour later)
    const [hours, minutes] = time.split(':').map(Number);
    const endTime = new Date(date);
    endTime.setHours(hours + 1, minutes);
    
    
    setShowAppointmentModal(true);
    setAppointmentForm({
      patient_id: '',
      professional_id: selectedProfessional !== 'all' ? selectedProfessional : '',
      description: '',
      service_type: '',
      notes: '',
      start_date: date.toISOString().split('T')[0],
      start_time: time,
      end_time: endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
  };

  const handleSaveAppointment = async () => {
    if (!appointmentForm.patient_id || !appointmentForm.professional_id || !appointmentForm.start_date || !appointmentForm.start_time || !appointmentForm.end_time) {
      alert('Por favor, preencha todos os campos obrigatórios (Paciente, Profissional, Data, Início, Fim).');
      return;
    }

    try {
      setSaving(true);
      
      const startDateTime = new Date(`${appointmentForm.start_date}T${appointmentForm.start_time}:00`);
      const endDateTime = new Date(`${appointmentForm.start_date}T${appointmentForm.end_time}:00`);
      
      // Validation: start time cannot be same or after end time
      if (startDateTime.getTime() >= endDateTime.getTime()) {
        alert('A hora de início não pode ser igual ou depois da hora de término.');
        setSaving(false);
        return;
      }

      // Auto-generate title based on service type
      const title = appointmentForm.service_type || 'Consulta';
      
      const appointmentData = {
        patient_id: parseInt(appointmentForm.patient_id),
        dentist_id: parseInt(appointmentForm.professional_id), // Using dentist_id for backend compatibility
        title: title,
        description: appointmentForm.description,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        service_type: appointmentForm.service_type,
        appointment_type: appointmentForm.service_type, // Legacy compatibility
        notes: appointmentForm.notes
      };

      const url = editingAppointment ? `/api/appointments/${editingAppointment.id}` : '/api/appointments';
      const method = editingAppointment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        setShowAppointmentModal(false);
        
        setEditingAppointment(null);
        resetAppointmentForm();
        fetchAppointments(); // Reload appointments
      } else {
        const error = await response.json();
        console.error('Error saving appointment:', error);
        alert(error.error || 'Erro ao salvar agendamento');
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Erro ao salvar agendamento');
    } finally {
      setSaving(false);
    }
  };

  const resetAppointmentForm = () => {
    setAppointmentForm({
      patient_id: '',
      professional_id: '',
      description: '',
      service_type: '',
      notes: '',
      start_date: '',
      start_time: '',
      end_time: ''
    });
  };

  const openEditAppointment = (appointment: Appointment) => {
    const startDate = new Date(appointment.start_datetime);
    const endDate = new Date(appointment.end_datetime);
    
    setEditingAppointment(appointment);
    setAppointmentForm({
      patient_id: appointment.patient_id.toString(),
      professional_id: (appointment.professional_id || appointment.dentist_id).toString(),
      description: appointment.description || '',
      service_type: appointment.service_type || appointment.appointment_type || '',
      notes: appointment.notes || '',
      start_date: startDate.toISOString().split('T')[0],
      start_time: startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      end_time: endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
    
    setShowAppointmentModal(true);
  };

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchAppointments();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    if (!confirm('ATENÇÃO: Esta ação irá excluir permanentemente o agendamento e não pode ser desfeita. Tem certeza?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchAppointments();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir agendamento');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Erro ao excluir agendamento');
    }
  };

  const formatDate = (date: Date) => {
    if (selectedView === 'day') {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (selectedView === 'week') {
      const { start, end } = getDateRange();
      return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (selectedView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (selectedView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-primary/20 text-primary';
      case 'confirmed': return 'bg-success/20 text-success';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-error/20 text-error';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getWeekDays = () => {
    const { start } = getDateRange();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getMonthDays = () => {
    const { start } = getDateRange();
    const year = start.getFullYear();
    const month = start.getMonth();
    
    // Get first day of month and adjust to start on Monday
    const firstDay = new Date(year, month, 1);
    const startDay = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    startDay.setDate(firstDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const days = [];
    const currentDay = new Date(startDay);
    
    // Generate 42 days (6 weeks) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.start_datetime && apt.start_datetime.startsWith(dateStr)
    );
  };

  const getAppointmentsForHour = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      if (!apt.start_datetime || !apt.start_datetime.startsWith(dateStr)) return false;
      const aptHour = new Date(apt.start_datetime).getHours();
      return aptHour === hour;
    });
  };

  const renderDayView = () => (
    <div className="max-h-96 overflow-y-auto">
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando agendamentos...</p>
        </div>
      ) : (
        <div className="space-y-0">
          {Array.from({ length: 12 }, (_, i) => {
            const hour = i + 8; // Start from 8 AM
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            const slotAppointments = getAppointmentsForHour(currentDate, hour);
            const isValidSlot = isValidTimeSlot(currentDate, timeSlot);

            return (
              <div key={`schedule-day-view-hour-${hour}`} className="grid grid-cols-4 md:grid-cols-12 border-b border-gray-100 last:border-b-0">
                <div className="col-span-1 md:col-span-2 p-2 md:p-4 border-r border-gray-200 bg-gray-50">
                  <div className="text-xs md:text-sm font-medium text-gray-600">{timeSlot}</div>
                </div>
                <div className="col-span-3 md:col-span-10 p-2">
                  {slotAppointments.length > 0 ? (
                    <div className="space-y-2">
                      {slotAppointments.map((appointment) => (
                        <div
                          key={`schedule-day-appointment-${appointment.id}`}
                          className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                  {getStatusLabel(appointment.status)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>{appointment.patient_name}</span>
                                </div>
                                {appointment.patient_phone && (
                                  <div className="flex items-center space-x-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{appointment.patient_phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {formatTime(appointment.start_datetime)} - {formatTime(appointment.end_datetime)}
                                  </span>
                                </div>
                              </div>
                              {((appointment as any).professional_name || appointment.dentist_name) && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Profissional {(appointment as any).professional_name || appointment.dentist_name}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              <PermissionGate requiredPermissions={[PERMISSIONS.APPOINTMENT_UPDATE]}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditAppointment(appointment);
                                  }}
                                  className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar agendamento"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              </PermissionGate>
                              {appointment.status !== 'completed' && (
                                <PermissionGate requiredPermissions={[PERMISSIONS.APPOINTMENT_UPDATE]}>
                                  <select
                                    value={appointment.status}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(appointment.id, e.target.value);
                                    }}
                                    className="text-xs p-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <option value="scheduled">Agendado</option>
                                    <option value="confirmed">Confirmado</option>
                                    <option value="completed">Concluído</option>
                                    <option value="cancelled">Cancelado</option>
                                  </select>
                                </PermissionGate>
                              )}
                              <PermissionGate requiredPermissions={[PERMISSIONS.SUPER_ADMIN_ACCESS]}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAppointment(appointment.id);
                                  }}
                                  className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir permanentemente (apenas super admin)"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </PermissionGate>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      className={`h-16 flex items-center justify-center text-sm transition-colors ${
                        isValidSlot 
                          ? 'text-gray-400 hover:bg-gray-50 cursor-pointer hover:text-gray-600' 
                          : 'text-red-300 bg-red-50'
                      }`}
                      onClick={() => isValidSlot && handleTimeSlotClick(currentDate, timeSlot)}
                    >
                      {isValidSlot ? 'Horário disponível - Clique para agendar' : 'Horário indisponível'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando agendamentos...</p>
          </div>
        ) : (
          <div>
            {/* Week header */}
            <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
              <div className="p-2 md:p-3 border-r border-gray-200 w-16 md:w-20">
                <span className="text-xs md:text-sm font-medium text-gray-600">Horário</span>
              </div>
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="p-3 border-r border-gray-200 last:border-r-0">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">
                      {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div className={`text-sm font-medium ${
                      day.toDateString() === new Date().toDateString() 
                        ? 'text-blue-600' 
                        : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Week time slots */}
            {Array.from({ length: 12 }, (_, i) => {
              const hour = i + 8;
              const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
              
              return (
                <div key={`schedule-week-view-hour-${hour}`} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0 min-h-12 md:min-h-16">
                  <div className="p-2 md:p-3 border-r border-gray-200 bg-gray-50 w-16 md:w-20">
                    <div className="text-xs font-medium text-gray-600">{timeSlot}</div>
                  </div>
                  {weekDays.map((day) => {
                    const dayAppointments = getAppointmentsForHour(day, hour);
                    const isValidSlot = isValidTimeSlot(day, timeSlot);
                    
                    return (
                      <div 
                        key={`${day.toISOString()}-${hour}`} 
                        className={`p-1 border-r border-gray-200 last:border-r-0 transition-colors ${
                          isValidSlot && dayAppointments.length === 0 
                            ? 'hover:bg-gray-50 cursor-pointer' 
                            : !isValidSlot ? 'bg-red-50' : ''
                        }`}
                        onClick={() => isValidSlot && dayAppointments.length === 0 && handleTimeSlotClick(day, timeSlot)}
                      >
                        {dayAppointments.map((appointment) => (
                          <div
                            key={`schedule-week-appointment-${appointment.id}`}
                            className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded p-1 mb-1 text-xs hover:shadow-sm transition-shadow cursor-pointer"
                          >
                            <div className="font-medium text-gray-900 truncate text-xs">
                              {appointment.title}
                            </div>
                            <div className="text-gray-600 truncate text-xs hidden md:block">
                              {appointment.patient_name}
                            </div>
                            <div className="text-gray-500 truncate text-xs hidden lg:block">
                              Profissional {(appointment as any).professional_name || appointment.dentist_name}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {formatTime(appointment.start_datetime)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays();
    const currentMonth = currentDate.getMonth();
    
    return (
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando agendamentos...</p>
          </div>
        ) : (
          <div>
            {/* Month header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, dayHeaderIndex) => (
                <div key={`month-header-${dayHeaderIndex}-${day}`} className="p-3 border-r border-gray-200 last:border-r-0 text-center">
                  <span className="text-sm font-medium text-gray-600">{day}</span>
                </div>
              ))}
            </div>
            
            {/* Month calendar grid */}
            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const isCurrentMonth = day.getMonth() === currentMonth;
                const isToday = day.toDateString() === new Date().toDateString();
                const dayAppointments = getAppointmentsForDate(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`border-r border-b border-gray-200 last:border-r-0 p-2 h-24 ${
                      !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday 
                        ? 'text-blue-600' 
                        : isCurrentMonth 
                        ? 'text-gray-900' 
                        : 'text-gray-400'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((appointment) => (
                        <div
                          key={`schedule-month-appointment-${appointment.id}`}
                          className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded px-1 py-0.5 text-xs hover:shadow-sm transition-shadow cursor-pointer"
                        >
                          <div className="font-medium text-gray-900 truncate text-xs">
                            {formatTime(appointment.start_datetime)}
                          </div>
                          <div className="text-gray-600 truncate text-xs hidden sm:block">
                            {appointment.patient_name}
                          </div>
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayAppointments.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCalendarContent = () => {
    switch (selectedView) {
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return (
          <>
            {/* Time slots header */}
            <div className="grid grid-cols-4 md:grid-cols-12 border-b border-gray-200">
              <div className="col-span-1 md:col-span-2 p-2 md:p-4 border-r border-gray-200">
                <h3 className="text-xs md:text-sm font-medium text-gray-600">Horário</h3>
              </div>
              <div className="col-span-3 md:col-span-10 p-2 md:p-4">
                <h3 className="text-xs md:text-sm font-medium text-gray-600">Agendamentos</h3>
              </div>
            </div>
            {renderDayView()}
          </>
        );
    }
  };

  const getViewTitle = () => {
    switch (selectedView) {
      case 'day': return 'Total do Dia';
      case 'week': return 'Total da Semana';
      case 'month': return 'Total do Mês';
      default: return 'Total';
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header with controls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Date navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {formatDate(currentDate)}
                </h2>
              </div>
              
              <button
                onClick={() => navigateDate('next')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* View toggles and filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* View selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['day', 'week', 'month'].map((view, viewIndex) => (
                  <button
                    key={`schedule-view-${viewIndex}-${view}`}
                    onClick={() => setSelectedView(view as typeof selectedView)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedView === view
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {view === 'day' ? 'Dia' : view === 'week' ? 'Semana' : 'Mês'}
                  </button>
                ))}
              </div>

              {/* Professional filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedProfessional}
                  onChange={(e) => setSelectedProfessional(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">Todos os profissionais</option>
                  {professionals.map((professional) => (
                    <option key={`filter-professional-${professional.id}`} value={professional.id}>
                      {professional.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* New appointment button */}
              <PermissionGate requiredPermissions={[PERMISSIONS.APPOINTMENT_CREATE]}>
                <button 
                  onClick={() => {
                    // Calculate default time for new appointment
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    let defaultStartHour = currentHour;

                    // If past half hour, schedule for next hour
                    if (currentMinute > 30) {
                      defaultStartHour = (currentHour + 1) % 24;
                    }

                    const defaultStartTime = `${defaultStartHour.toString().padStart(2, '0')}:00`;
                    const defaultEndTime = `${((defaultStartHour + 1) % 24).toString().padStart(2, '0')}:00`;

                    setShowAppointmentModal(true);
                    
                    setEditingAppointment(null);
                    setAppointmentForm({
                      patient_id: '',
                      professional_id: selectedProfessional !== 'all' ? selectedProfessional : '',
                      description: '',
                      service_type: '',
                      notes: '',
                      start_date: new Date().toISOString().split('T')[0],
                      start_time: defaultStartTime,
                      end_time: defaultEndTime
                    });
                  }}
                  className="btn-primary px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Agendamento</span>
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>

        {/* Calendar view */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {renderCalendarContent()}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getViewTitle()}</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {appointments.filter(apt => apt.status === 'confirmed').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-secondary" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {appointments.filter(apt => apt.status === 'scheduled').length}
                </p>
              </div>
              <User className="w-8 h-8 text-warning" />
            </div>
          </div>
        </div>

        {/* Appointment Modal */}
        {showAppointmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAppointmentModal(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paciente *
                    </label>
                    <select
                      value={appointmentForm.patient_id}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="">Selecione um paciente</option>
                      {patients.map((patient) => (
                        <option key={`schedule-modal-form-patient-${patient.id}`} value={patient.id}>
                          {patient.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profissional *
                    </label>
                    <select
                      value={appointmentForm.professional_id}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, professional_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Selecione um profissional</option>
                      {professionals.map((professional) => (
                        <option key={`schedule-modal-form-professional-${professional.id}`} value={professional.id}>
                          {professional.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data *
                    </label>
                    <input
                      type="date"
                      required
                      value={appointmentForm.start_date}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Início *
                      </label>
                      <input
                        type="time"
                        required
                        value={appointmentForm.start_time}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, start_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fim *
                      </label>
                      <input
                        type="time"
                        required
                        value={appointmentForm.end_time}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, end_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Serviço/Tratamento
                    </label>
                    <select
                      value={appointmentForm.service_type}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, service_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um serviço</option>
                      {procedures.map((procedure) => (
                        <option key={`schedule-modal-procedure-${procedure.id}`} value={procedure.name}>
                          {procedure.name} ({procedure.category})
                        </option>
                      ))}
                      {/* Fallback options if no procedures are loaded */}
                      {procedures.length === 0 && (
                        <>
                          <option value="consulta">Consulta</option>
                          <option value="limpeza_facial">Limpeza Facial</option>
                          <option value="peeling">Peeling</option>
                          <option value="harmonizacao">Harmonização Facial</option>
                          <option value="massagem">Massagem</option>
                          <option value="retorno">Retorno</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={appointmentForm.description}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descrição opcional do agendamento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Observações adicionais"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAppointmentModal(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveAppointment}
                    disabled={saving || !appointmentForm.patient_id || !appointmentForm.professional_id || !appointmentForm.start_date || !appointmentForm.start_time || !appointmentForm.end_time}
                    className="flex-1 btn-primary px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{editingAppointment ? 'Atualizar' : 'Salvar'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
