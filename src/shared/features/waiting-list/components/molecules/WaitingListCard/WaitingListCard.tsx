import React from 'react';
import { Clock, User, Calendar, Phone, MessageCircle, Mail } from 'lucide-react';
import PriorityBadge from '../PriorityBadge';
import type { WaitingList } from '../../../types';

interface WaitingListCardProps {
  entry: WaitingList & {
    patient_name?: string;
    patient_phone?: string;
    professional_name?: string;
  };
  onSchedule?: (entry: WaitingList) => void;
  onContact?: (entry: WaitingList, method: 'phone' | 'whatsapp' | 'email') => void;
  onEdit?: (entry: WaitingList) => void;
  onRemove?: (entry: WaitingList) => void;
  className?: string;
}

const WaitingListCard: React.FC<WaitingListCardProps> = ({
  entry,
  onSchedule,
  onContact,
  onEdit,
  onRemove,
  className = '',
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não especificado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'text-blue-600 bg-blue-50';
      case 'contacted':
        return 'text-yellow-600 bg-yellow-50';
      case 'scheduled':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'Aguardando';
      case 'contacted':
        return 'Contatado';
      case 'scheduled':
        return 'Agendado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{entry.patient_name || 'Paciente não encontrado'}</h3>
            {entry.patient_phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {entry.patient_phone}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={entry.priority} />
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
            {getStatusLabel(entry.status)}
          </span>
        </div>
      </div>

      {/* Detalhes */}
      <div className="space-y-2 mb-4">
        {entry.professional_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Profissional: {entry.professional_name}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Data preferida: {formatDate(entry.preferred_date)}</span>
        </div>

        {(entry.preferred_time_start || entry.preferred_time_end) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              Horário: {formatTime(entry.preferred_time_start)} 
              {entry.preferred_time_end && ` - ${formatTime(entry.preferred_time_end)}`}
            </span>
          </div>
        )}

        {entry.notes && (
          <div className="text-sm text-gray-600">
            <p className="font-medium">Observações:</p>
            <p className="text-gray-500">{entry.notes}</p>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {entry.patient_phone && (
            <>
              <button
                onClick={() => onContact?.(entry, 'phone')}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Ligar"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => onContact?.(entry, 'whatsapp')}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onContact?.(entry, 'email')}
            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Email"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(entry)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onSchedule?.(entry)}
            className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
            disabled={entry.status === 'scheduled'}
          >
            {entry.status === 'scheduled' ? 'Agendado' : 'Agendar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingListCard;