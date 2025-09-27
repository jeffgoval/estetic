import React from 'react';

import { Card } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { PatientAvatar } from '../../atoms/PatientAvatar';
import { PatientBasicInfo } from '../../molecules/PatientBasicInfo';
import { PatientContactInfo } from '../../molecules/PatientContactInfo';
import { Dropdown } from '../../molecules/Dropdown';
import { cn } from '../../../utils/cn';
import type { Patient } from '../../../types';

export interface PatientCardProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  onDeactivate?: (patient: Patient) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canDeactivate?: boolean;
  isSuperAdmin?: boolean;
  className?: string;
  layout?: 'card' | 'list';
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onEdit,
  onDelete,
  onDeactivate,
  canEdit = false,
  canDelete = false,
  canDeactivate = false,
  isSuperAdmin = false,
  className,
  layout = 'card'
}) => {
  const handleEdit = () => onEdit?.(patient);
  const handleDelete = () => onDelete?.(patient);
  const handleDeactivate = () => onDeactivate?.(patient);

  const actions = [
    ...(canEdit ? [{
      label: 'Editar',
      icon: 'Edit',
      onClick: handleEdit,
      variant: 'default' as const
    }] : []),
    ...(canDeactivate && !isSuperAdmin ? [{
      label: 'Desativar',
      icon: 'X',
      onClick: handleDeactivate,
      variant: 'warning' as const
    }] : []),
    ...(canDelete && isSuperAdmin ? [{
      label: 'Excluir permanentemente',
      icon: 'Trash2',
      onClick: handleDelete,
      variant: 'destructive' as const
    }] : [])
  ];

  if (layout === 'list') {
    return (
      <div className={cn(
        'p-6 hover:bg-neutral-50 transition-colors border-b border-neutral-200 last:border-b-0',
        className
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <PatientAvatar name={patient.name} size="md" />
            
            <div className="flex-1 space-y-3">
              <PatientBasicInfo
                name={patient.name}
                birthDate={patient.birth_date}
                cpf={patient.cpf}
                emergencyContact={patient.emergency_contact}
                medicalHistory={patient.medical_history}
                showMedicalHistory={true}
              />
              
              <PatientContactInfo
                phone={patient.phone}
                email={patient.email}
                address={patient.address}
                layout="horizontal"
              />
            </div>
          </div>

          {actions.length > 0 && (
            <div className="flex items-center space-x-2 ml-4">
              {actions.length === 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={actions[0].onClick}
                  className="p-2"
                >
                  <Icon name={actions[0].icon} size="sm" />
                </Button>
              ) : (
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm" className="p-2">
                      <Icon name="MoreVertical" size="sm" />
                    </Button>
                  }
                  items={actions.map(action => ({
                    label: action.label,
                    icon: action.icon,
                    onClick: action.onClick,
                    variant: action.variant
                  }))}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('p-6 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <PatientAvatar name={patient.name} size="lg" />
          
          <div className="flex-1 space-y-4">
            <PatientBasicInfo
              name={patient.name}
              birthDate={patient.birth_date}
              cpf={patient.cpf}
              emergencyContact={patient.emergency_contact}
              medicalHistory={patient.medical_history}
              showMedicalHistory={true}
            />
            
            <PatientContactInfo
              phone={patient.phone}
              email={patient.email}
              address={patient.address}
              layout="vertical"
            />
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex flex-col space-y-2 ml-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant === 'destructive' ? 'destructive' : 
                        action.variant === 'warning' ? 'outline' : 'ghost'}
                size="sm"
                onClick={action.onClick}
                className="p-2"
                title={action.label}
              >
                <Icon name={action.icon} size="sm" />
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export { PatientCard };