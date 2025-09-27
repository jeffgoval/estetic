import React, { useState } from 'react';
import { ArrowUp, ArrowDown, AlertTriangle, Clock, User, X } from 'lucide-react';
import PriorityBadge from '../../molecules/PriorityBadge';
import type { WaitingList } from '../../../types';

interface PriorityManagerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: Array<WaitingList & {
    patient_name?: string;
    professional_name?: string;
  }>;
  onPriorityChange: (entryId: number, newPriority: number) => Promise<boolean>;
  onBulkPriorityChange?: (entryIds: number[], newPriority: number) => Promise<boolean>;
  className?: string;
}

const PriorityManager: React.FC<PriorityManagerProps> = ({
  isOpen,
  onClose,
  entries,
  onPriorityChange,
  onBulkPriorityChange,
  className = '',
}) => {
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
  const [bulkPriority, setBulkPriority] = useState<number>(3);
  const [updating, setUpdating] = useState<number[]>([]);

  const sortedEntries = [...entries].sort((a, b) => {
    // Ordenar por prioridade (maior primeiro) e depois por data de criação
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const handlePriorityChange = async (entryId: number, newPriority: number) => {
    setUpdating(prev => [...prev, entryId]);
    try {
      await onPriorityChange(entryId, newPriority);
    } finally {
      setUpdating(prev => prev.filter(id => id !== entryId));
    }
  };

  const handleBulkPriorityChange = async () => {
    if (selectedEntries.length === 0 || !onBulkPriorityChange) return;

    setUpdating(prev => [...prev, ...selectedEntries]);
    try {
      await onBulkPriorityChange(selectedEntries, bulkPriority);
      setSelectedEntries([]);
    } finally {
      setUpdating(prev => prev.filter(id => !selectedEntries.includes(id)));
    }
  };

  const toggleSelection = (entryId: number) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const selectAll = () => {
    setSelectedEntries(entries.map(entry => entry.id));
  };

  const clearSelection = () => {
    setSelectedEntries([]);
  };

  const getPriorityStats = () => {
    const stats = entries.reduce((acc, entry) => {
      acc[entry.priority] = (acc[entry.priority] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return [
      { priority: 5, count: stats[5] || 0, label: 'Urgente', color: 'text-red-600' },
      { priority: 4, count: stats[4] || 0, label: 'Alta', color: 'text-orange-600' },
      { priority: 3, count: stats[3] || 0, label: 'Média', color: 'text-yellow-600' },
      { priority: 2, count: stats[2] || 0, label: 'Baixa', color: 'text-blue-600' },
      { priority: 1, count: stats[1] || 0, label: 'Muito Baixa', color: 'text-gray-600' },
    ];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!isOpen) return null;

  const priorityStats = getPriorityStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gerenciar Prioridades
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Organize a lista de espera por prioridade
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estatísticas */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Distribuição de Prioridades</h3>
          <div className="grid grid-cols-5 gap-4">
            {priorityStats.map((stat) => (
              <div key={stat.priority} className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.count}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações em lote */}
        {onBulkPriorityChange && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Selecionar todos
                  </button>
                  {selectedEntries.length > 0 && (
                    <button
                      onClick={clearSelection}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Limpar seleção
                    </button>
                  )}
                </div>
                {selectedEntries.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedEntries.length} selecionado(s)
                  </span>
                )}
              </div>

              {selectedEntries.length > 0 && (
                <div className="flex items-center gap-3">
                  <select
                    value={bulkPriority}
                    onChange={(e) => setBulkPriority(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={5}>Urgente</option>
                    <option value={4}>Alta</option>
                    <option value={3}>Média</option>
                    <option value={2}>Baixa</option>
                    <option value={1}>Muito Baixa</option>
                  </select>
                  <button
                    onClick={handleBulkPriorityChange}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                    disabled={updating.some(id => selectedEntries.includes(id))}
                  >
                    Alterar Prioridade
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista de entradas */}
        <div className="max-h-96 overflow-y-auto">
          {sortedEntries.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma entrada na lista</h3>
              <p className="text-gray-500">Não há pacientes na lista de espera para gerenciar.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    selectedEntries.includes(entry.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {onBulkPriorityChange && (
                        <input
                          type="checkbox"
                          checked={selectedEntries.includes(entry.id)}
                          onChange={() => toggleSelection(entry.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      )}

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {entry.patient_name || 'Paciente não encontrado'}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Adicionado em {formatDate(entry.created_at)}</span>
                            {entry.professional_name && (
                              <span>• {entry.professional_name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <PriorityBadge priority={entry.priority} />
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePriorityChange(entry.id, Math.min(5, entry.priority + 1))}
                          className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                          disabled={entry.priority >= 5 || updating.includes(entry.id)}
                          title="Aumentar prioridade"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePriorityChange(entry.id, Math.max(1, entry.priority - 1))}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          disabled={entry.priority <= 1 || updating.includes(entry.id)}
                          title="Diminuir prioridade"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {updating.includes(entry.id) && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </div>

                  {entry.notes && (
                    <div className="mt-2 ml-14 text-sm text-gray-600">
                      <p>{entry.notes}</p>
                    </div>
                  )}

                  {entry.priority >= 4 && (
                    <div className="mt-2 ml-14 flex items-center gap-2 text-sm text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Alta prioridade - considere contato imediato</span>
                    </div>
                  )}
                </div>
              ))}
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

export default PriorityManager;