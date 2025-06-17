import { ShoppingItem, SortOption, FilterState, GroupedItems } from '../types';

// Sort items based on the sort option
export const sortItems = (items: ShoppingItem[], sortBy: SortOption): ShoppingItem[] => {
  const sorted = [...items];
  
  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.item.toLowerCase().localeCompare(b.item.toLowerCase()));
    case 'name-desc':
      return sorted.sort((a, b) => b.item.toLowerCase().localeCompare(a.item.toLowerCase()));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    default:
      return sorted;
  }
};

// Filter items by category
export const filterByCategory = (items: ShoppingItem[], showGrocery: boolean, showFV: boolean): ShoppingItem[] => {
  return items.filter(item => {
    if (item.category === 'Grocery' && !showGrocery) return false;
    if (item.category === 'F&V' && !showFV) return false;
    return true;
  });
};

// Filter items by people
export const filterByPeople = (items: ShoppingItem[], showPeople: Record<string, boolean>): ShoppingItem[] => {
  return items.filter(item => showPeople[item.addedBy] !== false);
};

// Group items by person and sort people alphabetically
export const groupItemsByPerson = (items: ShoppingItem[]): GroupedItems => {
  const grouped: GroupedItems = {};
  
  items.forEach(item => {
    if (!grouped[item.addedBy]) {
      grouped[item.addedBy] = [];
    }
    grouped[item.addedBy].push(item);
  });
  
  // Sort items within each person's group by name
  Object.keys(grouped).forEach(person => {
    grouped[person] = sortItems(grouped[person], 'name-asc');
  });
  
  return grouped;
};

// Get unique people from items
export const getUniquePeople = (items: ShoppingItem[]): string[] => {
  const people = Array.from(new Set(items.map(item => item.addedBy)));
  return people.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
};

// Filter items by search query (item name and added by)
export const filterBySearch = (items: ShoppingItem[], searchQuery: string): ShoppingItem[] => {
  if (!searchQuery.trim()) return items;
  
  const query = searchQuery.toLowerCase().trim();
  return items.filter(item => 
    item.item.toLowerCase().includes(query) || 
    item.addedBy.toLowerCase().includes(query)
  );
};

// Apply all filters and sorting
export const applyFilters = (items: ShoppingItem[], filters: FilterState): ShoppingItem[] => {
  let filtered = items;
  
  // Filter by search query
  filtered = filterBySearch(filtered, filters.searchQuery);
  
  // Filter by categories
  filtered = filterByCategory(filtered, filters.showCategories.grocery, filters.showCategories.fv);
  
  // Filter by people
  filtered = filterByPeople(filtered, filters.showPeople);
  
  // Sort items
  filtered = sortItems(filtered, filters.sortBy);
  
  return filtered;
};

// Separate items by category
export const separateByCategory = (items: ShoppingItem[]): { grocery: ShoppingItem[], fv: ShoppingItem[] } => {
  const grocery = items.filter(item => item.category === 'Grocery');
  const fv = items.filter(item => item.category === 'F&V');
  
  return { grocery, fv };
}; 