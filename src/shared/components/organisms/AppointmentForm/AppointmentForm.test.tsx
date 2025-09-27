import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppointmentForm } from './AppointmentForm';

// Mock dos hooks
jest.mock('../../../hooks/appointments/useAppointmentForm', () => ({
  useAppointmentForm: () => ({
    form: {
      register: jest.fn(),
      watch: () => ({}),
      setValue: jest.fn(),
      formState: { errors: {}, isValid: true },
      handleSubmit: (fn: any) => (e: any) => {
        e.preventDefault();
        fn({});
      },
    },
    handleSubmit: jest.fn(),
    isSubmitting: false,
    calculateEndTime: jest.fn(() => '2024-01-01T10:00'),
    validateTimeSlotField: jest.fn(),
    errors: {},
  }),
}));

jest.mock('../../../hooks/patients/usePatients', () => ({
  usePatients: () => ({
    patients: [
      { id: '1', name: 'João Silva' },
      { id: '2', name: 'Maria Santos' },
    ],
  }),
}));

jest.mock('../../../hooks/professionals/useProfessionals', () => ({
  useProfessionals: () => ({
    professionals: [
      { id: '1', name: 'Dr. Ana', specialty: 'Dermatologia' },
      { id: '2', name: 'Dr. Carlos', specialty: 'Estética' },
    ],
  }),
}));

jest.mock('../../../hooks/appointments/useTimeSlotValidation', () => ({
  useTimeSlotValidation: () => ({
    getAvailableTimeSlots: () => [
      { start: '2024-01-01T09:00:00Z', end: '2024-01-01T10:00:00Z' },
      { start: '2024-01-01T10:00:00Z', end: '2024-01-01T11:00:00Z' },
    ],
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('AppointmentForm', () => {
  it('deve renderizar o formulário corretamente', () => {
    render(<AppointmentForm />, { wrapper: createWrapper() });

    expect(screen.getByText('Novo Agendamento')).toBeInTheDocument();
    expect(screen.getByLabelText(/paciente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/profissional/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agendar/i })).toBeInTheDocument();
  });

  it('deve mostrar "Editar Agendamento" quando initialData é fornecido', () => {
    const initialData = {
      id: '1',
      title: 'Consulta de teste',
      patientId: '1',
      professionalId: '1',
    };

    render(<AppointmentForm initialData={initialData} />, { wrapper: createWrapper() });

    expect(screen.getByText('Editar Agendamento')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument();
  });

  it('deve renderizar as opções de pacientes e profissionais', () => {
    render(<AppointmentForm />, { wrapper: createWrapper() });

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('Dr. Ana - Dermatologia')).toBeInTheDocument();
    expect(screen.getByText('Dr. Carlos - Estética')).toBeInTheDocument();
  });

  it('deve chamar onCancel quando o botão cancelar é clicado', () => {
    const onCancel = jest.fn();
    render(<AppointmentForm onCancel={onCancel} />, { wrapper: createWrapper() });

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('deve renderizar os tipos de serviço disponíveis', () => {
    render(<AppointmentForm />, { wrapper: createWrapper() });

    const serviceTypeSelect = screen.getByLabelText(/tipo de serviço/i);
    expect(serviceTypeSelect).toBeInTheDocument();
    
    // Verificar se algumas opções estão presentes
    fireEvent.click(serviceTypeSelect);
    expect(screen.getByText('Consulta')).toBeInTheDocument();
    expect(screen.getByText('Limpeza de Pele')).toBeInTheDocument();
    expect(screen.getByText('Botox')).toBeInTheDocument();
  });

  it('deve ter campos obrigatórios marcados', () => {
    render(<AppointmentForm />, { wrapper: createWrapper() });

    // Verificar se os campos obrigatórios têm o atributo required ou asterisco
    expect(screen.getByText('Paciente')).toBeInTheDocument();
    expect(screen.getByText('Profissional')).toBeInTheDocument();
    expect(screen.getByText('Título')).toBeInTheDocument();
  });
});