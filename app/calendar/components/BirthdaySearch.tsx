'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { Birthday, BirthdayFilters } from '../types/birthday';

interface BirthdaySearchProps {
  birthdays: Birthday[];
  onFilteredResults: (filtered: Birthday[]) => void;
  className?: string;
}

export default function BirthdaySearch({ birthdays, onFilteredResults, className = '' }: BirthdaySearchProps) {
  const [filters, setFilters] = useState<BirthdayFilters>({
    searchQuery: '',
    month: undefined,
    sortBy: 'date',
    sortOrder: 'asc'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter and sort birthdays
  const filteredBirthdays = useMemo(() => {
    let filtered = [...birthdays];

    // Search by name
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(birthday =>
        birthday.name.toLowerCase().includes(query) ||
        birthday.notes?.toLowerCase().includes(query)
      );
    }

    // Filter by month
    if (filters.month !== undefined) {
      filtered = filtered.filter(birthday => 
        birthday.birthDate.getMonth() + 1 === filters.month
      );
    }

    // Sort birthdays
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          // Sort by month and day only (ignore year)
          aValue = a.birthDate.getMonth() * 100 + a.birthDate.getDate();
          bValue = b.birthDate.getMonth() * 100 + b.birthDate.getDate();
          break;
        case 'age':
          // Sort by age (if available)
          if (a.originalYear && b.originalYear) {
            aValue = a.originalYear;
            bValue = b.originalYear;
            // For age, reverse the order (older = higher value)
            if (filters.sortOrder === 'asc') {
              return bValue - aValue;
            } else {
              return aValue - bValue;
            }
          } else {
            // If no age data, fallback to name
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
          }
          break;
        default:
          aValue = a.birthDate.getMonth() * 100 + a.birthDate.getDate();
          bValue = b.birthDate.getMonth() * 100 + b.birthDate.getDate();
      }

      if (filters.sortBy !== 'age') {
        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [birthdays, filters]);

  // Update parent component when results change
  React.useEffect(() => {
    onFilteredResults(filteredBirthdays);
  }, [filteredBirthdays, onFilteredResults]);

  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleMonthChange = (month: number | undefined) => {
    setFilters(prev => ({ ...prev, month }));
  };

  const handleSortChange = (sortBy: BirthdayFilters['sortBy']) => {
    setFilters(prev => ({ 
      ...prev, 
      sortBy,
      // Toggle order if same sort type selected
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      month: undefined,
      sortBy: 'date',
      sortOrder: 'asc'
    });
  };

  const hasActiveFilters = filters.searchQuery.trim() || filters.month !== undefined;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search birthdays by name..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-1 rounded-md transition-colors ${
              showAdvanced ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg space-y-3">
          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Month
            </label>
            <select
              value={filters.month || ''}
              onChange={(e) => handleMonthChange(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">All months</option>
              {monthNames.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort by
            </label>
            <div className="flex gap-2">
              {[
                { key: 'date' as const, label: 'Date' },
                { key: 'name' as const, label: 'Name' },
                { key: 'age' as const, label: 'Age' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSortChange(key)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filters.sortBy === key
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600'
                  }`}
                >
                  {label}
                  {filters.sortBy === key && (
                    <span className="ml-1 text-xs">
                      {filters.sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          {filteredBirthdays.length} of {birthdays.length} birthdays
          {hasActiveFilters && ' (filtered)'}
        </span>
        {filters.month && (
          <span className="text-blue-600 dark:text-blue-400">
            📅 {monthNames[filters.month - 1]}
          </span>
        )}
      </div>
    </div>
  );
} 