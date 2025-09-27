import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { cn } from '../../../utils/cn';

export interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    breaks?: Array<{ start: string; end: string }>;
  };
}

export interface WorkingHoursConfigProps {
  value?: WorkingHours;
  onChange?: (workingHours: WorkingHours) => void;
  className?: string;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira', short: 'Seg' },
  { key: 'tuesday', label: 'Terça-feira', short: 'Ter' },
  { key: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
  { key: 'thursday', label: 'Quinta-feira', short: 'Qui' },
  { key: 'friday', label: 'Sexta-feira', short: 'Sex' },
  { key: 'saturday', label: 'Sábado', short: 'Sáb' },
  { key: 'sunday', label: 'Domingo', short: 'Dom' },
];

const WorkingHoursConfig: React.FC<WorkingHoursConfigProps> = ({
  value = {},
  onChange,
  className,
  disabled = false
}) => {
  const [workingHours, setWorkingHours] = useState<WorkingHours>(value);

  useEffect(() => {
    setWorkingHours(value);
  }, [value]);

  const handleDayToggle = (dayKey: string) => {
    if (disabled) return;

    const newWorkingHours = { ...workingHours };
    
    if (newWorkingHours[dayKey]) {
      delete newWorkingHours[dayKey];
    } else {
      newWorkingHours[dayKey] = {
        start: '08:00',
        end: '18:00',
        breaks: []
      };
    }
    
    setWorkingHours(newWorkingHours);
    onChange?.(newWorkingHours);
  };

  const handleTimeChange = (dayKey: string, field: 'start' | 'end', value: string) => {
    if (disabled) return;

    const newWorkingHours = {
      ...workingHours,
      [dayKey]: {
        ...workingHours[dayKey],
        [field]: value
      }
    };
    
    setWorkingHours(newWorkingHours);
    onChange?.(newWorkingHours);
  };

  const handleBreakAdd = (dayKey: string) => {
    if (disabled) return;

    const newWorkingHours = {
      ...workingHours,
      [dayKey]: {
        ...workingHours[dayKey],
        breaks: [
          ...(workingHours[dayKey].breaks || []),
          { start: '12:00', end: '13:00' }
        ]
      }
    };
    
    setWorkingHours(newWorkingHours);
    onChange?.(newWorkingHours);
  };

  const handleBreakRemove = (dayKey: string, breakIndex: number) => {
    if (disabled) return;

    const newWorkingHours = {
      ...workingHours,
      [dayKey]: {
        ...workingHours[dayKey],
        breaks: workingHours[dayKey].breaks?.filter((_, index) => index !== breakIndex) || []
      }
    };
    
    setWorkingHours(newWorkingHours);
    onChange?.(newWorkingHours);
  };

  const handleBreakChange = (dayKey: string, breakIndex: number, field: 'start' | 'end', value: string) => {
    if (disabled) return;

    const newWorkingHours = {
      ...workingHours,
      [dayKey]: {
        ...workingHours[dayKey],
        breaks: workingHours[dayKey].breaks?.map((breakItem, index) => 
          index === breakIndex ? { ...breakItem, [field]: value } : breakItem
        ) || []
      }
    };
    
    setWorkingHours(newWorkingHours);
    onChange?.(newWorkingHours);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center space-x-2">
        <Icon name="Clock" size="sm" className="text-neutral-600" />
        <Text variant="label" className="font-medium">
          Horários de Trabalho
        </Text>
      </div>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => {
          const isWorking = !!workingHours[day.key];
          
          return (
            <div key={day.key} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isWorking}
                    onChange={() => handleDayToggle(day.key)}
                    disabled={disabled}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <Text variant="body" className="font-medium">
                    {day.label}
                  </Text>
                </div>
              </div>

              {isWorking && (
                <div className="space-y-3 ml-7">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Text variant="caption" className="text-neutral-600 mb-1">
                        Início
                      </Text>
                      <Input
                        type="time"
                        value={workingHours[day.key]?.start || '08:00'}
                        onChange={(e) => handleTimeChange(day.key, 'start', e.target.value)}
                        disabled={disabled}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <Text variant="caption" className="text-neutral-600 mb-1">
                        Fim
                      </Text>
                      <Input
                        type="time"
                        value={workingHours[day.key]?.end || '18:00'}
                        onChange={(e) => handleTimeChange(day.key, 'end', e.target.value)}
                        disabled={disabled}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Intervalos */}
                  {workingHours[day.key]?.breaks && workingHours[day.key].breaks!.length > 0 && (
                    <div className="space-y-2">
                      <Text variant="caption" className="text-neutral-600 font-medium">
                        Intervalos
                      </Text>
                      {workingHours[day.key].breaks!.map((breakItem, breakIndex) => (
                        <div key={breakIndex} className="flex items-center space-x-2">
                          <div className="flex-1">
                            <Input
                              type="time"
                              value={breakItem.start}
                              onChange={(e) => handleBreakChange(day.key, breakIndex, 'start', e.target.value)}
                              disabled={disabled}
                              placeholder="Início do intervalo"
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              type="time"
                              value={breakItem.end}
                              onChange={(e) => handleBreakChange(day.key, breakIndex, 'end', e.target.value)}
                              disabled={disabled}
                              placeholder="Fim do intervalo"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBreakRemove(day.key, breakIndex)}
                            disabled={disabled}
                            className="p-2 text-error-600 hover:text-error-700"
                            title="Remover intervalo"
                          >
                            <Icon name="Trash2" size="sm" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBreakAdd(day.key)}
                    disabled={disabled}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                  >
                    <Icon name="Plus" size="sm" />
                    <span>Adicionar intervalo</span>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-sm text-neutral-500">
        <Text variant="caption">
          Configure os horários de trabalho para cada dia da semana. 
          Os intervalos são opcionais e podem ser usados para pausas de almoço ou descanso.
        </Text>
      </div>
    </div>
  );
};

export { WorkingHoursConfig };