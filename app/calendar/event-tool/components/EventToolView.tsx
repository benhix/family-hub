import { format, isToday, isTomorrow, isThisWeek, isThisMonth } from 'date-fns';
import { Calendar, MapPin, Clock, User, Edit, Trash2, Star } from 'lucide-react';
import { CalendarEvent, EVENT_CATEGORIES } from '../../types';
import { getEventCreatorDisplayName } from '../../utils/calendarUtils';

type EventViewType = 'cards' | 'list' | 'timeline' | 'calendar';

interface EventToolViewProps {
  events: CalendarEvent[];
  viewType: EventViewType;
  onEventClick: (event: CalendarEvent) => void;
}

export default function EventToolView({ events, viewType, onEventClick }: EventToolViewProps) {
  const getDateLabel = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else if (isThisWeek(date)) {
      return 'This Week';
    } else if (isThisMonth(date)) {
      return 'This Month';
    } else {
      return format(date, 'MMMM yyyy');
    }
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) {
      return 'All day';
    }
    const startTime = format(event.startDate, 'h:mm a');
    const endTime = format(event.endDate, 'h:mm a');
    
    if (format(event.startDate, 'yyyy-MM-dd') === format(event.endDate, 'yyyy-MM-dd')) {
      return `${startTime} - ${endTime}`;
    } else {
      return `${format(event.startDate, 'MMM d, h:mm a')} - ${format(event.endDate, 'MMM d, h:mm a')}`;
    }
  };

  const isEventPast = (event: CalendarEvent) => {
    return event.endDate < new Date();
  };

  if (viewType === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const categoryInfo = EVENT_CATEGORIES[event.category];
          const isPast = isEventPast(event);
          
          return (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className={`
                group text-left p-4 rounded-xl border transition-all hover:shadow-md
                ${isPast 
                  ? 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 opacity-75' 
                  : 'bg-white dark:bg-slate-800 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600'
                }
              `}
            >
              {/* Event Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {categoryInfo.name}
                  </span>
                </div>
                {isPast && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">Past</span>
                )}
              </div>

              {/* Event Title */}
              <h3 className={`
                font-semibold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors
                ${isPast ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}
              `}>
                {event.title}
              </h3>

              {/* Event Details */}
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(event.startDate, 'EEE, MMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatEventTime(event)}</span>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{getEventCreatorDisplayName(event)}</span>
                </div>
              </div>

              {/* Event Description */}
              {event.description && (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {event.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (viewType === 'list') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {events.map((event, index) => {
            const categoryInfo = EVENT_CATEGORIES[event.category];
            const isPast = isEventPast(event);
            
            return (
              <button
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`
                  w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group
                  ${isPast ? 'opacity-75' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Event Color & Category */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                  </div>

                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`
                        font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate
                        ${isPast ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}
                      `}>
                        {event.title}
                      </h3>
                      {isPast && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          Past
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{format(event.startDate, 'MMM d, yyyy')}</span>
                      <span>{formatEventTime(event)}</span>
                      {event.location && (
                        <span className="truncate">{event.location}</span>
                      )}
                      <span>{getEventCreatorDisplayName(event)}</span>
                    </div>
                  </div>

                  {/* Event Category */}
                  <div className="flex-shrink-0">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {categoryInfo.name}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (viewType === 'timeline') {
    // Group events by date for timeline view
    const groupedEvents = events.reduce((groups, event) => {
      const dateKey = format(event.startDate, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    }, {} as Record<string, CalendarEvent[]>);

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => {
            const date = new Date(dateKey);
            const isPast = date < new Date();
            
            return (
              <div key={dateKey} className="relative">
                {/* Timeline Dot */}
                <div className="absolute left-0 top-0 flex items-center">
                  <div className={`
                    w-3 h-3 rounded-full border-2 border-white dark:border-slate-800
                    ${isPast ? 'bg-gray-400' : 'bg-blue-500'}
                  `} />
                  <div className="w-px bg-gray-200 dark:bg-gray-700 h-full ml-1.5 -mt-1" />
                </div>

                {/* Date Header */}
                <div className="ml-8 mb-4">
                  <h3 className={`
                    text-lg font-semibold mb-1
                    ${isPast ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}
                  `}>
                    {getDateLabel(date)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>

                {/* Events for this date */}
                <div className="ml-8 space-y-2">
                  {dayEvents.map((event) => {
                    const categoryInfo = EVENT_CATEGORIES[event.category];
                    const isEventPastLocal = isEventPast(event);
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={`
                          w-full text-left p-3 rounded-lg border transition-colors group
                          ${isEventPastLocal 
                            ? 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-gray-600 opacity-75' 
                            : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: event.color }}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`
                                font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors
                                ${isEventPastLocal ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}
                              `}>
                                {event.title}
                              </h4>
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span>{formatEventTime(event)}</span>
                              {event.location && (
                                <span className="truncate">{event.location}</span>
                              )}
                              <span>{getEventCreatorDisplayName(event)}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Calendar view (simplified grid)
  if (viewType === 'calendar') {
    // Group events by month for calendar view
    const groupedByMonth = events.reduce((groups, event) => {
      const monthKey = format(event.startDate, 'yyyy-MM');
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(event);
      return groups;
    }, {} as Record<string, CalendarEvent[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedByMonth).map(([monthKey, monthEvents]) => {
          const monthDate = new Date(monthKey + '-01');
          
          return (
            <div key={monthKey} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {format(monthDate, 'MMMM yyyy')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {monthEvents.map((event) => {
                  const categoryInfo = EVENT_CATEGORIES[event.category];
                  const isPast = isEventPast(event);
                  
                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`
                        text-left p-3 rounded-lg border transition-colors group
                        ${isPast 
                          ? 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-gray-600 opacity-75' 
                          : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {format(event.startDate, 'MMM d')}
                        </span>

                      </div>
                      
                      <h4 className={`
                        font-medium text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors
                        ${isPast ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}
                      `}>
                        {event.title}
                      </h4>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatEventTime(event)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
} 