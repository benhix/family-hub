'use client';

import { X, FileText, User, Calendar, Tag } from 'lucide-react';
import { ShoppingItem } from '../types';

interface ItemDetailModalProps {
  item: ShoppingItem | null;
  isVisible: boolean;
  onClose: () => void;
}

export default function ItemDetailModal({ item, isVisible, onClose }: ItemDetailModalProps) {
  if (!isVisible || !item) return null;

  const categoryColor = item.category === 'Grocery' 
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
              <FileText size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Item Details</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Item Name */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {item.item}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor}`}>
                <Tag size={14} className="inline mr-1" />
                {item.category}
              </span>
              {item.completed && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  ✓ Completed
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          {item.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FileText size={16} />
                Notes
              </h4>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {item.notes}
                </p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <User size={16} />
              <span>Added by <strong className="text-gray-900 dark:text-white">{item.addedBy}</strong></span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Calendar size={16} />
              <span>Added on <strong className="text-gray-900 dark:text-white">{formatDate(item.createdAt)}</strong></span>
            </div>

            {item.completedAt && (
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} />
                <span>Completed on <strong className="text-gray-900 dark:text-white">{formatDate(item.completedAt)}</strong></span>
              </div>
            )}

            {/* {item.priority && (
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="capitalize">Priority: <strong className="text-gray-900 dark:text-white">{item.priority}</strong></span>
              </div>
            )} */}

            {/* {item.quantity && (
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span>Quantity: <strong className="text-gray-900 dark:text-white">{item.quantity}</strong></span>
              </div>
            )} */}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50">
          <button 
            onClick={onClose}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 