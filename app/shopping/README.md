# Shopping List Module

A fully functional shopping list component with category support and beautiful UI.

## Features

- ✅ Add, complete, and delete shopping items
- ✅ Category selection (Grocery or F&V)
- ✅ Auto-filled user names from Clerk authentication
- ✅ **Advanced Filtering & Sorting:**
  - Real-time search by item name and person
  - Sort by name (A-Z, Z-A), date (newest/oldest)
  - Separate view by category (Grocery vs F&V)
  - Group by person with individual progress tracking
  - Filter by category and person visibility
- ✅ Mobile-first modal system (filter and add item)
- ✅ Progress tracking (overall and per-person)
- ✅ Responsive design with dark mode support
- ✅ Component-based architecture for reusability

## Component Structure

```
app/shopping/
├── page.tsx                    # Main shopping page with state management
├── components/
│   ├── ShoppingHeader.tsx      # Header with navigation, add and filter buttons
│   ├── SearchBar.tsx           # Real-time search component
│   ├── ProgressBar.tsx         # Progress visualization
│   ├── ShoppingList.tsx        # List container component
│   ├── ShoppingItem.tsx        # Individual item component
│   ├── AddItemForm.tsx         # Form for adding new items
│   ├── FilterModal.tsx         # Mobile filter & sort modal
│   ├── CategorySection.tsx     # Category-separated view component
│   └── GroupedByPersonView.tsx # Person-grouped view component
├── types/
│   └── index.ts               # TypeScript interfaces (+ filtering types)
├── utils/
│   ├── getUserName.ts         # Clerk user name utility
│   └── filterUtils.ts         # Filtering and sorting utilities
└── README.md
```

## Data Structure

The shopping items use a structured format ready for MongoDB integration:

```typescript
interface ShoppingItem {
  id: string;           // Will become MongoDB ObjectId
  item: string;         // Item name
  completed: boolean;   // Completion status
  addedBy: string;      // User who added the item
  category: 'Grocery' | 'F&V';  // Item category
  createdAt: Date;      // Creation timestamp
  updatedAt?: Date;     // Last update timestamp
}
```

## MongoDB Integration Plan

To connect this to MongoDB, you'll need to:

1. **Create API Routes** (`app/api/shopping/...`):
   - `GET /api/shopping` - Fetch all items
   - `POST /api/shopping` - Create new item
   - `PATCH /api/shopping/[id]` - Update item (toggle complete, edit)
   - `DELETE /api/shopping/[id]` - Delete item

2. **Database Schema** (MongoDB/Mongoose):
   ```javascript
   const shoppingItemSchema = {
     item: { type: String, required: true },
     completed: { type: Boolean, default: false },
     addedBy: { type: String, required: true },
     category: { type: String, enum: ['Grocery', 'F&V'], required: true },
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date }
   };
   ```

3. **Replace State Management**:
   - Replace `useState` with API calls
   - Add loading states and error handling
   - Implement optimistic updates for better UX

4. **Add Real-time Updates** (Optional):
   - WebSocket or Server-Sent Events for live updates
   - Perfect for family collaboration

## Advanced Filtering Features

### Real-Time Search
- **Item Search**: Find items by typing part of the item name
- **Person Search**: Find items by typing part of the person's name who added them
- **Combined Search**: Search works across both item names and people
- **Instant Results**: Filtering happens as you type
- **Clear Function**: Quick clear button to reset search

### View Modes
1. **Combined View**: All items in a single list
2. **Separated by Category**: Grocery and F&V items in separate sections
3. **Grouped by Person**: Items grouped by who added them, with individual progress bars

### Sorting Options
- **Name (A-Z)**: Alphabetical order
- **Name (Z-A)**: Reverse alphabetical order
- **Newest First**: Most recently added items first
- **Oldest First**: Oldest items first

### Filtering Options
- **Category Filter**: Show/hide Grocery or F&V items
- **Person Filter**: Show/hide items by specific family members
- **Bulk Actions**: Select all/none for people filters

### Mobile-First Design
- **Modal System**: Both filter and add item forms open as overlay modals
- **Filter Modal**: Slides up from bottom with touch-friendly controls
- **Add Item Modal**: Center overlay with beautiful form design
- **Touch-Optimized**: Large touch targets and smooth interactions
- **Visual Indicators**: Active filter states and loading feedback
- **Backdrop Blur**: Modern blur effects for better focus

## Current State

The frontend is fully functional with:
- Local state management with advanced filtering
- All CRUD operations working
- Clerk authentication integration (auto-filled user names)
- Multiple view modes and sorting options
- Beautiful, responsive UI with mobile-first modal system
- Category support with visual indicators
- Progress tracking (overall and per-person)
- Streamlined interface without bottom quick-add clutter

Ready for backend integration without any frontend changes needed!

## Clerk Integration

The shopping list now automatically pulls the user's name from their Clerk account:
- Uses `fullName` if available
- Falls back to `firstName + lastName` from `unsafeMetadata`
- Falls back to `nickname` if provided
- Falls back to email username as last resort
- All new items are automatically attributed to the logged-in user 