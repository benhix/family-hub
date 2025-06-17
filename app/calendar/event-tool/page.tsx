'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, addDays, startOfWeek, endOfWeek, isAfter, differenceInDays } from 'date-fns';
import { ArrowLeft, Search, Filter, Calendar, Clock, User, MapPin, ChevronDown, Gift, Bell, Plus, Archive, RotateCcw } from 'lucide-react';
import { CalendarEvent, EventCategory, EVENT_CATEGORIES } from '../types';
import { useCalendarEvents, useCalendarOperations } from '../hooks/useCalendarApi';
import { useBirthdays, useBirthdayOperations } from '../hooks/useBirthdayApi';
import { Birthday, birthdayToCalendarEvent } from '../types/birthday';
import { isEventPast, getEventCreatorDisplayName } from '../utils/calendarUtils';
import AddEventModal from '../components/AddEventModal';
import AddBirthdayModal from '../components/AddBirthdayModal';
import BirthdayDetailModal from '../components/BirthdayDetailModal';
import { useUser } from '@clerk/nextjs';
import { useUserDisplayName } from '../../hooks/useUserDisplayName';

export type EventViewMode = 'all' | 'upcoming' | 'today' | 'week' | 'month';
export type EventSortType = 'date' | 'title' | 'category';

export default function EventToolPage() {
  const { user } = useUser();
  const userDisplayName = useUserDisplayName();
  const { events, setEvents, loading, error } = useCalendarEvents();
  const { birthdays, refetch: refetchBirthdays } = useBirthdays();
  const { createBirthday, deleteBirthday } = useBirthdayOperations();
  const { createEvent: createEventApi, updateEvent: updateEventApi, deleteEvent: deleteEventApi } = useCalendarOperations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [viewMode, setViewMode] = useState<EventViewMode>('upcoming');
  const [sortBy, setSortBy] = useState<EventSortType>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [isBirthdayMode, setIsBirthdayMode] = useState(false);
  const [isReminderMode, setIsReminderMode] = useState(false);
  const [isPastEventsMode, setIsPastEventsMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Birthday modal state
  const [showAddBirthdayModal, setShowAddBirthdayModal] = useState(false);
  const [showBirthdayDetail, setShowBirthdayDetail] = useState(false);
  const [selectedBirthday, setSelectedBirthday] = useState<Birthday | null>(null);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | null>(null);

  // Combine events with birthdays when needed
  const allEvents = useMemo(() => {
    let combinedEvents = [...events];
    const now = new Date();
    
    if (isBirthdayMode) {
      const birthdayEvents = birthdays.map(birthday => birthdayToCalendarEvent(birthday));
      return birthdayEvents;
    } else if (isReminderMode) {
      return events.filter(event => event.category === 'reminder');
    } else if (isPastEventsMode) {
      // Show only events that have ended (past events)
      return events.filter(event => {
        const eventEndDate = new Date(event.endDate);
        return eventEndDate < now;
      });
    }
    
    // For normal view, exclude past events
    return events.filter(event => {
      const eventEndDate = new Date(event.endDate);
      return eventEndDate >= now;
    });
  }, [events, birthdays, isBirthdayMode, isReminderMode, isPastEventsMode]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...allEvents];
    const now = new Date();

    // If search is active, ignore time range and category filters
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        getEventCreatorDisplayName(event).toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    } else {
      // Only apply other filters when there's no search query
      
      // Category filter
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(event => selectedCategories.includes(event.category));
      }

      // Date/View mode filter
      switch (viewMode) {
        case 'today':
          filtered = filtered.filter(event => isToday(event.startDate));
          break;
        case 'week':
          const weekStart = startOfWeek(now);
          const weekEnd = endOfWeek(now);
          filtered = filtered.filter(event => 
            event.startDate >= weekStart && event.startDate <= weekEnd
          );
          break;
        case 'month':
          filtered = filtered.filter(event => isThisMonth(event.startDate));
          break;
        case 'upcoming':
          const sevenDaysFromNow = addDays(now, 7);
          const threeDaysAgo = addDays(now, -3);
          filtered = filtered.filter(event => 
            event.startDate >= threeDaysAgo && event.startDate <= sevenDaysFromNow
          );
          break;
        case 'all':
          // Show all events including past ones
          break;
      }
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
        default:
          return a.startDate.getTime() - b.startDate.getTime();
      }
    });

    return filtered;
  }, [allEvents, searchQuery, selectedCategories, viewMode, sortBy]);

  const handleCategoryToggle = (category: EventCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleModeToggle = (mode: 'birthday' | 'reminder' | 'past') => {
    if (mode === 'birthday') {
      setIsBirthdayMode(!isBirthdayMode);
      if (!isBirthdayMode) {
        setIsReminderMode(false);
        setIsPastEventsMode(false);
        setViewMode('upcoming'); // Reset to default for non-past modes
      }
    } else if (mode === 'reminder') {
      setIsReminderMode(!isReminderMode);
      if (!isReminderMode) {
        setIsBirthdayMode(false);
        setIsPastEventsMode(false);
        setViewMode('upcoming'); // Reset to default for non-past modes
      }
    } else if (mode === 'past') {
      setIsPastEventsMode(!isPastEventsMode);
      if (!isPastEventsMode) {
        setIsBirthdayMode(false);
        setIsReminderMode(false);
        setViewMode('all'); // Set to 'all' when entering past events mode
      } else {
        setViewMode('upcoming'); // Reset to default when exiting past events mode
      }
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) return 'All day';
    const startTime = format(event.startDate, 'h:mm a');
    const endTime = format(event.endDate, 'h:mm a');
    
    if (format(event.startDate, 'yyyy-MM-dd') === format(event.endDate, 'yyyy-MM-dd')) {
      return `${startTime} - ${endTime}`;
    }
    return `${format(event.startDate, 'MMM d, h:mm a')} - ${format(event.endDate, 'MMM d, h:mm a')}`;
  };

  const getAge = (event: CalendarEvent) => {
    const age = (event as any)._age;
    return age !== undefined ? age.toString() : '?';
  };

  const getAutoDeletionCountdown = (event: CalendarEvent) => {
    const eventEndDate = new Date(event.endDate);
    const deletionDate = addDays(eventEndDate, 14); // 2 weeks after end date
    const now = new Date();
    const daysLeft = differenceInDays(deletionDate, now);
    
    if (daysLeft <= 0) {
      return "Auto-deleting soon...";
    } else if (daysLeft === 1) {
      return "1 day left";
    } else if (daysLeft < 7) {
      return `${daysLeft} days left`;
    } else {
      const weeksLeft = Math.floor(daysLeft / 7);
      return weeksLeft === 1 ? "1 week left" : `${weeksLeft} weeks left`;
    }
  };

  // Event handlers
  const handleEventClick = (event: CalendarEvent) => {
    // Check if this is a birthday event
    if (event.category === 'birthday') {
      // Extract birthday ID from event ID (format: "birthday-{birthdayId}")
      const birthdayId = event.id.startsWith('birthday-') ? event.id.replace('birthday-', '') : event.id;
      const birthday = birthdays.find(b => b.id === birthdayId);
      if (birthday) {
        setSelectedBirthday(birthday);
        setShowBirthdayDetail(true);
      }
    } else {
      // For regular events, open edit modal
      setEditingEvent(event);
      setShowEditModal(true);
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    const updatedEvent = await updateEventApi(eventId, updates);
    if (updatedEvent) {
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      setEditingEvent(null);
    }
  };

  const handleAddEvent = async (newEventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return;

    const eventRequest = {
      title: newEventData.title,
      description: newEventData.description,
      startDate: newEventData.startDate,
      endDate: newEventData.endDate,
      location: newEventData.location,
      addedBy: newEventData.addedBy,
      addedByUserId: newEventData.addedByUserId || user.id,
      customCreatorName: newEventData.customCreatorName,
      useCustomCreator: newEventData.useCustomCreator,
      attendees: newEventData.attendees,
      category: newEventData.category,
      allDay: newEventData.allDay,
      color: newEventData.color,
    };

    const createdEvent = await createEventApi(eventRequest);
    if (createdEvent) {
      setEvents(prev => [...prev, createdEvent]);
    }
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    const success = await deleteEventApi(event.id);
    if (success) {
      setEvents(prev => prev.filter(e => e.id !== event.id));
      setShowEditModal(false);
      setEditingEvent(null);
    }
  };

  const handleDeleteBirthday = async (birthdayId: string) => {
    const success = await deleteBirthday(birthdayId);
    if (success) {
      // Refetch birthdays to ensure UI is updated
      await refetchBirthdays();
      // Close the modal
      setShowBirthdayDetail(false);
      setSelectedBirthday(null);
    }
  };

  const handleEditBirthday = (birthday: Birthday) => {
    setEditingBirthday(birthday);
    setShowBirthdayDetail(false);
    setSelectedBirthday(null);
    setShowAddBirthdayModal(true);
  };

  const handleAddBirthday = async (birthdayData: Omit<Birthday, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return;
    
    try {
      // Ensure addedByUserId is provided for the API
      const birthdayRequest = {
        ...birthdayData,
        addedByUserId: birthdayData.addedByUserId || user.id,
      };
      
      const newBirthday = await createBirthday(birthdayRequest);
      if (newBirthday) {
        // Refetch birthdays to ensure UI is updated
        await refetchBirthdays();
        setShowAddBirthdayModal(false);
        setEditingBirthday(null);
      }
    } catch (error) {
      console.error('Error adding birthday:', error);
      // You could add error handling here (toast notification, etc.)
    }
  };

  const availablePeople = useMemo(() => {
    const people = Array.from(new Set(events.map(event => getEventCreatorDisplayName(event))));
    return people.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }, [events]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Header */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4">
          {/* Top row: Back button and icons */}
          <div className="flex items-center justify-between mb-3">
            <Link 
              href="/calendar"
              className="p-2 flex rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-2">Back to Calendar</span>
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-full ${showFilters ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
              >
                <Filter size={18} />
              </button>
              <button
                onClick={() => {
                  if (isBirthdayMode) {
                    setEditingBirthday(null);
                    setShowAddBirthdayModal(true);
                  } else {
                    setShowAddModal(true);
                  }
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
                title={isBirthdayMode ? "Add Birthday" : "Add Event"}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Title row */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {isBirthdayMode ? 'Birthday Events' : isReminderMode ? 'Reminders' : isPastEventsMode ? 'Past Events' : 'Event Hub'}
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-slate-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-600"
            />
          </div>

          {/* Mode Toggle Buttons */}
          <div className="flex gap-1 mb-4">
            <button
              onClick={() => {
                setIsBirthdayMode(false);
                setIsReminderMode(false);
                setIsPastEventsMode(false);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                !isBirthdayMode && !isReminderMode && !isPastEventsMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleModeToggle('birthday')}
              className={`flex items-center gap-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                isBirthdayMode
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <Gift size={14} />
              Birthdays
            </button>
            <button
              onClick={() => handleModeToggle('reminder')}
              className={`flex items-center gap-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                isReminderMode
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <Bell size={14} />
              Reminders
            </button>
            <button
              onClick={() => handleModeToggle('past')}
              className={`flex items-center gap-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                isPastEventsMode
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <Archive size={14} />
              Past
            </button>
          </div>

          {/* View Mode Selector - Hidden when in past events mode */}
          {!isPastEventsMode && (
            <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1 mb-4">
              {(['upcoming', 'today', 'week', 'month', 'all'] as EventViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 py-2 px-2 text-xs font-medium rounded-md transition-colors capitalize ${
                    viewMode === mode
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}

          {/* Past Events Info - Shown when in past events mode */}
          {isPastEventsMode && (
            <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-3 mb-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing all past events • Auto-deletion after 2 weeks
              </p>
            </div>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
            <div className="max-w-md mx-auto px-4 py-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => handleCategoryToggle(key as EventCategory)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedCategories.includes(key as EventCategory)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sort By</h3>
                <div className="flex gap-2">
                  {(['date', 'title', 'category'] as EventSortType[]).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors capitalize ${
                        sortBy === sort
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="max-w-md mx-auto px-4 py-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Events List */}
      <div className="max-w-md mx-auto px-4 pb-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No events found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => {
              const isPast = isEventPast(event);
              const isBirthdayEvent = event.category === 'birthday';
              const isInPastMode = isPastEventsMode;
              
              return (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`
                    w-full text-left rounded-xl shadow-sm border p-4 transition-all cursor-pointer
                    ${isPast && isInPastMode
                      ? 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 opacity-75 hover:opacity-90' 
                      : 'bg-white dark:bg-slate-800 border-gray-200/50 dark:border-gray-700/50 hover:shadow-md hover:scale-[1.02]'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Visual Indicator */}
                    {isBirthdayEvent ? (
                      <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                          {getAge(event)}
                        </span>
                      </div>
                    ) : (
                      <div 
                        className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex items-center gap-2">
                        <h3 className={`
                          font-medium text-sm leading-tight
                          ${isPast && isInPastMode ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}
                        `}>
                          {event.title}
                        </h3>
                        {isPast && isInPastMode && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            Completed
                          </span>
                        )}
                      </div>

                      {/* Date and Time */}
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
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')}</span>
                          </div>
                        )}
                        
                        {/* Show "All day" for all-day events */}
                        {event.allDay && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>All day</span>
                          </div>
                        )}
                      </div>

                      {/* Auto-deletion countdown for past events */}
                      {isPast && isInPastMode && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-orange-600 dark:text-orange-400">
                          <Clock size={10} />
                          <span>{getAutoDeletionCountdown(event)}</span>
                        </div>
                      )}

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

                      {/* Description */}
                      {event.description && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Location */}
                      {event.location && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin size={10} />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* Reschedule button for past events */}
                      {isPast && isInPastMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                          title="Reschedule Event"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Event Modal */}
      <AddEventModal
        isVisible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEvent(null);
        }}
        onAddEvent={() => {}} // Not used in edit mode
        onEditEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
        availablePeople={availablePeople}
        editEvent={editingEvent}
      />

      {/* Add Event Modal */}
      <AddEventModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddEvent={handleAddEvent}
        onEditEvent={() => {}} // Not used in add mode
        availablePeople={availablePeople}
      />

      {/* Add Birthday Modal */}
      <AddBirthdayModal
        isVisible={showAddBirthdayModal}
        onClose={() => {
          setShowAddBirthdayModal(false);
          setEditingBirthday(null);
        }}
        onAddBirthday={handleAddBirthday}
        editBirthday={editingBirthday}
      />

      {/* Birthday Detail Modal */}
      <BirthdayDetailModal
        birthday={selectedBirthday}
        isVisible={showBirthdayDetail}
        onClose={() => {
          setShowBirthdayDetail(false);
          setSelectedBirthday(null);
        }}
        onEdit={handleEditBirthday}
        onDelete={handleDeleteBirthday}
      />
    </div>
  );
} 