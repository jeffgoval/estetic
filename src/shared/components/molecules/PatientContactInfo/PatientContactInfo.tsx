import React from 'react';

import { Icon } from '../../atoms/Icon';
import { cn } from '../../../utils/cn';

export interface PatientContactInfoProps {
  phone?: string;
  email?: string;
  address?: string;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

const PatientContactInfo: React.FC<PatientContactInfoProps> = ({
  phone,
  email,
  address,
  className,
  layout = 'horizontal'
}) => {
  const contactItems = [
    { icon: 'Phone', value: phone, label: 'Telefone' },
    { icon: 'Mail', value: email, label: 'Email' },
    { icon: 'MapPin', value: address, label: 'Endereço' },
  ].filter(item => item.value);

  if (contactItems.length === 0) {
    return null;
  }

  const containerClasses = layout === 'horizontal' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
    : 'space-y-2';

  return (
    <div className={cn(containerClasses, className)}>
      {contactItems.map(({ icon, value, label }) => (
        <div key={label} className="flex items-center space-x-2 text-sm text-neutral-600">
          <Icon name={icon} size="sm" className="text-neutral-400" />
          <span className={cn(
            'truncate',
            label === 'Endereço' && 'max-w-xs'
          )}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};

export { PatientContactInfo };