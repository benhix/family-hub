'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import ShoppingHeader from './components/ShoppingHeader';
import SearchBar from './components/SearchBar';
import ProgressBar from './components/ProgressBar';
import ShoppingList from './components/ShoppingList';
import CategorySection from './components/CategorySection';
import GroupedByPersonView from './components/GroupedByPersonView';
import AddItemForm from './components/AddItemForm';
import FilterModal from './components/FilterModal';
import ConfirmationModal from '../components/ConfirmationModal';
import CompletedItemsAccordion from './components/CompletedItemsAccordion';
import ItemDetailModal from './components/ItemDetailModal';
import { ShoppingItem, FilterState } from './types';
import { applyFilters, separateByCategory, groupItemsByPerson, getUniquePeople } from './utils/filterUtils';
import { useShoppingItems } from './hooks/useShoppingApi';
import { useUserDisplayName } from '../hooks/useUserDisplayName';
import { cacheCurrentUser } from '../utils/userResolver';
import { useOptimisticResolvedShoppingList } from '../hooks/useOptimisticResolvedShoppingList';
import { useActivityLogger } from '../hooks/useActivityLogger';
import { useEffect } from 'react';

export default function ShoppingPage() {
  const { user } = useUser();
  const { logShoppingActivity } = useActivityLogger();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteCompletedConfirm, setShowDeleteCompletedConfirm] = useState(false);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ShoppingItem | null>(null);
  const [completedItemToDelete, setCompletedItemToDelete] = useState<ShoppingItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Cache current user data for dynamic name resolution
  useEffect(() => {
    if (user?.id) {
      cacheCurrentUser(user.id, user);
    }
  }, [user]);
  
  // Use database instead of local state
  const { items: rawItems, loading, error, setItems } = useShoppingItems();
  
  // Use optimistic updates with name resolution
  const { items, handleToggleComplete: originalHandleToggleComplete, handleDeleteItem: originalHandleDeleteItem, handleAddItem: originalHandleAddItem } = useOptimisticResolvedShoppingList(rawItems, setItems);

  // Wrapper for handleToggleComplete with activity logging
  const handleToggleComplete = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      await originalHandleToggleComplete(id);
      if (item.completed) {
        // Item was completed, now being uncompleted
        logShoppingActivity('updated', item.item);
      } else {
        // Item was not completed, now being completed
        logShoppingActivity('completed', item.item);
      }
    }
  };

  // Wrapper for handleDeleteItem with activity logging
  const handleDeleteItem = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const result = await originalHandleDeleteItem(id);
      logShoppingActivity('deleted', item.item);
      return result;
    }
    return await originalHandleDeleteItem(id);
  };

  // Set up timer to refresh item positions when grace periods expire
  useEffect(() => {
    const recentlyCompletedItems = items.filter(item => {
      if (!item.completed || !item.completedAt) return false;
      const completedTime = new Date(item.completedAt).getTime();
      const now = Date.now();
      const timeSinceCompletion = now - completedTime;
      return timeSinceCompletion < 5000 && timeSinceCompletion >= 0;
    });

    if (recentlyCompletedItems.length > 0) {
      // Use a frequent interval to check every 100ms for smooth transitions
      const interval = setInterval(() => {
        // Check if any items should move out of grace period
        const stillInGrace = items.filter(item => {
          if (!item.completed || !item.completedAt) return false;
          const completedTime = new Date(item.completedAt).getTime();
          const now = Date.now();
          const timeSinceCompletion = now - completedTime;
          return timeSinceCompletion < 5000 && timeSinceCompletion >= 0;
        });

        // Force a refresh
        setRefreshTrigger(prev => prev + 1);

        // If no more items in grace period, we can stop polling
        if (stillInGrace.length === 0) {
          clearInterval(interval);
        }
      }, 100); // Check every 100ms for smooth experience

      return () => clearInterval(interval);
    }
  }, [items]);

  // Separate completed and active items with grace period logic
  const { activeItems, completedItems } = useMemo(() => {
    const now = Date.now();
    const gracePeriodinMs = 5000; // 5 seconds
    
    const active: ShoppingItem[] = [];
    const completed: ShoppingItem[] = [];
    
    items.forEach(item => {
      if (!item.completed) {
        // Not completed - goes to active list
        active.push(item);
      } else if (item.completedAt) {
        // Completed - check if still in grace period
        const completedTime = new Date(item.completedAt).getTime();
        const timeSinceCompletion = now - completedTime;
        
        if (timeSinceCompletion < gracePeriodinMs) {
          // Still in grace period - keep in active list but marked as completed
          active.push(item);
        } else {
          // Grace period over - move to completed list
          completed.push(item);
        }
      } else {
        // Completed but no completedAt timestamp - treat as completed
        completed.push(item);
      }
    });
    
    return { activeItems: active, completedItems: completed };
  }, [items, refreshTrigger]);

  // Get unique people for filter options (from active items only)
  const availablePeople = useMemo(() => getUniquePeople(activeItems), [activeItems]);

  // Initialize filters with all people shown
  const [filters, setFilters] = useState<FilterState>(() => ({
    sortBy: 'newest',
    viewMode: 'separated',
    searchQuery: '',
    showCategories: { grocery: true, fv: true },
    showPeople: availablePeople.reduce((acc, person) => ({ ...acc, [person]: true }), {}),
  }));

  // Update filters when people list changes
  useMemo(() => {
    setFilters(prev => ({
      ...prev,
      showPeople: {
        ...availablePeople.reduce((acc, person) => ({ ...acc, [person]: true }), {}),
        ...prev.showPeople,
      },
    }));
  }, [availablePeople]);

  // Apply filters to active items only and get processed data
  const { filteredItems, processedData } = useMemo(() => {
    const filtered = applyFilters(activeItems, filters);
    
    let processed;
    switch (filters.viewMode) {
      case 'separated':
        processed = separateByCategory(filtered);
        break;
      case 'grouped-by-person':
        processed = groupItemsByPerson(filtered);
        break;
      default:
        processed = filtered;
    }
    
    return { filteredItems: filtered, processedData: processed };
  }, [activeItems, filters]);

  // Calculate progress including today's completed items
  const { completedCount, totalCount } = useMemo(() => {
    const today = new Date().toDateString();
    
    // Get today's completed items (regardless of grace period)
    const todaysCompletedItems = items.filter(item => {
      if (!item.completed || !item.completedAt) return false;
      const completedDate = new Date(item.completedAt).toDateString();
      return completedDate === today;
    });
    
    // Apply filters to get the items we're tracking for progress
    const trackedActiveItems = applyFilters(activeItems, filters);
    
    // Total items = active items + today's completed items (avoiding duplicates)
    const allTrackedItems = [
      ...trackedActiveItems,
      ...todaysCompletedItems.filter(completed => 
        !trackedActiveItems.some(active => active.id === completed.id)
      )
    ];
    
    return {
      completedCount: todaysCompletedItems.length,
      totalCount: allTrackedItems.length
    };
  }, [items, activeItems, filters]);

  // Check if filters are active (not default state)
  const hasActiveFilters = useMemo(() => {
    const defaultFilters: FilterState = {
      sortBy: 'newest',
      viewMode: 'separated',
      searchQuery: '',
      showCategories: { grocery: true, fv: true },
      showPeople: availablePeople.reduce((acc, person) => ({ ...acc, [person]: true }), {}),
    };
    
    return (
      filters.sortBy !== defaultFilters.sortBy ||
      filters.viewMode !== defaultFilters.viewMode ||
      filters.searchQuery.trim() !== '' ||
      !filters.showCategories.grocery ||
      !filters.showCategories.fv ||
      Object.values(filters.showPeople).some(shown => !shown)
    );
  }, [filters, availablePeople]);

  // Wrapper for handleAddItem to accept notes parameter
  const handleAddItem = async (item: string, category: 'Grocery' | 'F&V', addedBy: string, addedByUserId: string, notes?: string) => {
    try {
      await originalHandleAddItem(item, category, addedBy, addedByUserId, notes);
      logShoppingActivity('added', item);
    } catch (error) {
      // Error handling is already done in the original function
      throw error;
    }
  };

  // Database operations are now handled by the useOptimisticShoppingList hook

  // Wrapper for delete confirmation
  const handleDeleteWithConfirmation = (id: string) => {
    const item = rawItems.find(item => item.id === id);
    if (item) {
      setItemToDelete(item);
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const success = await handleDeleteItem(itemToDelete.id);
      if (success) {
        setShowDeleteConfirm(false);
        setItemToDelete(null);
      }
      // Note: error handling is already done in the hook
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (searchQuery: string) => {
    setFilters(prev => ({ ...prev, searchQuery }));
  };

  // Handle undoing completion (mark as incomplete)
  const handleUndoComplete = async (id: string) => {
    await handleToggleComplete(id);
  };

  // Handle permanent deletion of completed items
  const handleDeletePermanently = async (id: string) => {
    await handleDeleteItem(id);
  };

  // Handle delete confirmation for completed items
  const handleDeleteCompletedWithConfirmation = (id: string) => {
    const item = completedItems.find(item => item.id === id);
    if (item) {
      setCompletedItemToDelete(item);
      setShowDeleteCompletedConfirm(true);
    }
  };

  const handleConfirmDeleteCompleted = async () => {
    if (completedItemToDelete) {
      await handleDeleteItem(completedItemToDelete.id);
      setShowDeleteCompletedConfirm(false);
      setCompletedItemToDelete(null);
    }
  };

  const handleCancelDeleteCompleted = () => {
    setShowDeleteCompletedConfirm(false);
    setCompletedItemToDelete(null);
  };

  // Handle item click to show details
  const handleItemClick = (item: ShoppingItem) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  };

  const handleCloseItemDetail = () => {
    setShowItemDetail(false);
    setSelectedItem(null);
  };

  // Render content based on view mode
  const renderContent = () => {
    switch (filters.viewMode) {
      case 'separated':
        const { grocery, fv } = processedData as { grocery: ShoppingItem[], fv: ShoppingItem[] };
        return (
          <div className="space-y-4">
            {filters.showCategories.grocery && (
              <CategorySection
                title="Grocery Items"
                items={grocery}
                onToggleComplete={handleToggleComplete}
                onDeleteItem={handleDeleteWithConfirmation}
                onItemClick={handleItemClick}
                categoryColor="bg-blue-500"
              />
            )}
            {filters.showCategories.fv && (
              <CategorySection
                title="Fruits & Vegetables"
                items={fv}
                onToggleComplete={handleToggleComplete}
                onDeleteItem={handleDeleteWithConfirmation}
                onItemClick={handleItemClick}
                categoryColor="bg-green-500"
              />
            )}
          </div>
        );
      
      case 'grouped-by-person':
        return (
          <GroupedByPersonView
            groupedItems={processedData as any}
            onToggleComplete={handleToggleComplete}
            onDeleteItem={handleDeleteWithConfirmation}
            onItemClick={handleItemClick}
          />
        );
      
      default:
        return (
          <ShoppingList 
            items={processedData as ShoppingItem[]}
            onToggleComplete={handleToggleComplete}
            onDeleteItem={handleDeleteWithConfirmation}
            onItemClick={handleItemClick}
          />
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-20">
        <ShoppingHeader 
          completedCount={0}
          totalCount={0}
          onAddClick={() => {}}
          onFilterClick={() => {}}
          hasActiveFilters={false}
        />
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-20">
        <ShoppingHeader 
          completedCount={0}
          totalCount={0}
          onAddClick={() => setShowAddForm(true)}
          onFilterClick={() => setShowFilterModal(true)}
          hasActiveFilters={false}
        />
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="text-red-500">⚠️</div>
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-200">Error Loading Shopping List</h3>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-4">
      <ShoppingHeader 
        completedCount={completedCount}
        totalCount={totalCount}
        onAddClick={() => setShowAddForm(true)}
        onFilterClick={() => setShowFilterModal(true)}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="max-w-md mx-auto p-4 space-y-4">
        <SearchBar 
          searchQuery={filters.searchQuery}
          onSearchChange={handleSearchChange}
        />

        <ProgressBar 
          completedCount={completedCount}
          totalCount={totalCount}
        />

        {renderContent()}

        {/* Completed Items Accordion */}
        <CompletedItemsAccordion
          completedItems={completedItems}
          onUndoComplete={handleUndoComplete}
          onDeletePermanently={handleDeleteCompletedWithConfirmation}
          onItemClick={handleItemClick}
        />
      </div>

      {/* Modal Components */}
      <AddItemForm 
        onAddItem={handleAddItem}
        isVisible={showAddForm}
        onClose={() => setShowAddForm(false)}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availablePeople={availablePeople}
      />

      <ConfirmationModal
        isVisible={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Shopping Item"
        message={`Are you sure you want to delete "${itemToDelete?.item}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmationModal
        isVisible={showDeleteCompletedConfirm}
        onClose={handleCancelDeleteCompleted}
        onConfirm={handleConfirmDeleteCompleted}
        title="Delete Completed Item"
        message={`Are you sure you want to delete "${completedItemToDelete?.item}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <ItemDetailModal
        item={selectedItem}
        isVisible={showItemDetail}
        onClose={handleCloseItemDetail}
      />
    </main>
  );
} 