import { ShoppingItem as ShoppingItemType, GroupedItems } from '../types';
import ShoppingItem from './ShoppingItem';
import { User } from 'lucide-react';

interface GroupedByPersonViewProps {
  groupedItems: GroupedItems;
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onItemClick?: (item: ShoppingItemType) => void;
}

export default function GroupedByPersonView({ groupedItems, onToggleComplete, onDeleteItem, onItemClick }: GroupedByPersonViewProps) {
  const sortedPeople = Object.keys(groupedItems).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  if (sortedPeople.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No items match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedPeople.map((person) => {
        const items = groupedItems[person];
        if (items.length === 0) return null;

        const completedCount = items.filter(item => item.completed).length;
        
        return (
          <div key={person} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <User size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{person}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {completedCount} of {items.length} completed
                </p>
              </div>
              <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              {items.map((item) => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDeleteItem}
                  onItemClick={onItemClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
} 