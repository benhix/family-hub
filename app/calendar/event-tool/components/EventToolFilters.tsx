import { useState } from 'react';
import { ChevronDown, Filter, Calendar, Tag, ArrowUpDown, History, X } from 'lucide-react';
import { EventCategory, EVENT_CATEGORIES } from '../../types';

type EventDateFilter = 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'upcoming';
type EventSortType = 'date' | 'title' | 'category';
interface EventFilters {
  categories: EventCategory[];
  dateFilter: EventDateFilter;
  sortBy: EventSortType;
  sortOrder: 'asc' | 'desc';
  showPastEvents: boolean;
}

interface EventToolFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: Partial<EventFilters>) => void;
  eventCounts: {
    all: number;
    today: number;
    tomorrow: number;
    week: number;
    month: number;
    upcoming: number;
  };
}

const dateFilterLabels: Record<EventDateFilter, string> = {
  all: 'All Events',
  today: 'Today',
  tomorrow: 'Tomorrow',
  week: 'This Week',
  month: 'This Month',
  upcoming: 'Next 7 Days',
};

const sortLabels: Record<EventSortType, string> = {
  date: 'Date',
  title: 'Title',
  category: 'Category',
};

export default function EventToolFilters({ filters, onFiltersChange, eventCounts }: EventToolFiltersProps) {
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);

  const handleCategoryToggle = (category: EventCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ categories: newCategories });
  };

  const handleDateFilterChange = (dateFilter: EventDateFilter) => {
    onFiltersChange({ dateFilter });
    setShowDateFilter(false);
  };

  const handleSortChange = (sortBy: EventSortType) => {
    onFiltersChange({ sortBy });
    setShowSortFilter(false);
  };

  const handleSortOrderToggle = () => {
    onFiltersChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      dateFilter: 'upcoming',
      sortBy: 'date',
      sortOrder: 'asc',
      showPastEvents: false,
    });
  };

  const activeFiltersCount = filters.categories.length + 
    (filters.dateFilter !== 'upcoming' ? 1 : 0) + 
    (filters.showPastEvents ? 1 : 0) +
    (filters.sortBy !== 'date' || filters.sortOrder !== 'asc' ? 1 : 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
          {activeFiltersCount > 0 && (
            <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
              {activeFiltersCount}
            </div>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Filter */}
        <div className="relative">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {dateFilterLabels[filters.dateFilter]}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} />
          </button>

          {showDateFilter && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              {(Object.entries(dateFilterLabels) as [EventDateFilter, string][]).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleDateFilterChange(value)}
                  className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg ${
                    filters.dateFilter === value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <span className="text-sm">{label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {eventCounts[value as keyof typeof eventCounts]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Categories {filters.categories.length > 0 && `(${filters.categories.length})`}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryFilter ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryFilter && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              {(Object.entries(EVENT_CATEGORIES) as [EventCategory, typeof EVENT_CATEGORIES[EventCategory]][]).map(([category, config]) => (
                <label
                  key={category}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{config.name}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sort Filter */}
        <div className="relative">
          <button
            onClick={() => setShowSortFilter(!showSortFilter)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Sort by {sortLabels[filters.sortBy]}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSortFilter ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {showSortFilter && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              {(Object.entries(sortLabels) as [EventSortType, string][]).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleSortChange(value)}
                  className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg ${
                    filters.sortBy === value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <span className="text-sm">{label}</span>
                </button>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleSortOrderToggle}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 rounded-b-lg text-gray-900 dark:text-white"
                >
                  <span className="text-sm">Order</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {filters.sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Show Past Events Toggle */}
        <div>
          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
            <History className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">
              Show Past Events
            </span>
            <input
              type="checkbox"
              checked={filters.showPastEvents}
              onChange={(e) => onFiltersChange({ showPastEvents: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.categories.length > 0 || filters.dateFilter !== 'upcoming' || filters.showPastEvents) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filters.categories.map(category => (
              <span
                key={category}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium"
              >
{EVENT_CATEGORIES[category].name}
                <button
                  onClick={() => handleCategoryToggle(category)}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {filters.dateFilter !== 'upcoming' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs font-medium">
                📅 {dateFilterLabels[filters.dateFilter]}
                <button
                  onClick={() => onFiltersChange({ dateFilter: 'upcoming' })}
                  className="ml-1 hover:text-green-900 dark:hover:text-green-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.showPastEvents && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md text-xs font-medium">
                🕒 Past Events
                <button
                  onClick={() => onFiltersChange({ showPastEvents: false })}
                  className="ml-1 hover:text-orange-900 dark:hover:text-orange-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 