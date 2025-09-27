import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, AlertCircle } from 'lucide-react';
import type { CreateWaitingList, Patient, Professional } from '../../../types';

interface WaitingListFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWaitingList) => Promise<boolean>;
  patients: Patient[];
  professionals: Professional[];
  initialData?: Partial<CreateWaitingList>;
  loading?: boolean;
}

const WaitingListForm: React.FC<WaitingListFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patients,
  professionals,
  initialData,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateWaitingList>({
    patient_id: 0,
    professional_id: undefined,
    preferred_date: '',
    preferred_time_start: '',
    preferred_time_end: '',
    priority: 3,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        patient_id: initialData.patient_id || 0,
        professional_id: initialData.professional_id,
        preferred_date: initialData.preferred_date || '',
        preferred_time_start: initialData.preferred_time_start || '',
        preferred_time_end: initialData.preferred_time_end || '',
        priority: initialData.priority || 3,
        notes: initialData.notes || '',
      });
    } else {
      // Reset form when opening for new entry
      setFormData({
        patient_id: 0,
        professional_id: undefined,
        preferred_date: '',
        preferred_time_start: '',
        preferred_time_end: '',
        priority: 3,
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleInputChange = (field: keyof CreateWaitingList, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient_id || formData.patient_id === 0) {
      newErrors.patient_id = 'Selecione um paciente';
    }

    if (formData.preferred_time_start && formData.preferred_time_end) {
      if (formData.preferred_time_start >= formData.preferred_time_end) {
        newErrors.preferred_time_end = 'Horário final deve ser posterior ao inicial';
      }
    }

    if (formData.priority < 1 || formData.priority > 5) {
      newErrors.priority = 'Prioridade deve estar entre 1 e 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5: return 'Urgente';
      case 4: return 'Alta';
      case 3: return 'Média';
      case 2: return 'Baixa';
      case 1: return 'Muito Baixa';
      default: return 'Média';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'text-red-600';
      case 4: return 'text-orange-600';
      case 3: return 'text-yellow-600';
      case 2: return 'text-blue-600';
      case 1: return 'text-gray-600';
      default: return 'text-yellow-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Editar Lista de Espera' : 'Adicionar à Lista de Espera'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Paciente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Paciente *
            </label>
            <select
              value={formData.patient_id}
              onChange={(e) => handleInputChange('patient_id', Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.patient_id ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value={0}>Selecione um paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} {patient.phone && `- ${patient.phone}`}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.patient_id}
              </p>
            )}
          </div>

          {/* Profissional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profissional (opcional)
            </label>
            <select
              value={formData.professional_id || ''}
              onChange={(e) => handleInputChange('professional_id', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Qualquer profissional</option>
              {professionals.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.name} {professional.specialty && `- ${professional.specialty}`}
                </option>
              ))}
            </select>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Preferida
              </label>
              <input
                type="date"
                value={formData.preferred_date}
                onChange={(e) => handleInputChange('preferred_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Horário Início
              </label>
              <input
                type="time"
                value={formData.preferred_time_start}
                onChange={(e) => handleInputChange('preferred_time_start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário Fim
              </label>
              <input
                type="time"
                value={formData.preferred_time_end}
                onChange={(e) => handleInputChange('preferred_time_end', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.preferred_time_end ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.preferred_time_end && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.preferred_time_end}
                </p>
              )}
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', Number(e.target.value))}
                className="w-full"
                disabled={loading}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Muito Baixa</span>
                <span className={`font-medium ${getPriorityColor(formData.priority)}`}>
                  {getPriorityLabel(formData.priority)}
                </span>
                <span>Urgente</span>
              </div>
            </div>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.priority}
              </p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Informações adicionais sobre as preferências do paciente..."
              disabled={loading}
            />
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting || loading}
            >
              {submitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WaitingListForm;