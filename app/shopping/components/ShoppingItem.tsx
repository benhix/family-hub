import { Check, X, FileText } from 'lucide-react';
import { ShoppingItem as ShoppingItemType } from '../types';

interface ShoppingItemProps {
  item: ShoppingItemType;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onItemClick?: (item: ShoppingItemType) => void;
}

export default function ShoppingItem({ item, onToggleComplete, onDelete, onItemClick }: ShoppingItemProps) {
  const categoryColor = item.category === 'Grocery' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div className={`flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg ${item.completed ? 'opacity-60' : ''}`}>
      <button 
        onClick={() => onToggleComplete(item.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          item.completed 
            ? 'bg-green-500 border-green-500' 
            : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
        }`}
      >
        {item.completed && <Check size={14} className="text-white" />}
      </button>
      <div 
        className="flex-1 cursor-pointer" 
        onClick={handleItemClick}
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-medium ${item.completed 
            ? 'line-through text-gray-500 dark:text-gray-400' 
            : 'text-gray-900 dark:text-white'
          }`}>
            {item.item}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
            {item.category}
          </span>
          {item.notes && (
            <div className="flex items-center justify-center w-5 h-5 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
              <FileText size={12} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Added by {item.addedBy}</p>
      </div>
      <button 
        onClick={() => onDelete(item.id)}
        className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
      >
        <X size={16} className="text-red-500" />
      </button>
    </div>
  );
} 