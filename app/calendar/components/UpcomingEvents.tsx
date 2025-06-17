import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { CalendarEvent, EVENT_CATEGORIES } from '../types';
import { getEventCreatorDisplayName } from '../utils/calendarUtils';
import { isEventPast } from '../utils/calendarUtils';
import { Calendar, MapPin, Clock, User } from 'lucide-react';

interface UpcomingEventsProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTitleClick?: () => void;
}

export default function UpcomingEvents({ events, onEventClick, onTitleClick }: UpcomingEventsProps) {
  // Get upcoming events (next 7 days) and recent past events (last 3 days)
  const now = new Date();
  const sevenDaysFromNow = addDays(now, 7);
  const threeDaysAgo = addDays(now, -3);
  
  const recentEvents = events
    .filter(event => event.startDate >= threeDaysAgo && event.startDate <= sevenDaysFromNow)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 8); // Show max 8 events (past + upcoming)

  if (recentEvents.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
          <button
            onClick={onTitleClick}
            className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            disabled={!onTitleClick}
          >
            Recent Events
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
          No recent events
        </p>
      </div>
    );
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEE, MMM d');
    }
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) {
      return 'All day';
    }
    const startTime = format(event.startDate, 'h:mm a');
    const endTime = format(event.endDate, 'h:mm a');
    
    // If same day, show start - end time
    if (format(event.startDate, 'yyyy-MM-dd') === format(event.endDate, 'yyyy-MM-dd')) {
      return `${startTime} - ${endTime}`;
    } else {
      // Multi-day event, show full date and time range
      return `${format(event.startDate, 'MMM d, h:mm a')} - ${format(event.endDate, 'MMM d, h:mm a')}`;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
        <button
          onClick={onTitleClick}
          className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          disabled={!onTitleClick}
        >
          Upcoming Events
        </button>
      </div>
      
      <div className="space-y-2">
        {recentEvents.map((event) => {
          const isPast = isEventPast(event);
          
          return (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`
                w-full text-left p-2 rounded-lg transition-colors group
                ${isPast 
                  ? 'opacity-60 hover:bg-gray-50/50 dark:hover:bg-slate-700/50' 
                  : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Event color indicator */}
                <div 
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                />
                
                <div className="flex-1 min-w-0">
                  {/* Event title */}
                  <div className="flex items-center gap-2">
                    <h4 className={`
                      font-medium text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors
                      ${isPast ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}
                    `}>
                      {event.title}
                    </h4>
                    {isPast && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        Past
                      </span>
                    )}
                  </div>
                  
                  {/* Date and time */}
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {/* Show date for same-day events OR multi-day date range */}
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>
                        {format(event.startDate, 'yyyy-MM-dd') === format(event.endDate, 'yyyy-MM-dd') 
                          ? getDateLabel(event.startDate)
                          : `${format(event.startDate, 'MMM d')} - ${format(event.endDate, 'MMM d')}`
                        }
                      </span>
                    </div>
                    
                    {/* Show time for all non-all-day events */}
                    {!event.allDay && (
                      <div className="flex items-center gap-1 text-[10px]">
                        <Clock size={12} />
                        <span>{format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')}</span>
                      </div>
                    )}
                    
                    {/* Show "All day" for all-day events */}
                    {event.allDay && (
                      <div className="flex items-center gap-1 text-[10px]">
                        <Clock size={12} />
                        <span>All day</span>
                      </div>
                    )}
                    
                    {/* <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>{getEventCreatorDisplayName(event)}</span>
                    </div> */}
                  </div>
                  
                  {/* Category and Added By */}
                  <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {EVENT_CATEGORIES[event.category]?.name || event.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <User size={10} />
                          <span>{getEventCreatorDisplayName(event)}</span>
                        </div>
                      </div>
                  
                  {/* Description (if space allows) */}
                  {event.description && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {events.filter(event => event.startDate >= threeDaysAgo && event.startDate <= sevenDaysFromNow).length > 8 && (
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            +{events.filter(event => event.startDate >= threeDaysAgo && event.startDate <= sevenDaysFromNow).length - 8} more events
          </p>
        </div>
      )}
    </div>
  );
} 