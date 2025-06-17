'use client';

import { X, Calendar, MapPin, Clock, User, Users } from 'lucide-react';
import { format } from 'date-fns';
import { CalendarEvent, EVENT_CATEGORIES } from '../types';
import { getEventCreatorDisplayName } from '../utils/calendarUtils';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isVisible: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
}

export default function EventDetailModal({ event, isVisible, onClose, onEdit, onDelete }: EventDetailModalProps) {
  if (!isVisible || !event) return null;

  const categoryInfo = EVENT_CATEGORIES[event.category];

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: event.allDay ? undefined : '2-digit',
      minute: event.allDay ? undefined : '2-digit',
    }).format(dateObj);
  };

  const formatDateRange = () => {
    if (event.allDay) {
      return `${formatDate(event.startDate)} (All day)`;
    }
    
    const startDate = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate;
    const endDate = typeof event.endDate === 'string' ? new Date(event.endDate) : event.endDate;
    
    // Same day event
    if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      return `${format(startDate, 'MMM d, yyyy')} • ${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
    }
    
    // Multi-day event
    return `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: event.color }}
            >
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Event Details</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Event Title */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-2">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: event.color }}
              >
                {categoryInfo.name}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </h4>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>
          )}

          {/* Event Details */}
          <div className="space-y-4">
            {/* Date and Time */}
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Calendar size={16} />
              <span>{formatDateRange()}</span>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={16} />
                <span>{event.location}</span>
              </div>
            )}

            {/* Added by */}
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <User size={16} />
              <span>Added by <strong className="text-gray-900 dark:text-white">{getEventCreatorDisplayName(event)}</strong></span>
            </div>

            {/* Attendees */}
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Users size={16} className="mt-0.5" />
                <div>
                  <span>Attendees: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {event.attendees.map((attendee, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded text-xs"
                      >
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Created date */}
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Clock size={16} />
              <span>Created on <strong className="text-gray-900 dark:text-white">{formatDate(event.createdAt)}</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50">
          <div className="flex gap-3">
            {onEdit && (
              <button 
                onClick={() => onEdit(event)}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Edit Event
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(event)}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            )}
            {!onEdit && !onDelete && (
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 