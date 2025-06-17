import { ShoppingItem as ShoppingItemType } from '../types';
import ShoppingItem from './ShoppingItem';

interface CategorySectionProps {
  title: string;
  items: ShoppingItemType[];
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onItemClick?: (item: ShoppingItemType) => void;
  categoryColor: string;
}

export default function CategorySection({ title, items, onToggleComplete, onDeleteItem, onItemClick, categoryColor }: CategorySectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${categoryColor}`} />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">({items.length} items)</span>
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
} 