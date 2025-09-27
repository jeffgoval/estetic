import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { EmptyState } from '../../atoms/EmptyState';
import { LoadingState } from '../../atoms/LoadingState';
import { ErrorState } from '../../atoms/ErrorState';
import { PatientCard } from '../PatientCard';
import { SearchBox } from '../../molecules/SearchBox';
import { Pagination } from '../../molecules/Pagination';
import { cn } from '../../../utils/cn';
import type { Patient } from '../../../types';

export interface PatientListProps {
  patients: Patient[];
  loading?: boolean;
  error?: string | null;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onPatientEdit?: (patient: Patient) => void;
  onPatientDelete?: (patient: Patient) => void;
  onPatientDeactivate?: (patient: Patient) => void;
  onCreateNew?: () => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canDeactivate?: boolean;
  isSuperAdmin?: boolean;
  layout?: 'card' | 'list';
  className?: string;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  loading = false,
  error = null,
  searchTerm = '',
  onSearchChange,
  onPatientEdit,
  onPatientDelete,
  onPatientDeactivate,
  onCreateNew,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canDeactivate = false,
  isSuperAdmin = false,
  layout = 'list',
  className,
  currentPage = 1,
  totalPages = 1,
  pageSize = 20,
  totalCount = 0,
  onPageChange
}) => {
  if (loading) {
    return (
      <div className={cn('bg-white rounded-xl shadow-sm border border-neutral-100', className)}>
        <LoadingState message="Carregando pacientes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('bg-white rounded-xl shadow-sm border border-neutral-100', className)}>
        <ErrorState 
          title="Erro ao carregar pacientes"
          message={error}
        />
      </div>
    );
  }

  if (patients.length === 0 && !searchTerm) {
    return (
      <div className={cn('bg-white rounded-xl shadow-sm border border-neutral-100', className)}>
        <EmptyState
          icon="Users"
          title="Nenhum paciente cadastrado"
          description="Comece cadastrando seu primeiro paciente para gerenciar consultas e tratamentos."
          action={canCreate && onCreateNew ? {
            label: 'Cadastrar primeiro paciente',
            onClick: onCreateNew
          } : undefined}
        />
      </div>
    );
  }

  if (patients.length === 0 && searchTerm) {
    return (
      <div className={cn('bg-white rounded-xl shadow-sm border border-neutral-100 p-8', className)}>
        <div className="text-center">
          <Icon name="Users" size="lg" className="text-neutral-300 mx-auto mb-4" />
          <Text variant="h3" className="text-neutral-600 mb-2">
            Nenhum paciente encontrado
          </Text>
          <Text variant="body" className="text-neutral-500">
            Tente ajustar os termos de busca ou cadastre um novo paciente.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <Text variant="h2" className="text-neutral-900">
              Pacientes
            </Text>
            <Text variant="body" className="text-neutral-600">
              {totalCount > 0 ? (
                `${totalCount} paciente${totalCount !== 1 ? 's' : ''} cadastrado${totalCount !== 1 ? 's' : ''}`
              ) : (
                'Gerencie o cadastro dos seus pacientes'
              )}
            </Text>
          </div>
          
          {canCreate && (
            <Button
              onClick={onCreateNew}
              className="flex items-center space-x-2"
            >
              <Icon name="Plus" size="sm" />
              <span>Novo Paciente</span>
            </Button>
          )}
        </div>

        {onSearchChange && (
          <div className="mt-6">
            <SearchBox
              placeholder="Buscar pacientes por nome, telefone ou email..."
              value={searchTerm}
              onSearch={onSearchChange}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-100">
        {layout === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onEdit={onPatientEdit}
                onDelete={onPatientDelete}
                onDeactivate={onPatientDeactivate}
                canEdit={canEdit}
                canDelete={canDelete}
                canDeactivate={canDeactivate}
                isSuperAdmin={isSuperAdmin}
                layout="card"
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onEdit={onPatientEdit}
                onDelete={onPatientDelete}
                onDeactivate={onPatientDeactivate}
                canEdit={canEdit}
                canDelete={canDelete}
                canDeactivate={canDeactivate}
                isSuperAdmin={isSuperAdmin}
                layout="list"
              />
            ))}
          </div>
        )}

        {totalPages > 1 && onPageChange && (
          <div className="border-t border-neutral-200 p-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export { PatientList };