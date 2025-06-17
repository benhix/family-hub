import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Plus, Filter } from 'lucide-react';

interface ShoppingHeaderProps {
  completedCount: number;
  totalCount: number;
  onAddClick: () => void;
  onFilterClick: () => void;
  hasActiveFilters?: boolean;
}

export default function ShoppingHeader({ completedCount, totalCount, onAddClick, onFilterClick, hasActiveFilters = false }: ShoppingHeaderProps) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <ShoppingCart size={24} className="text-green-500" />
              Shopping List
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {completedCount} of {totalCount} items completed
            </p>
          </div>
                      <div className="flex items-center gap-1">
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
                onClick={onAddClick}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Plus size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
        </div>
      </div>
    </div>
  );
} 