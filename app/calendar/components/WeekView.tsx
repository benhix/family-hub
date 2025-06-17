import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday, isSameMonth } from 'date-fns';
import { CalendarEvent } from '../types';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function WeekView({ currentDate, events, onDayClick, onEventClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  // Generate array of 7 days for the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Generate time slots for the week view (6 AM to 11 PM)
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6);

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(event.startDate, date) || 
      (event.startDate <= date && event.endDate >= date)
    );
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}${period}`;
  };

  const getEventPosition = (event: CalendarEvent, dayDate: Date) => {
    if (event.allDay) return { top: 0, height: 30 };
    
    const eventStart = isSameDay(event.startDate, dayDate) ? event.startDate : new Date(dayDate.setHours(6, 0, 0, 0));
    const eventEnd = isSameDay(event.endDate, dayDate) ? event.endDate : new Date(dayDate.setHours(23, 59, 59, 999));
    
    const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
    const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
    
    const top = Math.max(0, (startHour - 6) * 60); // 60px per hour, start from 6 AM
    const height = Math.max(30, (endHour - startHour) * 60);
    
    return { top, height };
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      {/* Week header with dates */}
      <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700">
          Time
        </div>
        {weekDays.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => onDayClick(day)}
            className={`p-3 text-center text-xs font-medium transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
              isToday(day)
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : isSameMonth(day, currentDate)
                ? 'text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700'
                : 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-slate-700'
            }`}
          >
            <div className="font-semibold">{format(day, 'EEE')}</div>
            <div className={`mt-1 ${isToday(day) ? 'font-bold' : ''}`}>
              {format(day, 'd')}
            </div>
          </button>
        ))}
      </div>

      {/* All-day events row */}
      <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 min-h-[40px]">
        <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 flex items-center justify-center">
          All Day
        </div>
        {weekDays.map((day) => {
          const allDayEvents = getEventsForDay(day).filter(event => event.allDay);
          return (
            <div key={`allday-${day.toISOString()}`} className="p-1 min-h-[40px] flex flex-col gap-1">
              {allDayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className="text-xs px-2 py-1 rounded text-white font-medium truncate hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: event.color }}
                  title={event.title}
                >
                  {event.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-8 relative" style={{ height: '1080px' }}>
        {/* Time column */}
        <div className="bg-gray-50 dark:bg-slate-700">
          {timeSlots.map((hour) => (
            <div key={hour} className="h-[60px] border-b border-gray-200 dark:border-gray-600 p-2 text-xs text-gray-500 dark:text-gray-400">
              {formatTime(hour)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day, dayIndex) => {
          const dayEvents = getEventsForDay(day).filter(event => !event.allDay);
          
          return (
            <div key={day.toISOString()} className="relative border-l border-gray-200 dark:border-gray-600">
              {/* Hour lines */}
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                  onClick={() => onDayClick(day)}
                />
              ))}

              {/* Events */}
              {dayEvents.map((event) => {
                const { top, height } = getEventPosition(event, day);
                return (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="absolute left-1 right-1 text-xs px-1 py-1 rounded text-white font-medium overflow-hidden hover:opacity-80 transition-opacity z-10"
                    style={{
                      backgroundColor: event.color,
                      top: `${top}px`,
                      height: `${height}px`,
                      minHeight: '30px'
                    }}
                    title={`${event.title} - ${format(event.startDate, 'h:mm a')} to ${format(event.endDate, 'h:mm a')}`}
                  >
                    <div className="truncate font-semibold">{event.title}</div>
                    {height > 40 && (
                      <div className="truncate text-xs opacity-90">
                        {format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
} 