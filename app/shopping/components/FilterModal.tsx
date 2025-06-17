'use client';

import { useState } from 'react';
import { X, Filter, ChevronDown, Check } from 'lucide-react';
import { FilterState, SortOption, ViewMode } from '../types';
import ConfirmationModal from '../../components/ConfirmationModal';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availablePeople: string[];
}

export default function FilterModal({ isOpen, onClose, filters, onFiltersChange, availablePeople }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
  ];

  const viewOptions: { value: ViewMode; label: string }[] = [
    { value: 'combined', label: 'All Items Together' },
    { value: 'separated', label: 'Separate by Category' },
    { value: 'grouped-by-person', label: 'Group by Person' },
  ];

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    const resetFilters: FilterState = {
      sortBy: 'newest',
      viewMode: 'combined',
      searchQuery: '',
      showCategories: { grocery: true, fv: true },
      showPeople: availablePeople.reduce((acc, person) => ({ ...acc, [person]: true }), {}),
    };
    setLocalFilters(resetFilters);
    setShowResetConfirm(false);
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  const togglePerson = (person: string) => {
    setLocalFilters(prev => ({
      ...prev,
      showPeople: {
        ...prev.showPeople,
        [person]: !prev.showPeople[person],
      },
    }));
  };

  const toggleAllPeople = (show: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      showPeople: availablePeople.reduce((acc, person) => ({ ...acc, [person]: show }), {}),
    }));
  };

  const selectedSort = sortOptions.find(opt => opt.value === localFilters.sortBy);
  const selectedView = viewOptions.find(opt => opt.value === localFilters.viewMode);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-t-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter size={20} />
            Filter & Sort
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <div className="relative">
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-left flex items-center justify-between"
              >
                <span className="text-gray-900 dark:text-white">{selectedSort?.label}</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {sortDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setLocalFilters(prev => ({ ...prev, sortBy: option.value }));
                        setSortDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white flex items-center justify-between"
                    >
                      <span>{option.label}</span>
                      {localFilters.sortBy === option.value && <Check size={16} className="text-green-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              View Mode
            </label>
            <div className="relative">
              <button
                onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
                className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-left flex items-center justify-between"
              >
                <span className="text-gray-900 dark:text-white">{selectedView?.label}</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${viewDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {viewDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                  {viewOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setLocalFilters(prev => ({ ...prev, viewMode: option.value }));
                        setViewDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white flex items-center justify-between"
                    >
                      <span>{option.label}</span>
                      {localFilters.viewMode === option.value && <Check size={16} className="text-green-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={localFilters.showCategories.grocery}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    showCategories: { ...prev.showCategories, grocery: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-gray-900 dark:text-white">Grocery</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={localFilters.showCategories.fv}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    showCategories: { ...prev.showCategories, fv: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-gray-900 dark:text-white">F&V</span>
              </label>
            </div>
          </div>

          {/* People Filter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Items By</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleAllPeople(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  All
                </button>
                <button
                  onClick={() => toggleAllPeople(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  None
                </button>
              </div>
            </div>
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {availablePeople.map((person) => (
                <label key={person} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={localFilters.showPeople[person] !== false}
                    onChange={() => togglePerson(person)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-gray-900 dark:text-white">{person}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <ConfirmationModal
        isVisible={showResetConfirm}
        onClose={handleCancelReset}
        onConfirm={handleConfirmReset}
        title="Reset Shopping Filters"
        message="Are you sure you want to reset all filters to their default values? This will clear your current filter settings."
        confirmText="Reset Filters"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
} 