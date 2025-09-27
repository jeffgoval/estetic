import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { Modal } from '../Modal';
import { WorkingHoursConfig } from '../../molecules/WorkingHoursConfig';
import { useProfessionalForm } from '../../../hooks/professionals/useProfessionalForm';
import { cn } from '../../../utils/cn';
import type { Professional, CreateProfessional } from '../../../types';

export interface ProfessionalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProfessional) => Promise<void>;
  professional?: Professional | null;
  loading?: boolean;
  className?: string;
}

const SPECIALTY_OPTIONS = [
  'Estética Facial',
  'Estética Corporal',
  'Harmonização Orofacial',
  'Fisioterapia Dermatofuncional',
  'Cosmetologia',
  'Massoterapia',
  'Dermatologia',
  'Cirurgia Plástica',
  'Biomedicina Estética',
  'Outro'
];

const ProfessionalForm: React.FC<ProfessionalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  professional = null,
  loading = false,
  className
}) => {
  const {
    formData,
    errors,
    isValid,
    isDirty,
    isEditing,
    updateField,
    touchField,
    validateForm,
    resetForm,
    getFieldError,
    hasFieldError
  } = useProfessionalForm(professional);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('Você tem alterações não salvas. Deseja realmente fechar?')) {
      return;
    }
    resetForm();
    onClose();
  };

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplica a máscara (11) 99999-9999
    if (digits.length <= 11) {
      return digits.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    
    return value;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    updateField('phone', formatted);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Profissional' : 'Novo Profissional'}
      size="lg"
      className={className}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Nome completo"
              required
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              onBlur={() => touchField('name')}
              error={getFieldError('name')}
              placeholder="Digite o nome completo do profissional"
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="Registro Profissional"
              value={formData.registrationNumber || ''}
              onChange={(e) => updateField('registrationNumber', e.target.value)}
              onBlur={() => touchField('registrationNumber')}
              error={getFieldError('registrationNumber')}
              placeholder="Ex: CRM 12345, COREN 67890"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Especialidade
            </label>
            <select
              value={formData.specialty || ''}
              onChange={(e) => updateField('specialty', e.target.value)}
              onBlur={() => touchField('specialty')}
              disabled={loading}
              className={cn(
                'w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                hasFieldError('specialty') && 'border-error-500 focus:ring-error-500 focus:border-error-500'
              )}
            >
              <option value="">Selecione uma especialidade</option>
              {SPECIALTY_OPTIONS.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            {hasFieldError('specialty') && (
              <Text variant="caption" className="text-error-600 mt-1">
                {getFieldError('specialty')}
              </Text>
            )}
          </div>

          <div>
            <Input
              label="Telefone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => touchField('phone')}
              error={getFieldError('phone')}
              placeholder="(11) 99999-9999"
              disabled={loading}
            />
          </div>

          <div>
            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => touchField('email')}
              error={getFieldError('email')}
              placeholder="profissional@exemplo.com"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <WorkingHoursConfig
            value={formData.workingHours}
            onChange={(workingHours) => updateField('workingHours', workingHours)}
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-neutral-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!isValid || loading}
          >
            {isEditing ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export { ProfessionalForm };