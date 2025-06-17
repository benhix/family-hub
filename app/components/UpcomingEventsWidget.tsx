'use client';

import { useState, useMemo } from 'react';
import { useCalendarEvents, useCalendarOperations } from '@/app/calendar/hooks/useCalendarApi';
import { useBirthdays } from '@/app/calendar/hooks/useBirthdayApi';
import { useResolvedCalendarEvents } from '@/app/hooks/useResolvedCalendarEvents';
import { format, isToday, isTomorrow, isAfter } from 'date-fns';
import { Calendar, Clock, MapPin, User, Loader2, Gift, Bell } from 'lucide-react';
import { getEventCreatorDisplayName } from '@/app/calendar/utils/calendarUtils';
import { CalendarEvent, EVENT_CATEGORIES } from '@/app/calendar/types';
import { birthdayToCalendarEvent } from '@/app/calendar/types/birthday';
import AddEventModal from '@/app/calendar/components/AddEventModal';
import { useUser } from '@clerk/nextjs';
import { useUserDisplayName } from '@/app/hooks/useUserDisplayName';
import Link from 'next/link';
import DynamicUserName from '@/app/components/DynamicUserName';

export default function UpcomingEventsWidget() {
  const { user } = useUser();
  const userDisplayName = useUserDisplayName();
  const [eventCount, setEventCount] = useState(3);
  const [isBirthdayMode, setIsBirthdayMode] = useState(false);
  const [isReminderMode, setIsReminderMode] = useState(false);
  const { events: rawEvents, setEvents, loading, error } = useCalendarEvents();
  const { updateEvent } = useCalendarOperations();
  const { birthdays, loading: birthdaysLoading, error: birthdaysError } = useBirthdays();
  const resolvedEvents = useResolvedCalendarEvents(rawEvents);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Note modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState<string>('');
  
  const { currentEvents, upcomingEvents, upcomingBirthdays, upcomingReminders } = useMemo(() => {
    const now = new Date();
    const current = [];
    const upcoming = [];

    if (isBirthdayMode) {
      // Convert birthdays to calendar events and filter for upcoming ones
      const birthdayEvents = birthdays.map(birthday => birthdayToCalendarEvent(birthday));
      const upcomingBdays = birthdayEvents
        .filter(event => isAfter(event.startDate, now))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      return { currentEvents: [], upcomingEvents: [], upcomingBirthdays: upcomingBdays, upcomingReminders: [] };
    } else if (isReminderMode) {
      // Filter for reminder events only
      const reminderEvents = resolvedEvents
        .filter(event => event.category === 'reminder' && isAfter(event.startDate, now))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      return { currentEvents: [], upcomingEvents: [], upcomingBirthdays: [], upcomingReminders: reminderEvents };
    } else {
      // Regular view: exclude reminder events
      const nonReminderEvents = resolvedEvents.filter(event => event.category !== 'reminder');
      
      for (const event of nonReminderEvents) {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        if (start <= now && now <= end) {
          current.push(event);
        } else if (start > now) {
          upcoming.push(event);
        }
      }

      upcoming.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      return { currentEvents: current, upcomingEvents: upcoming, upcomingBirthdays: [], upcomingReminders: [] };
    }
  }, [resolvedEvents, birthdays, isBirthdayMode, isReminderMode]);
  
  const eventsToShow = isBirthdayMode ? upcomingBirthdays.slice(0, eventCount) : isReminderMode ? upcomingReminders.slice(0, eventCount) : upcomingEvents.slice(0, eventCount);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) return 'All day';
    const startTime = format(new Date(event.startDate), 'h:mm a');
    const endTime = format(new Date(event.endDate), 'h:mm a');
    
    if (format(new Date(event.startDate), 'yyyy-MM-dd') === format(new Date(event.endDate), 'yyyy-MM-dd')) {
      return `${startTime} - ${endTime}`;
    }
    return `${format(new Date(event.startDate), 'MMM d, h:mm a')} - ${format(new Date(event.endDate), 'MMM d, h:mm a')}`;
  };

  const getAge = (event: CalendarEvent) => {
    // Check if age is stored in the event object
    if ((event as any)._age) {
      return (event as any)._age.toString();
    }
    return '?';
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `in ${diffDays} days`;
    if (diffDays < 30) return `in ${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;
    return `in ${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''}`;
  };

  // Event handlers - Dead for now. Keeping for future reference and just in case.
  const handleEventClick = (event: CalendarEvent) => {
    if (event.description && event.description.trim().length > 0) {
      setNoteContent(event.description);
      setShowNoteModal(true);
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    const updatedEvent = await updateEvent(eventId, updates);
    if (updatedEvent) {
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      setEditingEvent(null);
    }
  };

  // Get available people for the modal
  const availablePeople = useMemo(() => {
    const people = Array.from(new Set(rawEvents.map(event => getEventCreatorDisplayName(event))));
    return people.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }, [rawEvents]);

  const BirthdayItem = ({ event }: { event: CalendarEvent }) => (
    <button
      onClick={() => handleEventClick(event)}
      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-bold text-pink-600 dark:text-pink-400">
            {getAge(event)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-pink-600 dark:group-hover:text-pink-400">
            {event.title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5"><Calendar size={12} /><span>{getDateLabel(new Date(event.startDate))}</span></div>
            <div className="flex items-center gap-1.5"><Clock size={12} /><span>{getDaysUntil(new Date(event.startDate))}</span></div>
          </div>
          <div className="mt-1">
            <span className="text-xs text-pink-500 dark:text-pink-400">
              Birthday
            </span>
          </div>
        </div>
      </div>
    </button>
  );

  const EventItem = ({ event }: { event: CalendarEvent }) => {
    // Check if this is a birthday event
    if (event.category === 'birthday') {
      return <BirthdayItem event={event} />;
    }

    return (
      <button
        onClick={() => handleEventClick(event)}
        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
      >
        <div className="flex items-start gap-3">
          <div 
            className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
            style={{ backgroundColor: event.color }}
          />
          <div className="flex-1 min-w-0">
            {/* Event title */}
            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {event.title}
            </h4>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] text-gray-500 dark:text-gray-400">
              {/* Show date for same-day events OR multi-day date range */}
              <div className="flex items-center gap-1.5">
                <Calendar size={11} className='-mt-0.5' />
                <span>
                  {format(new Date(event.startDate), 'yyyy-MM-dd') === format(new Date(event.endDate), 'yyyy-MM-dd') 
                    ? getDateLabel(new Date(event.startDate))
                    : `${format(new Date(event.startDate), 'MMM d')} - ${format(new Date(event.endDate), 'MMM d')}`
                  }
                </span>
              </div>
              
              {/* Show time for all non-all-day events */}
              {!event.allDay && (
                <div className="flex items-center gap-1.5 text-[10px]"><Clock size={12} /><span>{format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}</span></div>
              )}
              
              {/* Show "All day" for all-day events */}
              {event.allDay && (
                <div className="flex items-center gap-1.5 text-[10px]"><Clock size={12} /><span>All day</span></div>
              )}
              
              {/* Description/Notes - show up to 2 lines */}
              {event.description && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                  {event.description}
                </p>
              )}
              
              <div className="flex items-center justify-between mt-2 w-full">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {EVENT_CATEGORIES[event.category]?.name || event.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <User size={12} />
                  <span>{getEventCreatorDisplayName(event)}</span>
                </div>
              </div>
            </div>
            <div className="mt-1 hidden">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {EVENT_CATEGORIES[event.category]?.name || event.category}
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  };

  const renderContent = () => {
    const isLoading = isBirthdayMode ? birthdaysLoading : loading;
    const hasError = isBirthdayMode ? birthdaysError : error;
    
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      );
    }
    if (hasError) {
      return <p className="text-center text-red-500 py-4 text-sm">Error loading {isBirthdayMode ? 'birthdays' : isReminderMode ? 'reminders' : 'events'}.</p>;
    }

    if (isBirthdayMode) {
      if (upcomingBirthdays.length === 0) {
        return <p className="text-center text-gray-500 py-4 text-sm">No upcoming birthdays.</p>;
      }
    } else if (isReminderMode) {
      if (upcomingReminders.length === 0) {
        return <p className="text-center text-gray-500 py-4 text-sm">No upcoming reminders.</p>;
      }
    } else {
      if (currentEvents.length === 0 && upcomingEvents.length === 0) {
        return <p className="text-center text-gray-500 py-4 text-sm">No current or upcoming events.</p>;
      }
    }

    return (
      <div className="space-y-1 p-2">
        {isBirthdayMode ? (
          // Birthday mode rendering
          <>
            {eventsToShow.length > 0 && (
              <>
                <h4 className="px-2 pt-1 text-xs font-semibold text-pink-500 dark:text-pink-400 uppercase tracking-wider">Upcoming Birthdays</h4>
                {eventsToShow.map(event => <EventItem key={`birthday-${event.id}`} event={event} />)}
              </>
            )}
            
            {upcomingBirthdays.length > eventCount && (
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
                +{upcomingBirthdays.length - eventCount} more birthdays
              </p>
            )}
          </>
        ) : isReminderMode ? (
          // Reminder mode rendering
          <>
            {eventsToShow.length > 0 && (
              <>
                <h4 className="px-2 pt-1 text-xs font-semibold text-yellow-500 dark:text-yellow-400 uppercase tracking-wider">Upcoming Reminders</h4>
                {eventsToShow.map(event => <EventItem key={`reminder-${event.id}`} event={event} />)}
              </>
            )}
            
            {upcomingReminders.length > eventCount && (
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
                +{upcomingReminders.length - eventCount} more reminders
              </p>
            )}
          </>
        ) : (
          // Regular events mode rendering
          <>
            {currentEvents.length > 0 && (
              <>
                <h4 className="px-2 pt-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Currently</h4>
                {currentEvents.map(event => <EventItem key={`current-${event.id}`} event={event} />)}
                {upcomingEvents.length > 0 && <div className="py-2"><div className="border-t border-gray-200 dark:border-gray-700"></div></div>}
              </>
            )}
            
            {eventsToShow.length > 0 && (
              <>
                {currentEvents.length > 0 && (
                     <h4 className="px-2 pt-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Upcoming</h4>
                )}
                {eventsToShow.map(event => <EventItem key={`upcoming-${event.id}`} event={event} />)}
              </>
            )}
            
            {upcomingEvents.length > eventCount && (
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
                  +{upcomingEvents.length - eventCount} more upcoming
                </p>
            )}
          </>
        )}
      </div>
    );
  };

  /* Note Modal */
  const NoteModal = () => {
    if (!showNoteModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-auto shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Notes</h3>
            <button onClick={() => setShowNoteModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors">
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {noteContent}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <Link href="/calendar/event-tool" className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {isBirthdayMode ? (
              <Gift size={16} className="text-pink-500" />
            ) : isReminderMode ? (
              <Bell size={16} className="text-yellow-500" />
            ) : (
              <Calendar size={16} className="text-blue-500" />
            )}
            {isBirthdayMode ? 'Upcoming Birthdays' : isReminderMode ? 'Upcoming Reminders' : 'Upcoming Events'}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsBirthdayMode(!isBirthdayMode);
              if (!isBirthdayMode) setIsReminderMode(false);
            }}
            className={`p-1.5 rounded-md transition-colors ${
              isBirthdayMode 
                ? 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400' 
                : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400'
            }`}
            title={isBirthdayMode ? 'Switch to Events' : 'Switch to Birthdays'}
          >
            <Gift size={14} />
          </button>
          <button
            onClick={() => {
              setIsReminderMode(!isReminderMode);
              if (!isReminderMode) setIsBirthdayMode(false);
            }}
            className={`p-1.5 rounded-md transition-colors ${
              isReminderMode 
                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' 
                : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400'
            }`}
            title={isReminderMode ? 'Switch to Events' : 'Switch to Reminders'}
          >
            <Bell size={14} />
          </button>
        <div className="flex items-center gap-1">
          {[3, 5, 10].map(count => (
            <button 
              key={count}
              onClick={() => setEventCount(count)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                eventCount === count 
                  ? isBirthdayMode
                    ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300'
                    : isReminderMode
                    ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                    : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700'
              }`}
            >
              {count}
            </button>
          ))}
          </div>
        </div>
      </div>
      {renderContent()}

      {/* Edit Event Modal */}
      <AddEventModal
        isVisible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEvent(null);
        }}
        onAddEvent={() => {}} // Not used in edit mode
        onEditEvent={handleUpdateEvent}
        availablePeople={availablePeople}
        editEvent={editingEvent}
      />

      <NoteModal />
    </div>
  );
} 