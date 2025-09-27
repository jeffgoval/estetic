import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Search, CheckCircle, X } from 'lucide-react';
import useAvailableSlots from '../../hooks/useAvailableSlots';
import type { WaitingList, CreateAppointment } from '../../../types';

interface AvailableSlotsSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  waitingListEntry: WaitingList & {
    patient_name?: string;
    professional_name?: string;
  };
  onSchedule: (appointmentData: CreateAppointment) => Promise<boolean>;
  className?: string;
}

const AvailableSlotsSuggestions: React.FC<AvailableSlotsSuggestionsProps> = ({
  isOpen,
  onClose,
  waitingListEntry,
  onSchedule,
  className = '',
}) => {
  const { availableSlots, loading, error, searchSlots } = useAvailableSlots();
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [scheduling, setScheduling] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    daysAhead: 7,
    durationMinutes: 60,
  });

  useEffect(() => {
    if (isOpen && waitingListEntry) {
      // Buscar slots disponíveis baseados nas preferências do paciente
      searchSlots({
        professionalId: waitingListEntry.professional_id,
        preferredDate: waitingListEntry.preferred_date,
        preferredTimeStart: waitingListEntry.preferred_time_start,
        preferredTimeEnd: waitingListEntry.preferred_time_end,
        durationMinutes: searchCriteria.durationMinutes,
        daysAhead: searchCriteria.daysAhead,
      });
    }
  }, [isOpen, waitingListEntry, searchCriteria]);

  const handleSearch = () => {
    searchSlots({
      professionalId: waitingListEntry.professional_id,
      preferredDate: waitingListEntry.preferred_date,
      preferredTimeStart: waitingListEntry.preferred_time_start,
      preferredTimeEnd: waitingListEntry.preferred_time_end,
      durationMinutes: searchCriteria.durationMinutes,
      daysAhead: searchCriteria.daysAhead,
    });
  };

  const handleScheduleSlot = async (slot: any) => {
    if (!slot || scheduling) return;

    setScheduling(true);
    try {
      const appointmentData: CreateAppointment = {
        patient_id: waitingListEntry.patient_id,
        professional_id: slot.professionalId,
        title: `Consulta - ${waitingListEntry.patient_name}`,
        start_datetime: `${slot.date}T${slot.startTime}:00`,
        end_datetime: `${slot.date}T${slot.endTime}:00`,
        notes: `Agendado da lista de espera. ${waitingListEntry.notes || ''}`.trim(),
      };

      const success = await onSchedule(appointmentData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao agendar:', error);
    } finally {
      setScheduling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const isPreferredSlot = (slot: any) => {
    if (!waitingListEntry.preferred_date && !waitingListEntry.preferred_time_start) {
      return false;
    }

    const matchesDate = !waitingListEntry.preferred_date || slot.date === waitingListEntry.preferred_date;
    const matchesTime = !waitingListEntry.preferred_time_start || 
      (slot.startTime >= waitingListEntry.preferred_time_start && 
       (!waitingListEntry.preferred_time_end || slot.endTime <= waitingListEntry.preferred_time_end));

    return matchesDate && matchesTime;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Horários Disponíveis
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Paciente: <span className="font-medium">{waitingListEntry.patient_name}</span>
              {waitingListEntry.professional_name && (
                <> • Profissional: <span className="font-medium">{waitingListEntry.professional_name}</span></>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros de busca */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Próximos dias
              </label>
              <select
                value={searchCriteria.daysAhead}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, daysAhead: Number(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={7}>7 dias</option>
                <option value={14}>14 dias</option>
                <option value={30}>30 dias</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duração
              </label>
              <select
                value={searchCriteria.durationMinutes}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1h 30min</option>
                <option value={120}>2 horas</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors mt-6"
              disabled={loading}
            >
              <Search className="w-4 h-4" />
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Buscando horários disponíveis...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={handleSearch}
                className="mt-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && availableSlots.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum horário disponível</h3>
              <p className="text-gray-500 mb-4">
                Não encontramos horários disponíveis com os critérios selecionados.
              </p>
              <button
                onClick={() => setSearchCriteria(prev => ({ ...prev, daysAhead: prev.daysAhead + 7 }))}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Buscar em mais dias
              </button>
            </div>
          )}

          {!loading && !error && availableSlots.length > 0 && (
            <div className="space-y-4">
              {/* Slots preferidos */}
              {availableSlots.some(isPreferredSlot) && (
                <div>
                  <h3 className="text-lg font-medium text-green-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Horários que atendem às preferências
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableSlots.filter(isPreferredSlot).map((slot, index) => (
                      <div
                        key={index}
                        className="border-2 border-green-200 bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-green-800">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{formatDate(slot.date)}</span>
                          </div>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex items-center gap-2 text-green-700 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <User className="w-4 h-4" />
                          <span>{slot.professionalName}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScheduleSlot(slot);
                          }}
                          className="w-full mt-3 px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm"
                          disabled={scheduling}
                        >
                          {scheduling ? 'Agendando...' : 'Agendar'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outros slots */}
              {availableSlots.some(slot => !isPreferredSlot(slot)) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    Outros horários disponíveis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableSlots.filter(slot => !isPreferredSlot(slot)).map((slot, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <div className="flex items-center gap-2 text-gray-800 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{formatDate(slot.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <User className="w-4 h-4" />
                          <span>{slot.professionalName}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScheduleSlot(slot);
                          }}
                          className="w-full mt-3 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm"
                          disabled={scheduling}
                        >
                          {scheduling ? 'Agendando...' : 'Agendar'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailableSlotsSuggestions;