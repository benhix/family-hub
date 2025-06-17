'use client';

import { useShoppingItems } from '@/app/shopping/hooks/useShoppingApi';
import { ShoppingCart, ClipboardList, Apple, ShoppingBag, Loader2, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useConfig } from '@/app/hooks/useConfig';

export default function ShoppingStatsWidget() {
  const { items, loading, error } = useShoppingItems();
  const { config, setNextShopDate } = useConfig();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get current display date (defaults to today if none set)
  const displayDate = config?.nextShopDate || new Date();

  const stats = useMemo(() => {
    // Only count non-completed items
    const activeItems = items.filter(item => !item.completed);
    const groceryItems = activeItems.filter(item => item.category === 'Grocery');
    const fvItems = activeItems.filter(item => item.category === 'F&V');

    return {
      total: activeItems.length,
      grocery: groceryItems.length,
      fv: fvItems.length,
    };
  }, [items]);

  const handleDateSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    await setNextShopDate(newDate);
    setShowDatePicker(false);
  };

  const StatItem = ({ icon, value, label, color }: { icon: React.ReactNode, value: number, label: string, color: string }) => (
    <div className="flex flex-col items-center justify-center text-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${color}`}>
        {icon}
      </div>
      <span className="font-bold text-lg text-gray-900 dark:text-white">{value}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-4">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      );
    }
    if (error) {
      return <p className="text-center text-red-500 py-4 text-sm">Error loading stats.</p>;
    }
    return (
      <div className="flex items-center justify-around p-3">
        <StatItem 
            icon={<ClipboardList size={16} className="text-white" />} 
            value={stats.total} 
            label="Total"
            color="bg-blue-500"
        />
        <div className="h-10 w-px bg-gray-200 dark:bg-gray-600"></div>
        <StatItem 
            icon={<ShoppingBag size={16} className="text-white" />} 
            value={stats.grocery} 
            label="Grocery"
            color="bg-orange-500"
        />
        <div className="h-10 w-px bg-gray-200 dark:bg-gray-600"></div>
        <StatItem 
            icon={<Apple size={16} className="text-white" />} 
            value={stats.fv} 
            label="F & V"
            color="bg-green-500"
        />
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 relative">
      <div className="border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/shopping" className="flex items-center gap-2 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart size={16} className="text-green-500" />
              Shopping Stats
            </h3>
          </Link>
          
          {/* Date Display and Picker */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Next shopping trip date"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">Next</span>
              <ShoppingCart size={15} className="text-gray-400 -mt-1 mr-2" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {format(displayDate, 'EEE d')}
              </span>
            </button>
            
            {showDatePicker && (
              <>
                <input
                  type="date"
                  value={format(displayDate, 'yyyy-MM-dd')}
                  onChange={handleDateSelect}
                  className="absolute top-8 right-0 z-20 px-2 py-1 text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg"
                />
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDatePicker(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>
      {renderContent()}
    </div>
  );
} 