import { useCallback } from 'react';
import { usePatients } from './usePatients';
import { useUIStore } from '../../stores/useUIStore';
import type { Patient } from '../../types';

export const usePatientActions = () => {
  const { deactivatePatient, deletePatient } = usePatients();
  const { showSuccessToast, showErrorToast } = useUIStore();

  const handleDeactivatePatient = useCallback(async (patient: Patient) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja desativar o paciente "${patient.name}"?\n\nO paciente será mantido no histórico mas não aparecerá na lista principal.`
    );

    if (!confirmed) return;

    try {
      await deactivatePatient(patient.id);
      showSuccessToast(
        'Paciente desativado',
        `${patient.name} foi desativado com sucesso.`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao desativar paciente';
      showErrorToast('Erro ao desativar paciente', errorMessage);
    }
  }, [deactivatePatient, showSuccessToast, showErrorToast]);

  const handleDeletePatient = useCallback(async (patient: Patient) => {
    const confirmed = window.confirm(
      `ATENÇÃO: Esta ação irá excluir permanentemente o paciente "${patient.name}" e não pode ser desfeita.\n\nTodos os dados relacionados (consultas, histórico, etc.) também serão perdidos.\n\nTem certeza que deseja continuar?`
    );

    if (!confirmed) return;

    // Segunda confirmação para ações críticas
    const doubleConfirmed = window.confirm(
      'Esta é uma ação irreversível. Digite "CONFIRMAR" para prosseguir:'
    );

    if (!doubleConfirmed) return;

    try {
      await deletePatient(patient.id);
      showSuccessToast(
        'Paciente excluído',
        `${patient.name} foi excluído permanentemente.`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir paciente';
      showErrorToast('Erro ao excluir paciente', errorMessage);
    }
  }, [deletePatient, showSuccessToast, showErrorToast]);

  return {
    handleDeactivatePatient,
    handleDeletePatient,
  };
};