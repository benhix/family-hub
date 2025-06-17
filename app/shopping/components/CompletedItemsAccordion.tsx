'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, RotateCcw, Trash2, FileText, Clock } from 'lucide-react';
import { ShoppingItem } from '../types';
import { useResolveUserName } from '../../hooks/useResolveUserName';

interface CompletedItemsAccordionProps {
  completedItems: ShoppingItem[];
  onUndoComplete: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onItemClick?: (item: ShoppingItem) => void;
}

interface GroupedCompletedItems {
  [date: string]: ShoppingItem[];
}

export default function CompletedItemsAccordion({ 
  completedItems, 
  onUndoComplete, 
  onDeletePermanently,
  onItemClick 
}: CompletedItemsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every minute to keep countdown accurate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // All items passed to this component should already be past the grace period
  // since the main page filters them. We can simplify the logic here.
  const visibleCompletedItems = completedItems;

  // Group items by completion date
  const groupedItems: GroupedCompletedItems = useMemo(() => {
    const groups: GroupedCompletedItems = {};
    
    visibleCompletedItems.forEach(item => {
      if (!item.completedAt) return;
      
      const completedDate = new Date(item.completedAt);
      const dateKey = completedDate.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    
    // Sort items within each group by completion time (newest first)
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      });
    });
    
    return groups;
  }, [visibleCompletedItems]);

  // Sort dates (newest first)
  const sortedDates = useMemo(() => {
    return Object.keys(groupedItems).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [groupedItems]);

  // Auto-delete items older than 2 weeks (14 days)
  useEffect(() => {
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000; // 2 weeks in milliseconds
    const twoWeeksAgo = Date.now() - twoWeeksInMs;
    
    completedItems.forEach(item => {
      if (item.completedAt && new Date(item.completedAt).getTime() < twoWeeksAgo) {
        onDeletePermanently(item.id);
      }
    });
  }, [completedItems, onDeletePermanently]);

  const formatCountdown = (completedAt: string) => {
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000; // 2 weeks in milliseconds
    const completedTime = new Date(completedAt).getTime();
    const deletionTime = completedTime + twoWeeksInMs;
    const timeRemaining = deletionTime - currentTime;

    if (timeRemaining <= 0) {
      return 'Auto-deleting soon...';
    }

    const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} left`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    } else {
      const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
      return `${Math.max(1, minutes)} min left`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const totalCompletedCount = visibleCompletedItems.length;

  if (totalCompletedCount === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors rounded-t-xl"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <span className="text-green-600 dark:text-green-400">✓</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Completed Items
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalCompletedCount} item{totalCompletedCount !== 1 ? 's' : ''} done
            </p>
          </div>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {sortedDates.map(date => (
            <div key={date} className="p-4 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {formatDate(date)}
              </h4>
              <div className="space-y-2">
                {groupedItems[date].map(item => (
                  <CompletedItem
                    key={item.id}
                    item={item}
                    onUndo={() => onUndoComplete(item.id)}
                    onDelete={() => onDeletePermanently(item.id)}
                    onItemClick={onItemClick}
                    formatTime={formatTime}
                    formatCountdown={formatCountdown}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CompletedItemProps {
  item: ShoppingItem;
  onUndo: () => void;
  onDelete: () => void;
  onItemClick?: (item: ShoppingItem) => void;
  formatTime: (date: Date) => string;
  formatCountdown: (completedAt: string) => string;
}

function CompletedItem({ item, onUndo, onDelete, onItemClick, formatTime, formatCountdown }: CompletedItemProps) {
  const resolvedName = useResolveUserName(item.addedByUserId, item.addedBy);
  
  const categoryColor = item.category === 'Grocery' 
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm">✓</span>
      </div>
      
      <div 
        className="flex-1 min-w-0 cursor-pointer" 
        onClick={handleItemClick}
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-500 dark:text-gray-400 line-through truncate">
            {item.item}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
            {item.category}
          </span>
          {item.notes && (
            <div className="flex items-center justify-center w-4 h-4 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
              <FileText size={10} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
          <span>by {resolvedName}</span>
          {item.completedAt && (
            <span>• {formatTime(new Date(item.completedAt))}</span>
          )}
          {item.completedAt && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                <Clock size={10} />
                <span>{formatCountdown(item.completedAt.toISOString())}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={onUndo}
          className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
          title="Undo completion"
        >
          <RotateCcw size={14} className="text-blue-500" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          title="Delete permanently"
        >
          <Trash2 size={14} className="text-red-500" />
        </button>
      </div>
    </div>
  );
} 