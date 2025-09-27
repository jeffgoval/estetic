import React from 'react';

import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { cn } from '../../../utils/cn';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'warning';
  disabled?: boolean;
}

export interface DropdownItem {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'warning';
}

export interface DropdownProps {
  options?: DropdownOption[];
  items?: DropdownItem[];
  trigger?: React.ReactNode;
  value?: string;
  placeholder?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  items = [],
  trigger,
  value,
  placeholder = 'Selecione...',
  onSelect,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);


  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onSelect?.(optionValue);
    setIsOpen(false);
  };

  const handleItemClick = (item: DropdownItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full justify-between"
        >
          <span className={cn(!selectedOption && 'text-neutral-500')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <Icon 
            name="ChevronDown" 
            size="sm" 
            className={cn('transition-transform', isOpen && 'rotate-180')} 
          />
        </Button>
      )}

      {isOpen && (
        <div className="absolute z-50 right-0 mt-1 bg-white border border-neutral-300 rounded-md shadow-lg min-w-48 max-h-60 overflow-auto">
          {items.length > 0 ? (
            items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'w-full px-3 py-2 text-left hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none flex items-center space-x-2',
                  item.variant === 'destructive' && 'text-error hover:bg-error/10',
                  item.variant === 'warning' && 'text-warning hover:bg-warning/10'
                )}
              >
                {item.icon && <Icon name={item.icon} size="sm" />}
                <span>{item.label}</span>
              </button>
            ))
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                disabled={option.disabled}
                className={cn(
                  'w-full px-3 py-2 text-left hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none flex items-center space-x-2',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  value === option.value && 'bg-primary/10 text-primary'
                )}
              >
                {option.icon && <Icon name={option.icon} size="sm" />}
                <span>{option.label}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export { Dropdown };