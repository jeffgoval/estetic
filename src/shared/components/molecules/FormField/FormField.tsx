import React from 'react';
import { Input, InputProps } from '../../atoms/Input';
import { cn } from '../../../utils/cn';

export interface FormFieldProps extends InputProps {
  label: string;
  required?: boolean;
  description?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  required = false, 
  description, 
  className,
  ...inputProps 
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Input
        label={
          <span>
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        }
        {...inputProps}
      />
      {description && (
        <p className="text-sm text-neutral-500">{description}</p>
      )}
    </div>
  );
};

export { FormField };