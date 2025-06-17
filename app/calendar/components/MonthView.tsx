import { format, isToday, isSameMonth } from 'date-fns';
import { CalendarDay, CalendarEvent } from '../types';
import { generateCalendarGrid } from '../utils/calendarUtils';
import { useState } from 'react';
import DynamicUserName from '../../components/DynamicUserName';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

interface DayEventsPopoverProps {
  day: CalendarDay;
  isVisible: boolean;
  onClose: () => void;
  onEventClick: (event: CalendarEvent) => void;
  position: { x: number; y: number };
}

function DayEventsPopover({ day, isVisible, onClose, onEventClick, position }: DayEventsPopoverProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 max-w-xs"
      style={{ 
        left: `${Math.min(position.x, window.innerWidth - 300)}px`, 
        top: `${Math.min(position.y, window.innerHeight - 400)}px` 
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          {format(day.date, 'MMM d, yyyy')}
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {day.events.map((event) => (
          <button
            key={event.id}
            onClick={() => {
              onEventClick(event);
              onClose();
            }}
            className="w-full text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex-1 min-w-0">
                {/* <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {event.title}
                </div> */}
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span>{event.allDay ? 'All day' : `${format(event.startDate, 'h:mm a')} - ${format(event.endDate, 'h:mm a')}`}</span>
                  <span>•</span>
                  {event.useCustomCreator && event.customCreatorName ? (
                    <span>{event.customCreatorName}</span>
                  ) : (
                    <DynamicUserName 
                      userId={event.addedByUserId}
                      fallbackName={event.addedBy}
                    />
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MonthView({ currentDate, events, onDayClick, onEventClick }: MonthViewProps) {
  const [popoverDay, setPopoverDay] = useState<CalendarDay | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const calendarGrid = generateCalendarGrid(currentDate, events);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event);
  };

  const handleDayEventClick = (day: CalendarDay, e: React.MouseEvent) => {
    if (day.events.length === 1) {
      // Single event - click directly
      onEventClick(day.events[0]);
    } else if (day.events.length > 1) {
      // Multiple events - show popover
      e.stopPropagation();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setPopoverPosition({ x: rect.left, y: rect.bottom + 5 });
      setPopoverDay(day);
    }
  };

  const renderEventItem = (event: CalendarEvent, index: number, totalVisible: number) => {
    // Determine which name to display: custom creator name if available, otherwise use DynamicUserName
    const displayName = event.useCustomCreator && event.customCreatorName 
      ? event.customCreatorName 
      : null;

    return (
      <button
        key={event.id}
        onClick={(e) => handleEventClick(event, e)}
        className="w-full text-left px-1 py-0.5 rounded text-xs hover:opacity-80 transition-opacity"
        style={{ backgroundColor: event.color, color: 'white' }}
        title={`${displayName || event.addedBy}${event.allDay ? ' (All day)' : ` (${format(event.startDate, 'h:mm a')} - ${format(event.endDate, 'h:mm a')})`}`}      /* AI version was Event title - displayName or addedBy. Code is" */
      >
        {/* AI version was Event title - displayName or addedBy. Code is:
        title={`${event.title} - ${displayName || event.addedBy}${event.allDay ? ' (All day)' : ` (${format(event.startDate, 'h:mm a')})`}`}
         
        Removed for more space for the name.
         */}

        {/* <div className="truncate font-medium leading-tight">{event.title}</div> */}
        <div className="truncate text-xs opacity-90 leading-tight">
          {displayName || (
            <DynamicUserName 
              userId={event.addedByUserId}
              fallbackName={event.addedBy}
            />
          )}
        </div>
      </button>
    );
  };

  const renderDay = (day: CalendarDay) => {
    const maxVisibleEvents = 3;
    const visibleEvents = day.events.slice(0, maxVisibleEvents);
    const hiddenEventsCount = day.events.length - maxVisibleEvents;
    
    return (
      <div
        key={day.date.toISOString()}
        className={`
          relative p-1 h-28 flex flex-col transition-colors border-b border-r border-gray-100 dark:border-gray-700
          ${day.isCurrentMonth 
            ? 'bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
            : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-gray-600'
          }
          ${day.isToday 
            ? 'bg-blue-100 dark:bg-blue-900/30' 
            : ''
          }
        `}
      >
        {/* Day number */}
        <button
          onClick={() => onDayClick(day.date)}
          className={`
            w-6 h-6 flex items-center justify-center text-sm rounded-full transition-colors
            ${day.isToday 
              ? 'bg-blue-600 text-white font-bold' 
              : day.isCurrentMonth
              ? 'text-gray-900 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-900/50'
              : 'text-gray-400 dark:text-gray-600'
            }
          `}
        >
          {format(day.date, 'd')}
        </button>
        
        {/* Events */}
        <div className="flex-1 mt-1 space-y-0.5 overflow-hidden">
          {visibleEvents.map((event, index) => renderEventItem(event, index, visibleEvents.length))}
          
          {hiddenEventsCount > 0 && (
            <button
              onClick={(e) => handleDayEventClick(day, e)}
              className="w-full text-left px-1 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              +{hiddenEventsCount} more
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarGrid.map(renderDay)}
        </div>
      </div>

      {/* Day events popover */}
      <DayEventsPopover
        day={popoverDay!}
        isVisible={!!popoverDay}
        onClose={() => setPopoverDay(null)}
        onEventClick={onEventClick}
        position={popoverPosition}
      />

      {/* Background overlay to close popover */}
      {popoverDay && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setPopoverDay(null)}
        />
      )}
    </>
  );
} 