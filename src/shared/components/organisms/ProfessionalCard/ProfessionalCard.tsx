import React from 'react';
import { Award, Phone, Mail, Clock, Edit, Trash2, X, UserCheck } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { Badge } from '../../atoms/Badge';
import { cn } from '../../../utils/cn';
import type { Professional } from '../../../types';

export interface ProfessionalCardProps {
  professional: Professional;
  onEdit?: (professional: Professional) => void;
  onDelete?: (professional: Professional) => void;
  onDeactivate?: (professional: Professional) => void;
  onReactivate?: (professional: Professional) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canDeactivate?: boolean;
  isSuperAdmin?: boolean;
  layout?: 'card' | 'list';
  className?: string;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onEdit,
  onDelete,
  onDeactivate,
  onReactivate,
  canEdit = false,
  canDelete = false,
  canDeactivate = false,
  isSuperAdmin = false,
  layout = 'list',
  className
}) => {
  const handleEdit = () => {
    if (onEdit) onEdit(professional);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('ATENÇÃO: Esta ação irá excluir permanentemente o profissional e não pode ser desfeita. Tem certeza?')) {
      onDelete(professional);
    }
  };

  const handleDeactivate = () => {
    if (onDeactivate && window.confirm('Tem certeza que deseja desativar este profissional?')) {
      onDeactivate(professional);
    }
  };

  const handleReactivate = () => {
    if (onReactivate && window.confirm('Tem certeza que deseja reativar este profissional?')) {
      onReactivate(professional);
    }
  };

  // Formatação dos horários de trabalho
  const formatWorkingHours = (workingHours?: Record<string, { start: string; end: string; breaks?: Array<{ start: string; end: string }> }>) => {
    if (!workingHours || Object.keys(workingHours).length === 0) {
      return 'Horários não definidos';
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = {
      monday: 'Seg',
      tuesday: 'Ter',
      wednesday: 'Qua',
      thursday: 'Qui',
      friday: 'Sex',
      saturday: 'Sáb',
      sunday: 'Dom'
    };

    const workingDays = days
      .filter(day => workingHours[day])
      .map(day => `${dayNames[day as keyof typeof dayNames]}: ${workingHours[day].start}-${workingHours[day].end}`)
      .join(', ');

    return workingDays || 'Horários não definidos';
  };

  if (layout === 'card') {
    return (
      <div className={cn(
        'bg-white rounded-xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow',
        !professional.isActive && 'opacity-60',
        className
      )}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {professional.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex items-center space-x-1">
            {!professional.isActive && (
              <Badge variant="secondary" size="sm">
                Inativo
              </Badge>
            )}
            
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="p-2 text-neutral-600 hover:text-primary-600"
                title="Editar profissional"
              >
                <Icon name="Edit" size="sm" />
              </Button>
            )}
            
            {!professional.isActive && onReactivate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReactivate}
                className="p-2 text-neutral-600 hover:text-success-600"
                title="Reativar profissional"
              >
                <Icon name="UserCheck" size="sm" />
              </Button>
            )}
            
            {professional.isActive && canDeactivate && !isSuperAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeactivate}
                className="p-2 text-neutral-600 hover:text-warning-600"
                title="Desativar profissional"
              >
                <Icon name="X" size="sm" />
              </Button>
            )}
            
            {canDelete && isSuperAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="p-2 text-neutral-600 hover:text-error-600"
                title="Excluir permanentemente"
              >
                <Icon name="Trash2" size="sm" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Text variant="h4" className="text-neutral-900 font-semibold">
              {professional.name}
            </Text>
            {professional.specialty && (
              <Text variant="body" className="text-neutral-600">
                {professional.specialty}
              </Text>
            )}
          </div>

          <div className="space-y-2">
            {professional.registrationNumber && (
              <div className="flex items-center space-x-2 text-sm text-neutral-600">
                <Icon name="Award" size="sm" />
                <span>Registro: {professional.registrationNumber}</span>
              </div>
            )}
            
            {professional.phone && (
              <div className="flex items-center space-x-2 text-sm text-neutral-600">
                <Icon name="Phone" size="sm" />
                <span>{professional.phone}</span>
              </div>
            )}
            
            {professional.email && (
              <div className="flex items-center space-x-2 text-sm text-neutral-600">
                <Icon name="Mail" size="sm" />
                <span>{professional.email}</span>
              </div>
            )}
          </div>

          <div className="flex items-start space-x-2 text-sm text-neutral-600">
            <Icon name="Clock" size="sm" className="mt-0.5" />
            <span className="flex-1">{formatWorkingHours(professional.workingHours)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'p-6 hover:bg-neutral-50 transition-colors',
      !professional.isActive && 'opacity-60',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {professional.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <div>
                  <Text variant="h4" className="text-neutral-900 font-semibold">
                    {professional.name}
                  </Text>
                  {professional.specialty && (
                    <Text variant="body" className="text-neutral-600">
                      {professional.specialty}
                    </Text>
                  )}
                </div>
                
                {!professional.isActive && (
                  <Badge variant="secondary" size="sm">
                    Inativo
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {professional.registrationNumber && (
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <Icon name="Award" size="sm" />
                    <span>Registro: {professional.registrationNumber}</span>
                  </div>
                )}
                
                {professional.phone && (
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <Icon name="Phone" size="sm" />
                    <span>{professional.phone}</span>
                  </div>
                )}
                
                {professional.email && (
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <Icon name="Mail" size="sm" />
                    <span>{professional.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2 text-sm text-neutral-600 mt-2">
                <Icon name="Clock" size="sm" className="mt-0.5" />
                <span>{formatWorkingHours(professional.workingHours)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="p-2 text-neutral-600 hover:text-primary-600"
              title="Editar profissional"
            >
              <Icon name="Edit" size="sm" />
            </Button>
          )}
          
          {!professional.isActive && onReactivate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReactivate}
              className="p-2 text-neutral-600 hover:text-success-600"
              title="Reativar profissional"
            >
              <Icon name="UserCheck" size="sm" />
            </Button>
          )}
          
          {professional.isActive && canDeactivate && !isSuperAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeactivate}
              className="p-2 text-neutral-600 hover:text-warning-600"
              title="Desativar profissional"
            >
              <Icon name="X" size="sm" />
            </Button>
          )}
          
          {canDelete && isSuperAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="p-2 text-neutral-600 hover:text-error-600"
              title="Excluir permanentemente"
            >
              <Icon name="Trash2" size="sm" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export { ProfessionalCard };