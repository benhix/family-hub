'use client';

import { useState, useMemo } from 'react';
import { format, isToday, isTomorrow, addDays, addWeeks, addMonths, isAfter, isBefore } from 'date-fns';
import { CalendarEvent } from '../types';
import { Calendar, Gift, Clock, User, ChevronDown } from 'lucide-react';

interface UpcomingBirthdaysProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTitleClick?: () => void;
}

type DateRange = '1w' | '1m' | 'all';

export default function UpcomingBirthdays({ events, onEventClick, onTitleClick }: UpcomingBirthdaysProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>('1w');
  const [visibleCount, setVisibleCount] = useState(3);

  // Get upcoming birthdays based on selected range
  const upcomingBirthdays = useMemo(() => {
    const now = new Date();
    let endDate: Date;

    switch (selectedRange) {
      case '1w':
        endDate = addWeeks(now, 1);
        break;
      case '1m':
        endDate = addMonths(now, 1);
        break;
      case 'all':
        endDate = addMonths(now, 12); // Show birthdays for the next year
        break;
    }

    // Filter birthday events for the selected date range
    // Only show birthdays for their next occurrence (this year or next year if this year has passed)
    const filteredBirthdays = events
      .filter(event => {
        // Only show birthday events (those with category 'birthday')
        if (event.category !== 'birthday') return false;
        
        // Check if the birthday is in the selected range
        return isAfter(event.startDate, now) && isBefore(event.startDate, endDate);
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return filteredBirthdays;
  }, [events, selectedRange]);

  const visibleBirthdays = upcomingBirthdays.slice(0, visibleCount);
  const hasMoreBirthdays = upcomingBirthdays.length > visibleCount;

  const getDateLabel = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEE, MMM d');
    }
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

  const getAge = (event: CalendarEvent) => {
    // Check if age is stored in the event object
    if ((event as any)._age) {
      return (event as any)._age.toString();
    }
    
    // Fallback: try to extract age from description or calculate it
    // If no age available, show "?"
    return '?';
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  const getRangeLabel = (range: DateRange) => {
    switch (range) {
      case '1w': return '1W';
      case '1m': return '1M';
      case 'all': return 'All';
    }
  };

  if (upcomingBirthdays.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gift size={16} className="text-pink-600 dark:text-pink-400" />
            <button
              onClick={onTitleClick}
              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              disabled={!onTitleClick}
            >
              Upcoming Birthdays
            </button>
          </div>
          
          {/* Date Range Buttons */}
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1 gap-1">
            {(['1w', '1m', 'all'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setSelectedRange(range);
                  setVisibleCount(3); // Reset visible count when range changes
                }}
                className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedRange === range
                    ? 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {getRangeLabel(range)}
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
          No upcoming birthdays in the selected period
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift size={16} className="text-pink-600 dark:text-pink-400" />
          <button
            onClick={onTitleClick}
            className="text-sm font-semibold text-gray-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            disabled={!onTitleClick}
          >
            Upcoming Birthdays
          </button>
        </div>
        
        {/* Date Range Buttons */}
        <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1 gap-1">
          {(['1w', '1m', 'all'] as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => {
                setSelectedRange(range);
                setVisibleCount(3); // Reset visible count when range changes
              }}
              className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                selectedRange === range
                  ? 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {getRangeLabel(range)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        {visibleBirthdays.map((event) => (
          <button
            key={event.id}
            onClick={() => onEventClick(event)}
            className="w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group"
          >
                         <div className="flex items-start gap-3">
               {/* Age indicator */}
               <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                 <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                   {getAge(event)}
                 </span>
               </div>
              
              <div className="flex-1 min-w-0">
                {/* Birthday title */}
                <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {event.title}
                </h4>
                
                {/* Date and countdown */}
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{getDateLabel(event.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{getDaysUntil(event.startDate)}</span>
                  </div>
                  
                  {/* <div className="flex items-center gap-1">
                    <User size={12} />
                    <span>{event.addedBy}</span>
                  </div> */}
                </div>
                
                {/* Birthday description/notes if present */}
                {event.description && !event.description.includes('Birthday celebration for') && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Load More Button */}
      {hasMoreBirthdays && (
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLoadMore}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
          >
            <span>Load {Math.min(5, upcomingBirthdays.length - visibleCount)} more</span>
            <ChevronDown size={12} />
          </button>
        </div>
      )}
      
      {/* Total count indicator */}
      {upcomingBirthdays.length > 3 && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {visibleBirthdays.length} of {upcomingBirthdays.length} birthdays
          </p>
        </div>
      )}
    </div>
  );
} 