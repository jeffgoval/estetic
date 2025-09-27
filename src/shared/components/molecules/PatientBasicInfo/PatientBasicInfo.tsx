import React from 'react';

import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { cn } from '../../../utils/cn';
import { formatters } from '../../../utils/formatters';

export interface PatientBasicInfoProps {
  name: string;
  birthDate?: string;
  cpf?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  className?: string;
  showMedicalHistory?: boolean;
}

const PatientBasicInfo: React.FC<PatientBasicInfoProps> = ({
  name,
  birthDate,
  cpf,
  emergencyContact,
  medicalHistory,
  className,
  showMedicalHistory = true
}) => {
  const age = birthDate ? formatters.calculateAge(birthDate) : null;

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Text variant="h3" className="text-neutral-900 font-semibold">
          {name}
        </Text>
        <div className="flex items-center space-x-4 mt-1">
          {birthDate && (
            <div className="flex items-center space-x-1 text-sm text-neutral-500">
              <Icon name="Calendar" size="sm" />
              <span>
                {formatters.formatDate(birthDate)}
                {age && ` (${age} anos)`}
              </span>
            </div>
          )}
          {cpf && (
            <Text variant="small" className="text-neutral-500">
              CPF: {formatters.formatCPF(cpf)}
            </Text>
          )}
        </div>
      </div>

      {emergencyContact && (
        <div>
          <Text variant="small" className="font-medium text-neutral-700">
            Contato de emergência:
          </Text>
          <Text variant="small" className="text-neutral-600">
            {emergencyContact}
          </Text>
        </div>
      )}

      {showMedicalHistory && medicalHistory && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="FileText" size="sm" className="text-neutral-400" />
            <Text variant="small" className="font-medium text-neutral-700">
              Histórico médico:
            </Text>
          </div>
          <Text variant="small" className="text-neutral-600 line-clamp-3">
            {medicalHistory}
          </Text>
        </div>
      )}
    </div>
  );
};

export { PatientBasicInfo };