import React, { useState } from 'react';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { cn } from '../../../utils/cn';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  disabled = false,
  error,
  label,
  required = false,
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <Input
          type="date"
          value={value || ''}
          onChange={handleDateChange}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
          min={minDate}
          max={maxDate}
          className="pr-10"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
        >
          <Icon name="Calendar" size={16} />
        </Button>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};