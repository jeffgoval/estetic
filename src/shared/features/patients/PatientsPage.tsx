import React from 'react';
import { PatientManagement } from '../../components/organisms/PatientManagement';

/**
 * Página principal de gestão de pacientes
 * 
 * Esta página utiliza o componente PatientManagement que integra:
 * - PatientList: Lista de pacientes com busca e paginação
 * - PatientForm: Formulário para criar/editar pacientes
 * - PatientCard: Cartão individual de paciente
 * - Hooks customizados para gerenciar estado e operações
 * - Controle de permissões baseado em roles
 */
const PatientsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <PatientManagement />
    </div>
  );
};

export { PatientsPage };