import { format, isSameDay, isToday } from 'date-fns';
import { CalendarEvent } from '../types';
import { isEventPast } from '../utils/calendarUtils';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function DayView({ currentDate, events, onDayClick, onEventClick }: DayViewProps) {
  // Generate time slots for the day view (6 AM to 11 PM)
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6);

  const dayEvents = events.filter(event => 
    isSameDay(event.startDate, currentDate) || 
    (event.startDate <= currentDate && event.endDate >= currentDate)
  );

  const allDayEvents = dayEvents.filter(event => event.allDay);
  const timedEvents = dayEvents.filter(event => !event.allDay);

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getEventPosition = (event: CalendarEvent) => {
    const eventStart = isSameDay(event.startDate, currentDate) 
      ? event.startDate 
      : new Date(currentDate.setHours(6, 0, 0, 0));
    const eventEnd = isSameDay(event.endDate, currentDate) 
      ? event.endDate 
      : new Date(currentDate.setHours(23, 59, 59, 999));
    
    const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
    const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
    
    const top = Math.max(0, (startHour - 6) * 80); // 80px per hour, start from 6 AM
    const height = Math.max(40, (endHour - startHour) * 80);
    
    return { top, height };
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      {/* Day header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          {isToday(currentDate) && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Today</p>
          )}
        </div>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">All Day</h3>
          <div className="space-y-2">
            {allDayEvents.map((event) => {
              const isPast = isEventPast(event);
              
              return (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-white font-medium transition-opacity
                    ${isPast ? 'opacity-50 hover:opacity-60' : 'hover:opacity-80'}
                  `}
                  style={{ backgroundColor: event.color }}
                >
                  <div className="font-semibold flex items-center gap-2">
                    {event.title}
                    {isPast && (
                      <span className="text-xs opacity-90 bg-black/20 px-1.5 py-0.5 rounded">
                        Past
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <div className="text-xs opacity-90 mt-1 truncate">{event.description}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="relative" style={{ height: '1440px' }}>
        {/* Time column with events */}
        <div className="grid grid-cols-12 h-full">
          {/* Time labels column (3 cols) */}
          <div className="col-span-3 bg-gray-50 dark:bg-slate-700 border-r border-gray-200 dark:border-gray-600">
            {timeSlots.map((hour) => (
              <div key={hour} className="h-[80px] border-b border-gray-200 dark:border-gray-600 p-3 text-sm text-gray-500 dark:text-gray-400 flex items-start">
                {formatTime(hour)}
              </div>
            ))}
          </div>

          {/* Events column (9 cols) */}
          <div className="col-span-9 relative">
            {/* Hour lines */}
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="h-[80px] border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                onClick={() => onDayClick(currentDate)}
              />
            ))}

            {/* Timed events */}
            {timedEvents.map((event) => {
              const { top, height } = getEventPosition(event);
              return (
                <button
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className="absolute left-2 right-2 text-sm px-3 py-2 rounded-lg text-white font-medium overflow-hidden hover:opacity-80 transition-opacity z-10 shadow-sm"
                  style={{
                    backgroundColor: event.color,
                    top: `${top}px`,
                    height: `${height}px`,
                    minHeight: '40px'
                  }}
                  title={`${event.title} - ${format(event.startDate, 'h:mm a')} to ${format(event.endDate, 'h:mm a')}`}
                >
                  <div className="font-semibold truncate">{event.title}</div>
                  <div className="text-xs opacity-90 truncate">
                    {format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')}
                  </div>
                  {height > 60 && event.location && (
                    <div className="text-xs opacity-75 truncate mt-1">
                      📍 {event.location}
                    </div>
                  )}
                  {height > 80 && event.description && (
                    <div className="text-xs opacity-75 truncate mt-1">
                      {event.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 