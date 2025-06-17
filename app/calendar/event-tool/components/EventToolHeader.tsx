import Link from 'next/link';
import { LayoutGrid, List, Clock, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';

type EventViewType = 'cards' | 'list' | 'timeline' | 'calendar';

interface EventToolHeaderProps {
  stats: {
    total: number;
    upcoming: number;
    today: number;
    thisWeek: number;
  };
  viewType: EventViewType;
  onViewTypeChange: (viewType: EventViewType) => void;
}

const viewTypeIcons = {
  cards: LayoutGrid,
  list: List,
  timeline: Clock,
  calendar: Calendar,
};

const viewTypeLabels = {
  cards: 'Cards',
  list: 'List',
  timeline: 'Timeline',
  calendar: 'Calendar',
};

export default function EventToolHeader({ stats, viewType, onViewTypeChange }: EventToolHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
      {/* Title and Description */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link 
            href="/calendar"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Back to Calendar"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Event Management Hub
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 ml-11">
          Organize, search, and view all your upcoming events in one place
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</span>
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {stats.total}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Upcoming</span>
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {stats.upcoming}
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Today</span>
          </div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {stats.today}
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">This Week</span>
          </div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {stats.thisWeek}
          </div>
        </div>
      </div>

      {/* View Type Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Events
        </h2>
        
        <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
          {(Object.keys(viewTypeIcons) as EventViewType[]).map((type) => {
            const IconComponent = viewTypeIcons[type];
            const isActive = viewType === type;
            
            return (
              <button
                key={type}
                onClick={() => onViewTypeChange(type)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }
                `}
                title={viewTypeLabels[type]}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{viewTypeLabels[type]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 