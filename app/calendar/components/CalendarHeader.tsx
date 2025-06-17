import Link from 'next/link';
import { ArrowLeft, Calendar, Plus, Filter, ChevronLeft, ChevronRight, Gift, Bell, Grid3X3 } from 'lucide-react';
import { format } from 'date-fns';
import { CalendarView } from '../types';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onAddClick: () => void;
  onFilterClick: () => void;
  hasActiveFilters?: boolean;
  isBirthdayMode?: boolean;
  onBirthdayModeToggle?: () => void;
  onAddBirthdayClick?: () => void;
  isReminderMode?: boolean;
  onReminderModeToggle?: () => void;
}

export default function CalendarHeader({ 
  currentDate, 
  onDateChange, 
  currentView,
  onViewChange,
  onAddClick, 
  onFilterClick, 
  hasActiveFilters = false,
  isBirthdayMode = false,
  onBirthdayModeToggle,
  onAddBirthdayClick,
  isReminderMode = false,
  onReminderModeToggle
}: CalendarHeaderProps) {
  
  const formatHeaderDate = (date: Date, view: CalendarView): string => {
    switch (view) {
      case 'month':
        return format(date, 'MMMM yyyy');
      case 'week':
        return format(date, 'MMM d, yyyy');
      case 'day':
        return format(date, 'EEEE, MMM d, yyyy');
      default:
        return format(date, 'MMMM yyyy');
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentTime = currentDate.getTime();
    let newDate: Date;

    switch (currentView) {
      case 'month':
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1);
        break;
      case 'week':
        newDate = new Date(currentTime + (direction === 'next' ? 7 : -7) * 24 * 60 * 60 * 1000);
        break;
      case 'day':
        newDate = new Date(currentTime + (direction === 'next' ? 1 : -1) * 24 * 60 * 60 * 1000);
        break;
      default:
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1);
    }

    onDateChange(newDate);
  };

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              {isBirthdayMode ? (
                <Gift size={24} className="text-pink-500" />
              ) : isReminderMode ? (
                <Bell size={24} className="text-yellow-500" />
              ) : (
                <Calendar size={24} className="text-blue-500" />
              )}
              {isBirthdayMode ? 'Birthdays' : isReminderMode ? 'Reminders' : 'Calendar'}
            </h1>
          </div>
          
          <div className="flex items-center gap-1">
            {onBirthdayModeToggle && (
              <button 
                onClick={onBirthdayModeToggle}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isBirthdayMode ? 'bg-pink-100 dark:bg-pink-900/20' : ''}`}
                title={isBirthdayMode ? 'Switch to Calendar Mode' : 'Switch to Birthday Mode'}
              >
                <Gift size={20} className={isBirthdayMode ? 'text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-300'} />
              </button>
            )}
            {onReminderModeToggle && (
              <button 
                onClick={onReminderModeToggle}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isReminderMode ? 'bg-yellow-100 dark:bg-yellow-900/20' : ''}`}
                title={isReminderMode ? 'Switch to Calendar Mode' : 'Switch to Reminder Mode'}
              >
                <Bell size={20} className={isReminderMode ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-300'} />
              </button>
            )}
            <button 
              onClick={onFilterClick}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative ${hasActiveFilters ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}
            >
              <Filter size={20} className={hasActiveFilters ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} />
              {hasActiveFilters && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
              )}
            </button>
            <button 
              onClick={isBirthdayMode && onAddBirthdayClick ? onAddBirthdayClick : onAddClick}
              className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isBirthdayMode ? 'Add Birthday' : 'Add Event'}
            >
              <Plus size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        {/* Date Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button 
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatHeaderDate(currentDate, currentView)}
            </h2>
          </div>
          
          <button 
            onClick={() => navigateDate('next')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* View Selector */}
        <div className="flex justify-center mt-4">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
            {(['month', 'week', 'day'] as CalendarView[]).map((view) => (
              <button
                key={view}
                onClick={() => onViewChange(view)}
                className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                  currentView === view
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Event Hub Button */}
        <div className="flex justify-center mt-3">
          <Link 
            href="/calendar/event-tool"
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors font-medium text-sm"
          >
            <Grid3X3 size={16} />
            Event Hub
          </Link>
        </div>
      </div>
    </div>
  );
} 