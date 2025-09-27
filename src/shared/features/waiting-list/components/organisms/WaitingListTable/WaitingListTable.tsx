import React, { useState } from 'react';
import { Clock, User, Calendar, Phone, MessageCircle, Mail, Edit, Trash2, CalendarPlus } from 'lucide-react';
import PriorityBadge from '../../molecules/PriorityBadge';
import type { WaitingList } from '../../../types';

interface WaitingListTableProps {
  entries: Array<WaitingList & {
    patient_name?: string;
    patient_phone?: string;
    professional_name?: string;
  }>;
  loading?: boolean;
  onSchedule?: (entry: WaitingList) => void;
  onContact?: (entry: WaitingList, method: 'phone' | 'whatsapp' | 'email') => void;
  onEdit?: (entry: WaitingList) => void;
  onRemove?: (entry: WaitingList) => void;
  onPriorityChange?: (entry: WaitingList, newPriority: number) => void;
  className?: string;
}

const WaitingListTable: React.FC<WaitingListTableProps> = ({
  entries,
  loading = false,
  onSchedule,
  onContact,
  onEdit,
  onRemove,
  onPriorityChange,
  className = '',
}) => {
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    let aValue: any = a[sortField as keyof typeof a];
    let bValue: any = b[sortField as keyof typeof b];

    if (sortField === 'priority') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando lista de espera...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum paciente na lista de espera</h3>
          <p className="text-gray-500">Quando houver pacientes aguardando agendamento, eles aparecerão aqui.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('patient_name')}
              >
                Paciente
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('priority')}
              >
                Prioridade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profissional
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Preferida
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horário
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                Adicionado em
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.patient_name || 'Paciente não encontrado'}
                      </div>
                      {entry.patient_phone && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {entry.patient_phone}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={entry.priority}
                    onChange={(e) => onPriorityChange?.(entry, Number(e.target.value))}
                    className="text-sm border-0 bg-transparent focus:ring-0 p-0"
                  >
                    <option value={5}>Urgente</option>
                    <option value={4}>Alta</option>
                    <option value={3}>Média</option>
                    <option value={2}>Baixa</option>
                    <option value={1}>Muito Baixa</option>
                  </select>
                  <div className="mt-1">
                    <PriorityBadge priority={entry.priority} />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.professional_name || 'Qualquer profissional'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(entry.preferred_date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(entry.preferred_time_start || entry.preferred_time_end) && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatTime(entry.preferred_time_start)}
                      {entry.preferred_time_end && ` - ${formatTime(entry.preferred_time_end)}`}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                    {getStatusLabel(entry.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(entry.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    {/* Contato */}
                    {entry.patient_phone && (
                      <>
                        <button
                          onClick={() => onContact?.(entry, 'phone')}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Ligar"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onContact?.(entry, 'whatsapp')}
                          className="p-1 text-gray-400 hover:text-green-600 rounded"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onContact?.(entry, 'email')}
                      className="p-1 text-gray-400 hover:text-purple-600 rounded"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>

                    {/* Ações principais */}
                    <button
                      onClick={() => onSchedule?.(entry)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="Agendar"
                      disabled={entry.status === 'scheduled'}
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit?.(entry)}
                      className="p-1 text-gray-400 hover:text-yellow-600 rounded"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemove?.(entry)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaitingListTable;