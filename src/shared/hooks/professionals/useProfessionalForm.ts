import { useState, useEffect } from 'react';
import { useProfessionalsStore } from '../../stores/useProfessionalsStore';
import type { Professional, CreateProfessional } from '../../types';

/**
 * Hook para gerenciar formulário de profissional
 * Fornece estado do formulário, validação e funções de manipulação
 */
export const useProfessionalForm = (initialProfessional?: Professional | null) => {
  const { selectProfessional } = useProfessionalsStore();
  
  // Estado inicial do formulário
  const getInitialFormData = (): CreateProfessional => ({
    name: '',
    registrationNumber: '',
    specialty: '',
    phone: '',
    email: '',
    workingHours: {},
  });

  const [formData, setFormData] = useState<CreateProfessional>(getInitialFormData());
  const [errors, setErrors] = useState<Partial<Record<keyof CreateProfessional, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CreateProfessional, boolean>>>({});

  // Preencher formulário quando profissional inicial mudar
  useEffect(() => {
    if (initialProfessional) {
      setFormData({
        name: initialProfessional.name,
        registrationNumber: initialProfessional.registrationNumber || '',
        specialty: initialProfessional.specialty || '',
        phone: initialProfessional.phone || '',
        email: initialProfessional.email || '',
        workingHours: initialProfessional.workingHours || {},
      });
      selectProfessional(initialProfessional);
    } else {
      resetForm();
    }
  }, [initialProfessional, selectProfessional]);

  // Validação de campos
  const validateField = (field: keyof CreateProfessional, value: any): string => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) {
          return 'Nome é obrigatório';
        }
        if (value.trim().length < 2) {
          return 'Nome deve ter pelo menos 2 caracteres';
        }
        return '';
        
      case 'email':
        if (value && value.trim().length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return 'Email inválido';
          }
        }
        return '';
        
      case 'phone':
        if (value && value.trim().length > 0) {
          const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
          if (!phoneRegex.test(value)) {
            return 'Telefone deve estar no formato (11) 99999-9999';
          }
        }
        return '';
        
      default:
        return '';
    }
  };

  // Validar todos os campos
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateProfessional, string>> = {};
    
    Object.keys(formData).forEach((key) => {
      const field = key as keyof CreateProfessional;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Atualizar campo do formulário
  const updateField = (field: keyof CreateProfessional, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar campo se já foi tocado
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Marcar campo como tocado
  const touchField = (field: keyof CreateProfessional) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar campo quando tocado
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData(getInitialFormData());
    setErrors({});
    setTouched({});
    selectProfessional(null);
  };

  // Verificar se formulário é válido
  const isValid = Object.keys(errors).length === 0 && formData.name.trim().length > 0;
  
  // Verificar se formulário foi modificado
  const isDirty = initialProfessional ? (
    formData.name !== initialProfessional.name ||
    formData.registrationNumber !== (initialProfessional.registrationNumber || '') ||
    formData.specialty !== (initialProfessional.specialty || '') ||
    formData.phone !== (initialProfessional.phone || '') ||
    formData.email !== (initialProfessional.email || '') ||
    JSON.stringify(formData.workingHours) !== JSON.stringify(initialProfessional.workingHours || {})
  ) : (
    formData.name.trim().length > 0 ||
    formData.registrationNumber.trim().length > 0 ||
    formData.specialty.trim().length > 0 ||
    formData.phone.trim().length > 0 ||
    formData.email.trim().length > 0 ||
    Object.keys(formData.workingHours || {}).length > 0
  );

  return {
    // Dados do formulário
    formData,
    errors,
    touched,
    
    // Estado
    isValid,
    isDirty,
    isEditing: !!initialProfessional,
    
    // Ações
    updateField,
    touchField,
    validateForm,
    resetForm,
    
    // Utilitários
    getFieldError: (field: keyof CreateProfessional) => errors[field] || '',
    isFieldTouched: (field: keyof CreateProfessional) => !!touched[field],
    hasFieldError: (field: keyof CreateProfessional) => !!errors[field],
  };
};