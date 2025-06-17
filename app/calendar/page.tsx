'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import CalendarHeader from './components/CalendarHeader';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import AgendaView from './components/AgendaView';
import UpcomingEvents from './components/UpcomingEvents';
import UpcomingBirthdays from './components/UpcomingBirthdays';
import AddEventModal from './components/AddEventModal';
import FilterModal from './components/FilterModal';
import EventDetailModal from './components/EventDetailModal';
import BirthdayDetailModal from './components/BirthdayDetailModal';
import AddBirthdayModal from './components/AddBirthdayModal';
import BirthdaySearch from './components/BirthdaySearch';
import { useUserDisplayName } from '../hooks/useUserDisplayName';
import { useResolvedCalendarEvents } from '../hooks/useResolvedCalendarEvents';
import { cacheCurrentUser } from '../utils/userResolver';
import { useActivityLogger } from '../hooks/useActivityLogger';
import { useRouter } from 'next/navigation';
import { CalendarEvent, CalendarView, CalendarFilters, EventCategory, EVENT_CATEGORIES } from './types';
import { CreateCalendarEventRequest } from './types/database';
import { Birthday, birthdayToCalendarEvent } from './types/birthday';
import { applyCalendarFilters, getUniquePeople } from './utils/calendarUtils';
import { useCalendarEvents, useCalendarOperations } from './hooks/useCalendarApi';
import { useBirthdays, useBirthdayOperations } from './hooks/useBirthdayApi';

