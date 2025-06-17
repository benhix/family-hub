'use client';

import { useState } from 'react';
import { ChevronDown, X, Plus } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserDisplayName } from '../../hooks/useUserDisplayName';

interface AddItemFormProps {
  onAddItem: (item: string, category: 'Grocery' | 'F&V', addedBy: string, addedByUserId: string, notes?: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export default function AddItemForm({ onAddItem, isVisible, onClose }: AddItemFormProps) {
  const { user } = useUser();
  const userDisplayName = useUserDisplayName();
  const [item, setItem] = useState('');
  const [category, setCategory] = useState<'Grocery' | 'F&V'>('Grocery');
  const [notes, setNotes] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item.trim() && user?.id) {
      onAddItem(item.trim(), category, userDisplayName, user.id, notes.trim() || undefined);
      setItem('');
      setNotes('');
      setCategory('Grocery');
      setIsDropdownOpen(false);
      onClose();
    }
  };

  const handleClose = () => {
    setItem('');
    setNotes('');
    setCategory('Grocery');
    setIsDropdownOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Plus size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Item</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
              <label htmlFor="item" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Item Name *
              </label>
              <input 
                id="item"
                type="text" 
                placeholder="Enter item name..." 
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between"
                >
                  <span>{category}</span>
                  <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('Grocery');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white transition-colors"
                    >
                      Grocery
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('F&V');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white transition-colors"
                    >
                      F&V
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Added By - Auto-filled from logged in user */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Added By
              </label>
              <div className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                {userDisplayName}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Automatically filled from your account
              </p>
            </div>

            {/* Notes - Optional field */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes <span className="text-gray-400">(optional)</span>
              </label>
              <textarea 
                id="notes"
                placeholder="Add any notes about this item..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add details like brand preferences, quantity, or just tell mum how much you love her
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50">
          <div className="flex space-x-3">
            <button 
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!item.trim()}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 