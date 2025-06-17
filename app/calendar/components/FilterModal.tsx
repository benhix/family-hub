'use client';

import { useState } from 'react';
import { X, Search, CheckCircle2, Circle, Users, Calendar } from 'lucide-react';
import { CalendarFilters, EventCategory, DateRange, EVENT_CATEGORIES } from '../types';
import ConfirmationModal from '../../components/ConfirmationModal';

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
  availablePeople: string[];
}

export default function FilterModal({ 
  isVisible, 
  onClose, 
  filters, 
  onFiltersChange, 
  availablePeople 
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<CalendarFilters>(filters);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isVisible) return null;

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    const defaultFilters: CalendarFilters = {
      view: 'month',
      dateRange: 'all',
      showCategories: Object.keys(EVENT_CATEGORIES).reduce(
        (acc, category) => ({ ...acc, [category]: true }), 
        {} as Record<EventCategory, boolean>
      ),
      showPeople: availablePeople.reduce(
        (acc, person) => ({ ...acc, [person]: true }), 
        {} as Record<string, boolean>
      ),
      searchQuery: '',
    };
    setLocalFilters(defaultFilters);
    setShowResetConfirm(false);
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  const toggleCategory = (category: EventCategory) => {
    setLocalFilters(prev => ({
      ...prev,
      showCategories: {
        ...prev.showCategories,
        [category]: !prev.showCategories[category]
      }
    }));
  };

  const togglePerson = (person: string) => {
    setLocalFilters(prev => ({
      ...prev,
      showPeople: {
        ...prev.showPeople,
        [person]: !prev.showPeople[person]
      }
    }));
  };

  const toggleAllCategories = (show: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      showCategories: Object.keys(EVENT_CATEGORIES).reduce(
        (acc, category) => ({ ...acc, [category]: show }), 
        {} as Record<EventCategory, boolean>
      )
    }));
  };

  const toggleAllPeople = (show: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      showPeople: availablePeople.reduce(
        (acc, person) => ({ ...acc, [person]: show }), 
        {} as Record<string, boolean>
      )
    }));
  };

  const selectedCategoriesCount = Object.values(localFilters.showCategories).filter(Boolean).length;
  const selectedPeopleCount = Object.values(localFilters.showPeople).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-slate-800 w-full sm:max-w-md sm:mx-4 sm:rounded-2xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filter Events</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-8">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Search Events
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={localFilters.searchQuery}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search events, locations, or people..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['today', 'tomorrow', 'week', 'month', 'all'] as DateRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setLocalFilters(prev => ({ ...prev, dateRange: range }))}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors capitalize ${
                    localFilters.dateRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-500'
                  }`}
                >
                  {range === 'all' ? 'Show All' : range}
                </button>
              ))}
            </div>
          </div>

          {/* Event Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Event Categories
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAllCategories(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Select All
                </button>
                <button
                  onClick={() => toggleAllCategories(false)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key as EventCategory)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-gray-900 dark:text-white font-medium">{category.name}</span>
                  </div>
                  {localFilters.showCategories[key as EventCategory] ? (
                    <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Circle size={20} className="text-gray-400" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {selectedCategoriesCount} of {Object.keys(EVENT_CATEGORIES).length} categories selected
            </p>
          </div>

          {/* People Filter */}
          {availablePeople.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  People
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllPeople(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => toggleAllPeople(false)}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {availablePeople.map((person) => (
                  <button
                    key={person}
                    onClick={() => togglePerson(person)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">{person}</span>
                    </div>
                    {localFilters.showPeople[person] ? (
                      <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Circle size={20} className="text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {selectedPeopleCount} of {availablePeople.length} people selected
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50">
          <div className="flex space-x-3">
            <button 
              onClick={handleReset}
              className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Reset
            </button>
            <button 
              onClick={handleApply}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isVisible={showResetConfirm}
        onClose={handleCancelReset}
        onConfirm={handleConfirmReset}
        title="Reset Calendar Filters"
        message="Are you sure you want to reset all filters to their default values? This will clear your current filter settings."
        confirmText="Reset Filters"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
} 