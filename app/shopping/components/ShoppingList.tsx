import ShoppingItem from './ShoppingItem';
import { ShoppingItem as ShoppingItemType } from '../types';

interface ShoppingListProps {
  items: ShoppingItemType[];
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onItemClick?: (item: ShoppingItemType) => void;
}

export default function ShoppingList({ items, onToggleComplete, onDeleteItem, onItemClick }: ShoppingListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items to Buy</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No items in your shopping list yet.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add some items to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items to Buy</h2>
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
} 