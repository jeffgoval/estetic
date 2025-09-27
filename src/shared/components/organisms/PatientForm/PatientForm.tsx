import React, { useState } from 'react';

import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { FormField } from '../../molecules/FormField';
import { cn } from '../../../utils/cn';
import { validators } from '../../../utils/validators';
import type { Patient, CreatePatient } from '../../../types';

export interface PatientFormProps {
  patient?: Patient | null;
  onSubmit: (data: CreatePatient) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

interface FormErrors {
  [key: string]: string;
}

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  loading = false,
  className
}) => {
  const [formData, setFormData] = useState<CreatePatient>({
    name: patient?.name || '',
    phone: patient?.phone || '',
    email: patient?.email || '',
    cpf: patient?.cpf || '',
    birth_date: patient?.birth_date || '',
    address: patient?.address || '',
    emergency_contact: patient?.emergency_contact || '',
    medical_history: patient?.medical_history || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Nome é obrigatório
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validação do email (se fornecido)
    if (formData.email && formData.email.trim()) {
      if (!validators.isValidEmail(formData.email)) {
        newErrors.email = 'Email deve ter um formato válido';
      }
    }

    // Validação do telefone (se fornecido)
    if (formData.phone && formData.phone.trim()) {
      if (!validators.isValidPhone(formData.phone)) {
        newErrors.phone = 'Telefone deve ter um formato válido (mínimo 8 dígitos)';
      }
    }

    // Validação do CPF (se fornecido)
    if (formData.cpf && formData.cpf.trim()) {
      if (!validators.isValidCPF(formData.cpf)) {
        newErrors.cpf = 'CPF deve ter um formato válido';
      }
    }

    // Validação da data de nascimento (se fornecida)
    if (formData.birth_date && formData.birth_date.trim()) {
      if (!validators.isValidDate(formData.birth_date)) {
        newErrors.birth_date = 'Data de nascimento deve ser válida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Erro será tratado pelo componente pai
      console.error('Erro ao salvar paciente:', error);
    }
  };

  const handleInputChange = (field: keyof CreatePatient, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isFormValid = formData.name.trim().length > 0;

  return (
    <div className={cn('bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <Text variant="h2" className="text-neutral-900">
          {patient ? 'Editar Paciente' : 'Novo Paciente'}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={loading}
          className="p-2"
        >
          <Icon name="X" size="sm" />
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Nome completo"
            required
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            placeholder="Digite o nome completo do paciente"
            disabled={loading}
          />

          <FormField
            label="Telefone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="(11) 99999-9999"
            disabled={loading}
          />

          <FormField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            placeholder="email@exemplo.com"
            disabled={loading}
          />

          <FormField
            label="CPF"
            type="text"
            value={formData.cpf}
            onChange={(e) => handleInputChange('cpf', e.target.value)}
            error={errors.cpf}
            placeholder="000.000.000-00"
            disabled={loading}
          />

          <FormField
            label="Data de nascimento"
            type="date"
            value={formData.birth_date}
            onChange={(e) => handleInputChange('birth_date', e.target.value)}
            error={errors.birth_date}
            disabled={loading}
          />

          <FormField
            label="Contato de emergência"
            type="text"
            value={formData.emergency_contact}
            onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
            placeholder="Nome e telefone de contato"
            disabled={loading}
          />
        </div>

        <FormField
          label="Endereço"
          type="text"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Rua, número, bairro, cidade - UF"
          disabled={loading}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Histórico médico / Observações
          </label>
          <textarea
            rows={4}
            value={formData.medical_history}
            onChange={(e) => handleInputChange('medical_history', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
            placeholder="Alergias, medicamentos, histórico de tratamentos, procedimentos anteriores..."
            disabled={loading}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-neutral-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!isFormValid}
          >
            {patient ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>

        {/* Hint */}
        <div className="text-xs text-neutral-500 border-t border-neutral-200 pt-4">
          <div className="flex items-start space-x-2">
            <Icon name="AlertCircle" size="sm" className="text-neutral-400 mt-0.5" />
            <div>
              <strong>Dica:</strong> Apenas o nome é obrigatório para cadastrar um paciente. 
              Os demais campos podem ser preenchidos posteriormente.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export { PatientForm };