import React from 'react';
import { UserCheck, Plus } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { EmptyState } from '../../atoms/EmptyState';
import { LoadingState } from '../../atoms/LoadingState';
import { ErrorState } from '../../atoms/ErrorState';
import { ProfessionalCard } from '../ProfessionalCard';
import { SearchBox } from '../../molecules/SearchBox';
import { Pagination } from '../../molecules/Pagination';
import { cn } from '../../../utils/cn';
import type { Professional } from '../../../types';

export interface ProfessionalListProps {
  professionals: Professional[];
  loading?: boolean;
  error?: string | null;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onProfessionalEdit?: (professional: Professional) => void;
  onProfessionalDelete?: (professional: Professional) => void;
  onProfessionalDeactivate?: (professional: Professional) => void;
  onProfessionalReactivate?: (professional: Professional) => void;
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

const ProfessionalList: React.FC<ProfessionalListProps> = ({
  professionals,
  loading = false,
  error = null,
  searchTerm = '',
  onSearchChange,
  onProfessionalEdit,
  onProfessionalDelete,
  onProfessionalDeactivate,
  onProfessionalReactivate,
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
        <LoadingState message="Carregando profissionais..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('bg-white rounded-xl shadow-sm border border-neutral-100', className)}>
        <ErrorState 
          title="Erro ao carregar profissionais"
          message={error}
        />
      </div>
    );
  }

  if (professionals.length === 0 && !searchTerm) {
    return (
      <div className={cn('bg-white rounded-xl shadow-sm border border-neutral-100', className)}>
        <EmptyState
          icon="UserCheck"
          title="Nenhum profissional cadastrado"
          description="Comece cadastrando seu primeiro profissional para gerenciar a equipe da clínica."
          action={canCreate && onCreateNew ? {
            label: 'Cadastrar primeiro profissional',
            onClick: onCreateNew
          } : undefined}
        />
      </div>
    );
  }

  if (professionals.length === 0 && searchTerm) {
    return (
      <div className={cn('bg-white rounded-xl shadow-sm border border-neutral-100 p-8', className)}>
        <div className="text-center">
          <Icon name="UserCheck" size="lg" className="text-neutral-300 mx-auto mb-4" />
          <Text variant="h3" className="text-neutral-600 mb-2">
            Nenhum profissional encontrado
          </Text>
          <Text variant="body" className="text-neutral-500">
            Tente ajustar os termos de busca ou cadastre um novo profissional.
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
              Profissionais
            </Text>
            <Text variant="body" className="text-neutral-600">
              {totalCount > 0 ? (
                `${totalCount} profissional${totalCount !== 1 ? 'is' : ''} cadastrado${totalCount !== 1 ? 's' : ''}`
              ) : (
                'Gerencie a equipe de profissionais da clínica'
              )}
            </Text>
          </div>
          
          {canCreate && (
            <Button
              onClick={onCreateNew}
              className="flex items-center space-x-2"
            >
              <Icon name="Plus" size="sm" />
              <span>Novo Profissional</span>
            </Button>
          )}
        </div>

        {onSearchChange && (
          <div className="mt-6">
            <SearchBox
              placeholder="Buscar profissionais por nome, especialidade ou registro..."
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
            {professionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onEdit={onProfessionalEdit}
                onDelete={onProfessionalDelete}
                onDeactivate={onProfessionalDeactivate}
                onReactivate={onProfessionalReactivate}
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
            {professionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onEdit={onProfessionalEdit}
                onDelete={onProfessionalDelete}
                onDeactivate={onProfessionalDeactivate}
                onReactivate={onProfessionalReactivate}
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

export { ProfessionalList };