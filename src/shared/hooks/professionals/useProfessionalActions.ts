import { useState } from 'react';
import { useProfessionalsStore } from '../../stores/useProfessionalsStore';
import { useApi } from '../useApi';
import type { Professional, CreateProfessional } from '../../types';

/**
 * Hook para ações de profissionais (criar, editar, excluir, desativar)
 */
export const useProfessionalActions = () => {
  const { post, put, del, patch } = useApi();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  const {
    addProfessional,
    updateProfessional,
    removeProfessional,
  } = useProfessionalsStore();

  // Criar novo profissional
  const createProfessional = async (data: CreateProfessional): Promise<Professional | null> => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const response = await post('/api/professionals', data);
      
      if (response.success && response.data) {
        addProfessional(response.data);
        return response.data;
      } else {
        setActionError(response.error || 'Erro ao criar profissional');
        return null;
      }
    } catch (err) {
      console.error('Erro ao criar profissional:', err);
      setActionError('Erro ao criar profissional');
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  // Editar profissional existente
  const editProfessional = async (id: string, data: Partial<CreateProfessional>): Promise<Professional | null> => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const response = await put(`/api/professionals/${id}`, data);
      
      if (response.success && response.data) {
        updateProfessional(id, response.data);
        return response.data;
      } else {
        setActionError(response.error || 'Erro ao editar profissional');
        return null;
      }
    } catch (err) {
      console.error('Erro ao editar profissional:', err);
      setActionError('Erro ao editar profissional');
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  // Desativar profissional (soft delete)
  const deactivateProfessional = async (id: string): Promise<boolean> => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const response = await patch(`/api/professionals/${id}/deactivate`);
      
      if (response.success) {
        updateProfessional(id, { isActive: false });
        return true;
      } else {
        setActionError(response.error || 'Erro ao desativar profissional');
        return false;
      }
    } catch (err) {
      console.error('Erro ao desativar profissional:', err);
      setActionError('Erro ao desativar profissional');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Excluir profissional permanentemente (apenas super admin)
  const deleteProfessional = async (id: string): Promise<boolean> => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const response = await del(`/api/professionals/${id}`);
      
      if (response.success) {
        removeProfessional(id);
        return true;
      } else {
        setActionError(response.error || 'Erro ao excluir profissional');
        return false;
      }
    } catch (err) {
      console.error('Erro ao excluir profissional:', err);
      setActionError('Erro ao excluir profissional');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Reativar profissional
  const reactivateProfessional = async (id: string): Promise<boolean> => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const response = await patch(`/api/professionals/${id}/reactivate`);
      
      if (response.success) {
        updateProfessional(id, { isActive: true });
        return true;
      } else {
        setActionError(response.error || 'Erro ao reativar profissional');
        return false;
      }
    } catch (err) {
      console.error('Erro ao reativar profissional:', err);
      setActionError('Erro ao reativar profissional');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    // Estado
    actionLoading,
    actionError,
    
    // Ações
    createProfessional,
    editProfessional,
    deactivateProfessional,
    deleteProfessional,
    reactivateProfessional,
    
    // Utilitários
    clearError: () => setActionError(null),
  };
};