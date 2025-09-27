// Validadores comuns usando Zod

import { z } from 'zod';

// Validadores básicos
export const validators = {
  // Validação simples de email
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validação simples de telefone
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[\d\s\(\)\-\+]+$/;
    const cleaned = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && cleaned.length >= 8;
  },

  // Validação simples de CPF
  isValidCPF: (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleaned)) return false; // Todos os dígitos iguais
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(10))) return false;
    
    return true;
  },

  // Validação simples de data
  isValidDate: (date: string): boolean => {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  },
  // Email
  email: z.string().email('Email inválido'),

  // Telefone brasileiro
  phone: z.string().regex(
    /^(\(?\d{2}\)?\s?)?(\d{4,5})-?(\d{4})$/,
    'Telefone inválido'
  ),

  // CPF
  cpf: z.string().refine((cpf) => {
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleaned)) return false; // Todos os dígitos iguais
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(10))) return false;
    
    return true;
  }, 'CPF inválido'),

  // CEP
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),

  // Data
  date: z.string().refine((date) => {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  }, 'Data inválida'),

  // Data de nascimento (não pode ser futura)
  birthDate: z.string().refine((date) => {
    const dateObj = new Date(date);
    const today = new Date();
    return dateObj <= today;
  }, 'Data de nascimento não pode ser futura'),

  // Senha forte
  strongPassword: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/\d/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),

  // URL
  url: z.string().url('URL inválida'),

  // Número positivo
  positiveNumber: z.number().positive('Deve ser um número positivo'),

  // Número inteiro positivo
  positiveInteger: z.number().int().positive('Deve ser um número inteiro positivo'),

  // Horário (HH:MM)
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (HH:MM)'),

  // Valor monetário
  currency: z.number().min(0, 'Valor não pode ser negativo'),
};

// Schemas comuns para entidades
export const schemas = {
  // Paciente
  patient: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    phone: validators.phone.optional(),
    email: validators.email.optional(),
    cpf: validators.cpf.optional(),
    birthDate: validators.birthDate.optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
    medicalHistory: z.string().optional(),
  }),

  // Profissional
  professional: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    registrationNumber: z.string().optional(),
    specialty: z.string().optional(),
    phone: validators.phone.optional(),
    email: validators.email.optional(),
    workingHours: z.record(z.object({
      start: validators.time,
      end: validators.time,
      breaks: z.array(z.object({
        start: validators.time,
        end: validators.time,
      })).optional(),
    })).optional(),
  }),

  // Agendamento
  appointment: z.object({
    patientId: z.string().uuid('ID do paciente inválido'),
    professionalId: z.string().uuid('ID do profissional inválido'),
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional(),
    startDatetime: z.string().datetime('Data/hora de início inválida'),
    endDatetime: z.string().datetime('Data/hora de fim inválida'),
    serviceType: z.string().optional(),
    notes: z.string().optional(),
  }).refine((data) => {
    const start = new Date(data.startDatetime);
    const end = new Date(data.endDatetime);
    return end > start;
  }, {
    message: 'Data/hora de fim deve ser posterior ao início',
    path: ['endDatetime'],
  }),

  // Material
  material: z.object({
    categoryId: z.string().uuid('ID da categoria inválido').optional(),
    name: z.string().min(1, 'Nome é obrigatório'),
    brand: z.string().optional(),
    description: z.string().optional(),
    unitType: z.string().min(1, 'Tipo de unidade é obrigatório'),
    minStockLevel: validators.positiveInteger,
    maxStockLevel: validators.positiveInteger,
    unitCost: validators.currency,
    supplierName: z.string().optional(),
    supplierContact: z.string().optional(),
  }).refine((data) => {
    return data.maxStockLevel >= data.minStockLevel;
  }, {
    message: 'Estoque máximo deve ser maior ou igual ao mínimo',
    path: ['maxStockLevel'],
  }),

  // Categoria de material
  materialCategory: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional(),
  }),

  // Entrada/Saída de material
  materialEntry: z.object({
    materialId: z.string().uuid('ID do material inválido'),
    entryType: z.enum(['in', 'out'], {
      errorMap: () => ({ message: 'Tipo deve ser entrada ou saída' }),
    }),
    quantity: validators.positiveInteger,
    unitCost: validators.currency,
    expiryDate: validators.date.optional(),
    batchNumber: z.string().optional(),
    supplierName: z.string().optional(),
    invoiceNumber: z.string().optional(),
    notes: z.string().optional(),
  }),

  // Login
  login: z.object({
    email: validators.email,
    password: z.string().min(1, 'Senha é obrigatória'),
  }),

  // Configurações da clínica
  clinicSettings: z.object({
    name: z.string().min(1, 'Nome da clínica é obrigatório'),
    logoUrl: validators.url.optional(),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor primária inválida'),
    secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor secundária inválida'),
  }),
};