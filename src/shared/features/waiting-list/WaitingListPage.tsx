import React, { useState, useEffect } from 'react';
import { Plus, Settings, Users, Clock, Search } from 'lucide-react';
import WaitingListTable from './components/organisms/WaitingListTable';
import WaitingListForm from './components/organisms/WaitingListForm';
import AvailableSlotsSuggestions from './components/organisms/AvailableSlotsSuggestions';
import PriorityManager from './components/organisms/PriorityManager';
import WaitingListFilters from './components/molecules/WaitingListFilters';
import WaitingListCard from './components/molecules/WaitingListCard';
import useWaitingList from './hooks/useWaitingList';
import useWaitingListActions from './hooks/useWaitingListActions';
import type { WaitingList, Patient, Professional, CreateWaitingList, CreateAppointment } from '../types';

const WaitingListPage: React.FC = () => {
  // Estados principais
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    professionalId: '',
    search: '',
  });

  // Estados dos modais
  const [showForm, setShowForm] = useState(false);
  const [showSlotsSuggestions, setShowSlotsSuggestions] = useState(false);
  const [showPriorityManager, setShowPriorityManager] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WaitingList | null>(null);
  const [selectedEntryForScheduling, setSelectedEntryForScheduling] = useState<WaitingList | null>(null);

  // Dados
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  // Hooks
  const { waitingList, loading, error, refetch } = useWaitingList({
    status: filters.status || undefined,
    priority: filters.priority ? Number(filters.priority) : undefined,
    professionalId: filters.professionalId ? Number(filters.professionalId) : undefined,
  });

  const {
    loading: actionLoading,
    error: actionError,
    addToWaitingList,
    updateWaitingListEntry,
    removeFromWaitingList,
    scheduleFromWaitingList,
    updatePriority,
    contactPatient,
  } = useWaitingListActions();

  // Carregar dados iniciais
  useEffect(() => {
    loadPatients();
    loadProfessionals();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await fetch('/api/patients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data.results || []);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const loadProfessionals = async () => {
    try {
      const response = await fetch('/api/professionals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.results || []);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  // Filtrar lista de espera por busca
  const filteredWaitingList = waitingList.filter(entry => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      entry.patient_name?.toLowerCase().includes(searchTerm) ||
      entry.professional_name?.toLowerCase().includes(searchTerm) ||
      entry.notes?.toLowerCase().includes(searchTerm)
    );
  });

  // Handlers
  const handleAddToWaitingList = () => {
    setEditingEntry(null);
    setShowForm(true);
  };

  const handleEditEntry = (entry: WaitingList) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleScheduleEntry = (entry: WaitingList) => {
    setSelectedEntryForScheduling(entry);
    setShowSlotsSuggestions(true);
  };

  const handleFormSubmit = async (data: CreateWaitingList): Promise<boolean> => {
    try {
      let success = false;
      
      if (editingEntry) {
        success = await updateWaitingListEntry(editingEntry.id, data);
      } else {
        success = await addToWaitingList(data);
      }

      if (success) {
        await refetch();
        setShowForm(false);
        setEditingEntry(null);
      }

      return success;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      return false;
    }
  };

  const handleScheduleFromSlots = async (appointmentData: CreateAppointment): Promise<boolean> => {
    if (!selectedEntryForScheduling) return false;

    try {
      const success = await scheduleFromWaitingList(selectedEntryForScheduling.id, appointmentData);
      if (success) {
        await refetch();
        setShowSlotsSuggestions(false);
        setSelectedEntryForScheduling(null);
      }
      return success;
    } catch (error) {
      console.error('Erro ao agendar:', error);
      return false;
    }
  };

  const handleRemoveEntry = async (entry: WaitingList) => {
    if (!confirm(`Tem certeza que deseja remover ${entry.patient_name} da lista de espera?`)) {
      return;
    }

    const success = await removeFromWaitingList(entry.id);
    if (success) {
      await refetch();
    }
  };

  const handlePriorityChange = async (entry: WaitingList, newPriority: number) => {
    const success = await updatePriority(entry.id, newPriority);
    if (success) {
      await refetch();
    }
  };

  const handleContactPatient = async (entry: WaitingList, method: 'phone' | 'whatsapp' | 'email') => {
    const success = await contactPatient(entry.id, method);
    if (success) {
      await refetch();
    }
  };

  const getStatusStats = () => {
    const stats = filteredWaitingList.reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      waiting: stats.waiting || 0,
      contacted: stats.contacted || 0,
      scheduled: stats.scheduled || 0,
      total: filteredWaitingList.length,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lista de Espera</h1>
          <p className="text-gray-600 mt-1">
            Gerencie pacientes aguardando agendamento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPriorityManager(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Gerenciar Prioridades
          </button>
          <button
            onClick={handleAddToWaitingList}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar à Lista
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aguardando</p>
              <p className="text-2xl font-bold text-gray-900">{stats.waiting}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contatados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.contacted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Agendados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <WaitingListFilters
        filters={filters}
        onFiltersChange={setFilters}
        professionals={professionals}
        className="mb-6"
      />

      {/* Controles de visualização */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tabela
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              viewMode === 'cards'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cards
          </button>
        </div>

        <p className="text-sm text-gray-600">
          {filteredWaitingList.length} de {waitingList.length} entradas
        </p>
      </div>

      {/* Conteúdo principal */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={refetch}
            className="mt-2 px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{actionError}</p>
        </div>
      )}

      {viewMode === 'table' ? (
        <WaitingListTable
          entries={filteredWaitingList}
          loading={loading}
          onSchedule={handleScheduleEntry}
          onContact={handleContactPatient}
          onEdit={handleEditEntry}
          onRemove={handleRemoveEntry}
          onPriorityChange={handlePriorityChange}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWaitingList.map((entry) => (
            <WaitingListCard
              key={entry.id}
              entry={entry}
              onSchedule={handleScheduleEntry}
              onContact={handleContactPatient}
              onEdit={handleEditEntry}
              onRemove={handleRemoveEntry}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      <WaitingListForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingEntry(null);
        }}
        onSubmit={handleFormSubmit}
        patients={patients}
        professionals={professionals}
        initialData={editingEntry || undefined}
        loading={actionLoading}
      />

      {selectedEntryForScheduling && (
        <AvailableSlotsSuggestions
          isOpen={showSlotsSuggestions}
          onClose={() => {
            setShowSlotsSuggestions(false);
            setSelectedEntryForScheduling(null);
          }}
          waitingListEntry={selectedEntryForScheduling}
          onSchedule={handleScheduleFromSlots}
        />
      )}

      <PriorityManager
        isOpen={showPriorityManager}
        onClose={() => setShowPriorityManager(false)}
        entries={waitingList}
        onPriorityChange={async (entry, newPriority) => {
          const success = await updatePriority(entry.id, newPriority);
          if (success) {
            await refetch();
          }
          return success;
        }}
      />
    </div>
  );
};

export default WaitingListPage;