import React, { useState } from 'react';
import { useProfessionals } from '../../hooks/professionals/useProfessionals';
import { useProfessionalActions } from '../../hooks/professionals/useProfessionalActions';
import { useProfessionalsStore } from '../../stores/useProfessionalsStore';
import { usePermissions } from '../../hooks/usePermissions';
import { ProfessionalList } from '../../components/organisms/ProfessionalList';
import { ProfessionalForm } from '../../components/organisms/ProfessionalForm';
import { PERMISSIONS } from '../../permissions';
import type { Professional } from '../../types';

const ProfessionalsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

  // Hooks
  const {
    professionals,
    loading,
    error,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    stats,
    refetch
  } = useProfessionals();

  const {
    createProfessional,
    editProfessional,
    deactivateProfessional,
    deleteProfessional,
    reactivateProfessional,
    actionLoading,
    actionError
  } = useProfessionalActions();

  const {
    setSearchTerm,
    setCurrentPage,
    selectProfessional
  } = useProfessionalsStore();

  const {
    hasPermission,
    isSuperAdmin
  } = usePermissions();

  // Permissões
  const canCreate = hasPermission(PERMISSIONS.PROFESSIONAL_CREATE);
  const canEdit = hasPermission(PERMISSIONS.PROFESSIONAL_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PROFESSIONAL_DELETE);
  const canDeactivate = hasPermission(PERMISSIONS.PROFESSIONAL_DELETE);

  // Handlers
  const handleCreateNew = () => {
    setEditingProfessional(null);
    setShowForm(true);
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingProfessional) {
      const result = await editProfessional(editingProfessional.id, data);
      if (result) {
        setShowForm(false);
        setEditingProfessional(null);
      }
    } else {
      const result = await createProfessional(data);
      if (result) {
        setShowForm(false);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProfessional(null);
    selectProfessional(null);
  };

  const handleDeactivate = async (professional: Professional) => {
    const success = await deactivateProfessional(professional.id);
    if (success) {
      // Opcional: mostrar toast de sucesso
    }
  };

  const handleReactivate = async (professional: Professional) => {
    const success = await reactivateProfessional(professional.id);
    if (success) {
      // Opcional: mostrar toast de sucesso
    }
  };

  const handleDelete = async (professional: Professional) => {
    const success = await deleteProfessional(professional.id);
    if (success) {
      // Opcional: mostrar toast de sucesso
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset para primeira página ao buscar
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6 space-y-6">
      <ProfessionalList
        professionals={professionals}
        loading={loading}
        error={error || actionError}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onProfessionalEdit={handleEdit}
        onProfessionalDelete={handleDelete}
        onProfessionalDeactivate={handleDeactivate}
        onProfessionalReactivate={handleReactivate}
        onCreateNew={handleCreateNew}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
        canDeactivate={canDeactivate}
        isSuperAdmin={isSuperAdmin}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalItems}
        onPageChange={handlePageChange}
      />

      <ProfessionalForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        professional={editingProfessional}
        loading={actionLoading}
      />
    </div>
  );
};

export { ProfessionalsPage };