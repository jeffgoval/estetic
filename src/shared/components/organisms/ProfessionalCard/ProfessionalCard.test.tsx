import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProfessionalCard } from './ProfessionalCard';
import type { Professional } from '../../../types';

const mockProfessional: Professional = {
  id: '1',
  tenantId: '1',
  name: 'Dr. Maria Silva',
  registrationNumber: 'CRM 12345',
  specialty: 'Estética Facial',
  phone: '(11) 99999-9999',
  email: 'maria@exemplo.com',
  isActive: true,
  workingHours: {
    monday: { start: '08:00', end: '18:00' },
    tuesday: { start: '08:00', end: '18:00' },
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('ProfessionalCard', () => {
  it('deve renderizar as informações do profissional', () => {
    render(<ProfessionalCard professional={mockProfessional} />);
    
    expect(screen.getByText('Dr. Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('Estética Facial')).toBeInTheDocument();
    expect(screen.getByText('Registro: CRM 12345')).toBeInTheDocument();
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByText('maria@exemplo.com')).toBeInTheDocument();
  });

  it('deve mostrar badge de inativo quando profissional está inativo', () => {
    const inactiveProfessional = { ...mockProfessional, isActive: false };
    render(<ProfessionalCard professional={inactiveProfessional} />);
    
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('deve renderizar no layout de card quando especificado', () => {
    const { container } = render(
      <ProfessionalCard professional={mockProfessional} layout="card" />
    );
    
    expect(container.firstChild).toHaveClass('bg-white', 'rounded-xl', 'p-6');
  });
});