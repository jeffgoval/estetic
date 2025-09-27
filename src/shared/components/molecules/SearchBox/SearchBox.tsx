import React from 'react';
import { Search } from 'lucide-react';
import { Input, InputProps } from '../../atoms/Input';
import { Icon } from '../../atoms/Icon';
import { cn } from '../../../utils/cn';

export interface SearchBoxProps extends Omit<InputProps, 'type'> {
  onSearch?: (value: string) => void;
  debounceMs?: number;
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  onSearch, 
  debounceMs = 300, 
  className,
  ...inputProps 
}) => {
  const [searchValue, setSearchValue] = React.useState('');
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (onSearch) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        onSearch(searchValue);
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchValue, onSearch, debounceMs]);

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon name="Search" size="sm" className="text-neutral-400" />
      </div>
      <Input
        type="text"
        placeholder="Buscar..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-10"
        {...inputProps}
      />
    </div>
  );
};

export { SearchBox };