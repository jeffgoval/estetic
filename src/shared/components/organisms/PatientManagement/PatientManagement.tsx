import React, { useState, useEffect } from 'react';
import { PatientList } from '../PatientList';
import { PatientForm } from '../PatientForm';
import { usePatients } from '../../../hooks/patients/usePatients';
import { usePatientForm } from '../../../hooks/patients/usePatientForm';
import { usePatientActions } from '../../../hooks/patients/usePatientActions';
import { usePermissions } from '../../../hooks/usePermissions';
import { useUIStore } from '../../../stores/useUIStore';
import { PERMISSIONS } from '../../../permissions';
import type { Patient, CreatePatient } from '../../../types';

export interface PatientManagementProps {
  className?: string;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ className }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Hooks
  const {
    patients,
    loading,
    error,
    searchTerm,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    fetchPatients,
    setSearchTerm,
    setCurrentPage,
  } = usePatients();

  const { hasPermission, isSuperAdmin } = usePermissions();
  const { showSuccessToast } = useUIStore();
  const { handleDeactivatePatient, handleDeletePatient } = usePatientActions();

  const { submitPatient, loading: formLoading } = usePatientForm({
    onSuccess: (patient) => {
      setShowForm(false);
      setEditingPatient(null);
      showSuccessToast(
        editingPatient ? 'Paciente atualizado!' : 'Paciente cadastrado!',
        editingPatient 
          ? `${patient.name} foi atualizado com sucesso.`
          : `${patient.name} foi adicionado ao sistema.`
      );
      // Recarregar lista se necessário
      if (currentPage === 1) {
        fetchPatients();
      }
    },
  });

  // Carregar pacientes na inicialização
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    fetchPatients();
  }, [searchTerm, currentPage, fetchPatients]);

  // Handlers
  const handleCreateNew = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CreatePatient) => {
    await submitPatient(data, editingPatient);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset para primeira página ao buscar
  };

  // Verificar permissões
  const canCreate = hasPermission(PERMISSIONS.PATIENT_CREATE);
  const canEdit = hasPermission(PERMISSIONS.PATIENT_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PATIENT_DELETE);
  const canDeactivate = hasPermission(PERMISSIONS.PATIENT_DELETE);

  return (
    <div className={className}>
      {/* Lista de pacientes */}
      <PatientList
        patients={patients}
        loading={loading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onPatientEdit={handleEditPatient}
        onPatientDelete={handleDeletePatient}
        onPatientDeactivate={handleDeactivatePatient}
        onCreateNew={handleCreateNew}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        canDeactivate={canDeactivate}
        isSuperAdmin={isSuperAdmin}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
      />

      {/* Modal do formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PatientForm
            patient={editingPatient}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={formLoading}
          />
        </div>
      )}
    </div>
  );
};

export { PatientManagement };