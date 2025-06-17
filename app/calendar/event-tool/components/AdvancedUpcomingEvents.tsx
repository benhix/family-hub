import { useMemo } from 'react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { Calendar, Clock, MapPin, User, LayoutGrid, List } from 'lucide-react';
import { CalendarEvent, EVENT_CATEGORIES } from '../../types';

type EventViewType = 'cards' | 'list' | 'timeline' | 'calendar';

interface AdvancedUpcomingEventsProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  viewType: EventViewType;
  onViewTypeChange: (viewType: EventViewType) => void;
}

const viewTypeIcons = {
  cards: LayoutGrid,
  list: List,
  timeline: Clock,
  calendar: Calendar,
};

export default function AdvancedUpcomingEvents({ 
  events, 
  onEventClick, 
  viewType, 
  onViewTypeChange 
}: AdvancedUpcomingEventsProps) {
  // Get upcoming events (next 14 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const fourteenDaysFromNow = addDays(now, 14);
    
    return events
      .filter(event => event.startDate >= now && event.startDate <= fourteenDaysFromNow)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [events]);

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
    
    if (format(event.startDate, 'yyyy-MM-dd') === format(event.endDate, 'yyyy-MM-dd')) {
      return `${startTime} - ${endTime}`;
    } else {
      return `${format(event.startDate, 'MMM d, h:mm a')} - ${format(event.endDate, 'MMM d, h:mm a')}`;
    }
  };

  // Group events by date for better organization
  const groupedEvents = useMemo(() => {
    const grouped = upcomingEvents.reduce((groups, event) => {
      const dateKey = format(event.startDate, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    }, {} as Record<string, CalendarEvent[]>);

    return Object.entries(grouped).slice(0, 7); // Show max 7 days
  }, [upcomingEvents]);

  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-8">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 text-2xl mb-3">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No upcoming events
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your next 14 days are free! Time to plan something exciting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Upcoming Events
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Next {upcomingEvents.length} events in the coming 14 days
            </p>
          </div>
          
          {/* View Type Selector */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            {(Object.keys(viewTypeIcons) as EventViewType[]).map((type) => {
              const IconComponent = viewTypeIcons[type];
              const isActive = viewType === type;
              
              return (
                <button
                  key={type}
                  onClick={() => onViewTypeChange(type)}
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all
                    ${isActive 
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }
                  `}
                  title={type}
                >
                  <IconComponent className="w-3 h-3" />
                  <span className="hidden sm:inline capitalize">{type}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Events Content */}
      <div className="p-4">
        {viewType === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.slice(0, 6).map((event) => {
              const categoryInfo = EVENT_CATEGORIES[event.category];
              
              return (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all hover:shadow-md group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getDateLabel(event.startDate)}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {event.title}
                  </h4>
                  
                  <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatEventTime(event)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {viewType === 'list' && (
          <div className="space-y-1">
            {upcomingEvents.slice(0, 8).map((event) => {
              const categoryInfo = EVENT_CATEGORIES[event.category];
              
              return (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                        {event.title}
                      </h4>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {/* Show date for same-day events OR multi-day date range */}
                        <span>
                          {format(event.startDate, 'yyyy-MM-dd') === format(event.endDate, 'yyyy-MM-dd') 
                            ? getDateLabel(event.startDate)
                            : `${format(event.startDate, 'MMM d')} - ${format(event.endDate, 'MMM d')}`
                          }
                        </span>
                        
                        {/* Show time for all non-all-day events */}
                        {!event.allDay && (
                          <span>{format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')}</span>
                        )}
                        
                        {/* Show "All day" for all-day events */}
                        {event.allDay && (
                          <span>All day</span>
                        )}
                        
                        {event.location && <span className="truncate">{event.location}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {viewType === 'timeline' && (
          <div className="space-y-4">
            {groupedEvents.map(([dateKey, dayEvents]) => {
              const date = new Date(dateKey);
              
              return (
                <div key={dateKey} className="relative">
                  <div className="absolute left-0 top-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="ml-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {getDateLabel(date)} - {format(date, 'MMMM d, yyyy')}
                    </h4>
                    <div className="space-y-2">
                      {dayEvents.map((event) => {
                        const categoryInfo = EVENT_CATEGORIES[event.category];
                        
                        return (
                          <button
                            key={event.id}
                            onClick={() => onEventClick(event)}
                            className="w-full text-left p-2 rounded border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors group"
                          >
                            {/* Title */}
                            <div className="mb-1">
                              <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {event.title}
                              </span>
                            </div>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {/* Show date for same-day events OR multi-day date range */}
                              <span>
                                {format(event.startDate, 'yyyy-MM-dd') === format(event.endDate, 'yyyy-MM-dd') 
                                  ? getDateLabel(event.startDate)
                                  : `${format(event.startDate, 'MMM d')} - ${format(event.endDate, 'MMM d')}`
                                }
                              </span>
                              
                              {/* Show time for all non-all-day events */}
                              {!event.allDay && (
                                <span> • {format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')}</span>
                              )}
                              
                              {/* Show "All day" for all-day events */}
                              {event.allDay && (
                                <span> • All day</span>
                              )}
                              
                              {event.location && (
                                <span> • {event.location}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewType === 'calendar' && (
          <div className="grid grid-cols-7 gap-2">
            {/* Calendar view implementation would go here */}
            <div className="col-span-7 text-center py-8 text-gray-500 dark:text-gray-400">
              Calendar view coming soon...
            </div>
          </div>
        )}

        {/* Show More Link */}
        {upcomingEvents.length > (viewType === 'cards' ? 6 : 8) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              +{upcomingEvents.length - (viewType === 'cards' ? 6 : 8)} more upcoming events
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 