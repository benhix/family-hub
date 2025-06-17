import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface EventToolSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function EventToolSearch({ searchQuery, onSearchChange }: EventToolSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
      <div className="relative">
        <div className={`
          flex items-center gap-3 p-3 rounded-lg border-2 transition-all
          ${isFocused 
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700'
          }
        `}>
          <Search className={`w-5 h-5 transition-colors ${
            isFocused ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
          }`} />
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search events by title, description, location, or creator..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Search Tips */}
        {isFocused && !searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Search Tips
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Search by event title: &quot;Birthday party&quot;</li>
              <li>• Search by location: &quot;Central Park&quot;</li>
              <li>• Search by description: &quot;Meeting with team&quot;</li>
              <li>• Search by creator: &quot;John Doe&quot;</li>
            </ul>
          </div>
        )}
      </div>

      {/* Active Search Indicator */}
      {searchQuery && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Searching for:
          </span>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-medium">
            &quot;{searchQuery}&quot;
          </span>
          <button
            onClick={handleClearSearch}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
} 