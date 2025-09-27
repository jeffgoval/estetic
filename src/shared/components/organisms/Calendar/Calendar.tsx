import React, { useState, useMemo } from 'react';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';
import { Card } from '../../atoms/Card';
import { AppointmentCard } from '../AppointmentCard';
import { Appointment } from '../../../stores/useAppointmentsStore';
import { cn } from '../../../utils/cn';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  data?: Appointment;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onEventEdit?: (appointment: Appointment) => void;
  onEventDelete?: (appointment: Appointment) => void;
  onEventStatusChange?: (appointment: Appointment, status: Appointment['status']) => void;
  view?: 'month' | 'week' | 'day';
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  showEventDetails?: boolean;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventEdit,
  onEventDelete,
  onEventStatusChange,
  view = 'month',
  currentDate = new Date(),
  onDateChange,
  showEventDetails = false,
  className,
}) => {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    onDateChange?.(newDate);
  };

  const getDaysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleEventDragStart = (event: CalendarEvent) => {
    setDraggedEvent(event);
  };

  const handleDateDrop = (date: Date) => {
    if (draggedEvent && onEventDrop) {
      const duration = draggedEvent.end.getTime() - draggedEvent.start.getTime();
      const newStart = new Date(date);
      newStart.setHours(draggedEvent.start.getHours(), draggedEvent.start.getMinutes());
      const newEnd = new Date(newStart.getTime() + duration);
      
      onEventDrop(draggedEvent, newStart, newEnd);
    }
    setDraggedEvent(null);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <Card className={cn('p-0', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center space-x-4">
          <Text variant="h3" weight="semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDateChange?.(new Date())}
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <Icon name="ChevronRight" size={16} />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center">
              <Text variant="caption" weight="medium" color="muted">
                {day}
              </Text>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            
            return (
              <div
                key={index}
                className={cn(
                  'min-h-[100px] p-2 border border-neutral-100 cursor-pointer transition-colors',
                  'hover:bg-neutral-50',
                  isToday(date) && 'bg-primary/5 border-primary/20',
                  !isCurrentMonth(date) && 'text-neutral-400 bg-neutral-50/50'
                )}
                onClick={() => onDateClick?.(date)}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDateDrop(date);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Text
                  variant="caption"
                  weight={isToday(date) ? 'semibold' : 'normal'}
                  color={isToday(date) ? 'primary' : 'default'}
                >
                  {date.getDate()}
                </Text>
                
                {/* Events */}
                <div className="mt-1 space-y-1">
                  {showEventDetails ? (
                    // Modo detalhado - mostra cards completos
                    dayEvents.slice(0, 2).map(event => (
                      event.data && (
                        <AppointmentCard
                          key={event.id}
                          appointment={event.data}
                          onEdit={onEventEdit}
                          onDelete={onEventDelete}
                          onStatusChange={onEventStatusChange}
                          compact
                          className="mb-1"
                        />
                      )
                    ))
                  ) : (
                    // Modo compacto - mostra apenas títulos
                    dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={cn(
                          'text-xs p-1 rounded cursor-pointer truncate transition-colors',
                          'bg-primary/10 text-primary hover:bg-primary/20',
                          'border border-transparent hover:border-primary/30'
                        )}
                        style={{
                          backgroundColor: event.color ? `${event.color}20` : undefined,
                          color: event.color || undefined,
                        }}
                        draggable
                        onDragStart={() => handleEventDragStart(event)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        title={`${event.title} - ${event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate flex-1">
                            {event.title}
                          </span>
                          <span className="text-xs opacity-75 ml-1">
                            {event.start.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  {dayEvents.length > (showEventDetails ? 2 : 3) && (
                    <Text variant="small" color="muted" className="text-center">
                      +{dayEvents.length - (showEventDetails ? 2 : 3)} mais
                    </Text>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};