import { format } from 'date-fns';
import { MapPin, Clock, Users, Trash2, Edit3 } from 'lucide-react';
import { CalendarEvent, EVENT_CATEGORIES } from '../types';
import { formatEventTime, formatEventDate, groupEventsByDate, getEventStatus, isEventHappeningNow, getEventCreatorDisplayName } from '../utils/calendarUtils';

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (event: CalendarEvent) => void;
}

export default function AgendaView({ events, onEventClick, onEditEvent, onDeleteEvent }: AgendaViewProps) {
  const groupedEvents = groupEventsByDate(events);
  const sortedDates = Object.keys(groupedEvents).sort();

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events found</h3>
        <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or add a new event to get started.</p>
      </div>
    );
  }

  const renderEvent = (event: CalendarEvent) => {
    const status = getEventStatus(event);
    const isHappening = isEventHappeningNow(event);
    const category = EVENT_CATEGORIES[event.category];

    return (
      <div
        key={event.id}
        className={`
          relative p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-all cursor-pointer
          ${isHappening 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-md' 
            : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
          }
          ${status === 'completed' ? 'opacity-60' : ''}
        `}
        onClick={() => onEventClick(event)}
      >
        {/* Color bar */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: event.color }}
        />

        {/* Status indicator */}
        {isHappening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
        )}

        <div className="ml-3">
          {/* Event header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                {event.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">{category.name}</span>
                {isHappening && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Live
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 ml-2">
              {onEditEvent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEvent(event);
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Edit event"
                >
                  <Edit3 size={14} className="text-gray-500 dark:text-gray-400" />
                </button>
              )}
              {onDeleteEvent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEvent(event);
                  }}
                  className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete event"
                >
                  <Trash2 size={14} className="text-red-500 dark:text-red-400" />
                </button>
              )}
            </div>
          </div>

          {/* Event details */}
          <div className="space-y-2">
            {/* Time */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Clock size={14} className="text-gray-400" />
              <span>{formatEventTime(event)}</span>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin size={14} className="text-gray-400" />
                <span>{event.location}</span>
              </div>
            )}

            {/* Attendees */}
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Users size={14} className="text-gray-400" />
                <span>{event.attendees.join(', ')}</span>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                {event.description}
              </p>
            )}

            {/* Added by */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Added by {getEventCreatorDisplayName(event)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => {
        const date = new Date(dateKey);
        const dayEvents = groupedEvents[dateKey];

        return (
          <div key={dateKey} className="space-y-3">
            {/* Date header */}
            <div className="sticky top-20 z-10 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatEventDate(date)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
              </p>
            </div>

            {/* Events for this date */}
            <div className="space-y-3">
              {dayEvents.map(renderEvent)}
            </div>
          </div>
        );
      })}
    </div>
  );
} 