export default function CalendarPage() {
  const router = useRouter();
  
  const { user } = useUser();
  const userDisplayName = useUserDisplayName();
  const { logCalendarActivity } = useActivityLogger();
  
  // Cache current user data for dynamic name resolution
  useEffect(() => {
    if (user?.id) {
      cacheCurrentUser(user.id, user);
    }
  }, [user]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Birthday mode state
  const [isBirthdayMode, setIsBirthdayMode] = useState(false);
  const [showAddBirthdayModal, setShowAddBirthdayModal] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | null>(null);
  const [filteredBirthdays, setFilteredBirthdays] = useState<Birthday[]>([]);
  const [showBirthdayDetail, setShowBirthdayDetail] = useState(false);
  const [selectedBirthday, setSelectedBirthday] = useState<Birthday | null>(null);
  
  // Reminder mode state
  const [isReminderMode, setIsReminderMode] = useState(false);

  // Get events from database
  const { events, setEvents, loading, error, refetch } = useCalendarEvents();
  const { createEvent, updateEvent, deleteEvent } = useCalendarOperations();
  
  // Get birthdays from database
  const { birthdays, setBirthdays, loading: birthdaysLoading, error: birthdaysError, refetch: refetchBirthdays } = useBirthdays();
  const { createBirthday, updateBirthday, deleteBirthday } = useBirthdayOperations();
  
  // Resolve user names dynamically based on preferences
  const resolvedEvents = useResolvedCalendarEvents(events);

  // Filter state
  const [filters, setFilters] = useState<CalendarFilters>({
    view: 'month',
    dateRange: 'all',
    showCategories: Object.keys(EVENT_CATEGORIES).reduce(
      (acc, category) => ({ ...acc, [category]: true }), 
      {} as Record<EventCategory, boolean>
    ),
    showPeople: {},
    searchQuery: '',
  });

  // Get unique people and initialize people filter
  const availablePeople = useMemo(() => getUniquePeople(resolvedEvents), [resolvedEvents]);
  
  // Initialize people filter when availablePeople changes
  useEffect(() => {
    if (availablePeople.length > 0 && Object.keys(filters.showPeople).length === 0) {
      setFilters(prev => ({
        ...prev,
        showPeople: availablePeople.reduce(
          (acc, person) => ({ ...acc, [person]: true }), 
          {} as Record<string, boolean>
        )
      }));
    }
  }, [availablePeople, filters.showPeople]);

  // Initialize filtered birthdays when birthdays load
  useEffect(() => {
    if (birthdays.length > 0 && filteredBirthdays.length === 0) {
      setFilteredBirthdays(birthdays);
    }
  }, [birthdays, filteredBirthdays.length]);

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    if (isBirthdayMode) {
      // Convert birthdays to calendar events for display
      return filteredBirthdays.map(birthday => birthdayToCalendarEvent(birthday));
    } else if (isReminderMode) {
      // Filter for reminder events only
      return resolvedEvents.filter(event => event.category === 'reminder');
    }
    // Normal view: include all events and apply filters
    return applyCalendarFilters(resolvedEvents, filters);
  }, [resolvedEvents, filters, isBirthdayMode, isReminderMode, filteredBirthdays]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    if (isBirthdayMode) {
      return filteredBirthdays.length !== birthdays.length;
    } else if (isReminderMode) {
      return true; // Always show as filtered when in reminder mode
    }
    const hasSearchQuery = filters.searchQuery.trim().length > 0;
    const hasDateFilter = filters.dateRange !== 'all';
    const hasHiddenCategories = Object.values(filters.showCategories).some(show => !show);
    const hasHiddenPeople = Object.values(filters.showPeople).some(show => !show);
    
    return hasSearchQuery || hasDateFilter || hasHiddenCategories || hasHiddenPeople;
  }, [filters, isBirthdayMode, isReminderMode, filteredBirthdays.length, birthdays.length]);

  // Event handlers
  const handleAddEvent = async (newEventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return;

    const eventRequest: CreateCalendarEventRequest = {
      title: newEventData.title,
      description: newEventData.description,
      startDate: newEventData.startDate,
      endDate: newEventData.endDate,
      location: newEventData.location,
      addedBy: newEventData.addedBy, // Always the actual creator's name
      addedByUserId: newEventData.addedByUserId || user.id, // Always the actual creator's ID
      customCreatorName: newEventData.customCreatorName,
      useCustomCreator: newEventData.useCustomCreator,
      attendees: newEventData.attendees,
      category: newEventData.category,
      allDay: newEventData.allDay,
      color: newEventData.color,
    };

    const createdEvent = await createEvent(eventRequest);
    if (createdEvent) {
      setEvents(prev => [...prev, createdEvent]);
      logCalendarActivity('added', newEventData.title);
    }
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    // Perform the deletion directly since AddEventModal already handles confirmation
    const success = await deleteEvent(event.id);
    if (success) {
      setEvents(prev => prev.filter(e => e.id !== event.id));
      logCalendarActivity('deleted', event.title);
      setShowEventDetail(false);
      setSelectedEvent(null);
      setShowAddModal(false); // Close the AddEventModal after deletion
      setEditingEvent(null); // Clear editing state
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEventDetail(false); // Close detail modal
    setShowAddModal(true); // Open add/edit modal in edit mode
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    const updatedEvent = await updateEvent(eventId, updates);
    if (updatedEvent) {
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      logCalendarActivity('updated', updatedEvent.title);
      setEditingEvent(null);
    }
  };

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
      // For regular events, open edit modal directly
      setEditingEvent(event);
      setShowAddModal(true);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowAddModal(true);
  };

  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view);
    setFilters(prev => ({ ...prev, view }));
  };

  // Birthday handlers
  const handleBirthdayModeToggle = () => {
    setIsBirthdayMode(!isBirthdayMode);
    if (!isBirthdayMode) {
      setIsReminderMode(false); // Turn off reminder mode when turning on birthday mode
    }
  };

  // Reminder handlers
  const handleReminderModeToggle = () => {
    setIsReminderMode(!isReminderMode);
    if (!isReminderMode) {
      setIsBirthdayMode(false); // Turn off birthday mode when turning on reminder mode
    }
  };

  const handleAddBirthday = async (birthdayData: Omit<Birthday, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) return;

    try {
      const newBirthday: Birthday = {
        ...birthdayData,
        addedByUserId: user.id,
        addedBy: userDisplayName,
        id: '', // Will be set by the API
        createdAt: new Date(),
      };

      const createdBirthday = await createBirthday({
        ...birthdayData,
        addedByUserId: user.id,
        addedBy: userDisplayName,
      });

      if (createdBirthday) {
        setBirthdays(prev => [...prev, createdBirthday]);
        logCalendarActivity('added', `Birthday for ${birthdayData.name}`);
      }
    } catch (error) {
      console.error('Error adding birthday:', error);
      throw error;
    }
  };

  const handleEditBirthday = (birthday: Birthday) => {
    setEditingBirthday(birthday);
    setShowAddBirthdayModal(true);
  };

  const openEventTool = () => {
    router.push('/calendar/event-tool');
  };

  const handleDeleteBirthday = async (birthdayId: string) => {
    const success = await deleteBirthday(birthdayId);
    if (success) {
      // Refetch birthdays to ensure UI is updated
      await refetchBirthdays();
      const deletedBirthday = birthdays.find(b => b.id === birthdayId);
      if (deletedBirthday) {
        logCalendarActivity('deleted', `Birthday for ${deletedBirthday.name}`);
      }
      // Close the modal
      setShowBirthdayDetail(false);
      setSelectedBirthday(null);
    }
  };

  const renderCalendarView = () => {
    switch (currentView) {
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}            events={filteredEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        );
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            events={filteredEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            events={filteredEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        );
      case 'agenda':
        return (
          <AgendaView
            events={filteredEvents}
            onEventClick={handleEventClick}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        );
      default:
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {currentView} view coming soon!
            </p>
          </div>
        );
    }
  };

  if (loading || birthdaysLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-4">
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          currentView={currentView}
          onViewChange={handleViewChange}
          onAddClick={() => setShowAddModal(true)}
          onFilterClick={() => setShowFilterModal(true)}
          hasActiveFilters={false}
        />
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || birthdaysError) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-20">
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          currentView={currentView}
          onViewChange={handleViewChange}
          onAddClick={() => setShowAddModal(true)}
          onFilterClick={() => setShowFilterModal(true)}
          hasActiveFilters={false}
        />
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="text-red-500">⚠️</div>
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-200">Error Loading Calendar</h3>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error || birthdaysError}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-4">
      {/* Header */}
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        currentView={currentView}
        onViewChange={handleViewChange}
        onAddClick={() => {
          setSelectedDate(undefined);
          setEditingEvent(null); // Clear any editing state
          setShowAddModal(true);
        }}
        onFilterClick={() => setShowFilterModal(true)}
        hasActiveFilters={hasActiveFilters}
        isBirthdayMode={isBirthdayMode}
        onBirthdayModeToggle={handleBirthdayModeToggle}
        onAddBirthdayClick={() => {
          setEditingBirthday(null);
          setShowAddBirthdayModal(true);
        }}
        isReminderMode={isReminderMode}
        onReminderModeToggle={handleReminderModeToggle}
      />

      {/* Calendar Content */}
      <div className="max-w-md mx-auto p-4 space-y-4 -mt-6">
        {/* Birthday Search (only in birthday mode) */}
        {/* {isBirthdayMode && (
          <BirthdaySearch
            birthdays={birthdays}
            onFilteredResults={setFilteredBirthdays}
          />
        )} */}

        {/* Summary Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4 hidden">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredEvents.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isBirthdayMode ? 'Birthdays' : isReminderMode ? 'Reminders' : 'Total Events'}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {isBirthdayMode ? birthdays.length : isReminderMode ? resolvedEvents.filter(e => e.category === 'reminder').length : availablePeople.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isBirthdayMode ? 'Total Birthdays' : isReminderMode ? 'Total Reminders' : 'Family Members'}
              </p>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {filteredEvents.length} of {isBirthdayMode ? birthdays.length : isReminderMode ? resolvedEvents.filter(e => e.category === 'reminder').length : resolvedEvents.length} {isBirthdayMode ? 'birthdays' : isReminderMode ? 'reminders' : 'events'} shown (filtered)
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Events/Birthdays */}
        {isBirthdayMode ? (
          <UpcomingBirthdays
            events={filteredEvents}
            onEventClick={handleEventClick}
            onTitleClick={openEventTool}
          />
        ) : (
          <UpcomingEvents
            events={filteredEvents}
            onEventClick={handleEventClick}
            onTitleClick={openEventTool}
          />
        )}

        {/* Calendar View */}
        {renderCalendarView()}
      </div>

      {/* Modals */}
      <AddEventModal
        isVisible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingEvent(null); // Clear editing state when closing
        }}
        onAddEvent={handleAddEvent}
        onEditEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
        availablePeople={availablePeople}
        selectedDate={selectedDate}
        editEvent={editingEvent}
      />

      <FilterModal
        isVisible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFiltersChange={setFilters}
        availablePeople={availablePeople}
      />

      <EventDetailModal
        event={selectedEvent}
        isVisible={showEventDetail}
        onClose={() => {
          setShowEventDetail(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      <AddBirthdayModal
        isVisible={showAddBirthdayModal}
        onClose={() => {
          setShowAddBirthdayModal(false);
          setEditingBirthday(null);
        }}
        onAddBirthday={handleAddBirthday}
        editBirthday={editingBirthday}
      />

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
    </main>
  );
} 