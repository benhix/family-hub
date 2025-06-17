# Family Calendar System

A comprehensive shared calendar application built for families to coordinate events, track each other's schedules, and stay organized together.

## Features

### 🗓️ **Multiple Calendar Views**
- **Month View**: Traditional calendar grid with event dots
- **Week View**: 7-day horizontal layout showing events
- **Day View**: Detailed timeline with hourly slots
- **Agenda View**: List format grouped by date

### 👥 **Family Sharing**
- Events automatically tagged with creator's name from Clerk authentication
- Track who added each event
- See family members' schedules at a glance
- Attendee management for group events

### 🎯 **Event Management**
- **Rich Event Creation**: Title, description, time, location, category, color
- **All-Day Events**: Support for full-day activities
- **Event Categories**: Family, Work, Health, Sports, Social, Travel, Other
- **Color Coding**: Visual organization with custom colors
- **Location Tracking**: Know where family members will be
- **Real-time Status**: Live indicators for ongoing events

### 🔍 **Advanced Filtering & Search**
- **Smart Search**: Find events by title, description, location, or person
- **Date Range Filters**: Today, Tomorrow, Week, Month, or All
- **Category Filtering**: Show/hide specific event types
- **People Filtering**: Focus on specific family members
- **Visual Filter Indicators**: Clear indication when filters are active

### 📱 **Mobile-First Design**
- Optimized for mobile devices
- Touch-friendly interface
- Responsive design for all screen sizes
- Smooth modal interactions
- Intuitive navigation

### 🎨 **User Experience**
- **Dark Mode Support**: Automatic theme switching
- **Visual Indicators**: Live events, status badges, color coding
- **Interactive Elements**: Click days to add events, tap events for details
- **Smooth Animations**: Loading states and transitions
- **Professional UI**: Clean, modern design with consistent styling

## Technical Architecture

### 🏗️ **Component Structure**
```
app/calendar/
├── components/
│   ├── CalendarHeader.tsx      # Navigation and view controls
│   ├── MonthView.tsx          # Calendar grid with event dots
│   ├── WeekView.tsx           # 7-day horizontal layout
│   ├── DayView.tsx            # Detailed timeline view
│   ├── AgendaView.tsx         # List format with event details
│   ├── AddEventModal.tsx      # Comprehensive event creation
│   ├── FilterModal.tsx        # Advanced filtering interface
│   └── EventDetailModal.tsx   # Full event information display
├── types/
│   └── index.ts               # TypeScript interfaces and types
├── utils/
│   └── calendarUtils.ts       # Date manipulation and filtering
└── page.tsx                   # Main calendar page
```

### 📊 **Data Structure**
```typescript
interface CalendarEvent {
  id: string;                    // Unique identifier
  title: string;                 // Event name
  description?: string;          // Optional details
  startDate: Date;              // When event begins
  endDate: Date;                // When event ends
  location?: string;            // Where event takes place
  addedBy: string;              // Creator from Clerk auth
  attendees?: string[];         // Family members attending
  category: EventCategory;      // Event type
  allDay: boolean;              // Full day event flag
  color: string;                // Visual color code
  createdAt: Date;              // Creation timestamp
  updatedAt?: Date;             // Last modification
}
```

### 🔧 **Key Dependencies**
- **React 18**: Modern React with hooks
- **TypeScript**: Type safety and better development experience
- **date-fns**: Comprehensive date manipulation library
- **Clerk**: User authentication and management
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Modern icon library

### 🗄️ **MongoDB Integration Ready**
The system is designed for easy backend integration:

- **Type Definitions**: All interfaces ready for MongoDB documents
- **API Structure**: Request/response types defined
- **Data Validation**: Client-side validation ready for server sync
- **CRUD Operations**: Create, read, update, delete event handlers
- **Optimistic Updates**: Immediate UI updates with rollback capability

## Usage Examples

### Creating Events
1. Click the **+** button in the header
2. Fill out event details (title required)
3. Set date, time, and duration
4. Add location and attendees
5. Choose category and color
6. Submit to create

### Filtering Events
1. Click the **Filter** button in header
2. Use search bar for quick finding
3. Select date ranges (today, week, etc.)
4. Toggle event categories on/off
5. Show/hide specific family members
6. Apply filters to update view

### View Switching
- **Month**: Overview of entire month with event indicators
- **Week**: Detailed 7-day view with event previews
- **Day**: Hour-by-hour timeline with event details
- **Agenda**: Chronological list perfect for planning

### Event Interaction
- **Click Event Dots** (Month): View event details
- **Tap Events** (Week/Day): Open detailed information
- **Click Empty Slots**: Quick add event at that time
- **Edit/Delete**: Available in event detail modal

## Family Coordination Features

### 📍 **Location Awareness**
- See where family members will be throughout the day
- Plan pickups, meetings, and coordination
- Visual location indicators in all views

### 👨‍👩‍👧‍👦 **Member Tracking**
- Events tagged with creator automatically
- Filter by person to see individual schedules
- Attendee lists for group activities

### 🎯 **Category Organization**
- **Family**: Dinners, movie nights, vacations
- **Work**: Meetings, conferences, business trips
- **Health**: Doctor appointments, fitness activities
- **Sports**: Practice, games, tournaments
- **Social**: Parties, gatherings, outings
- **Travel**: Trips, flights, transportation
- **Other**: Miscellaneous activities

### ⚡ **Real-time Features**
- Live event indicators show what's happening now
- Current time marker in day view
- Status badges (upcoming, ongoing, completed)
- Today highlighting across all views

## Future Enhancements

### 🔄 **Backend Integration**
- MongoDB database connection
- Real-time synchronization
- Conflict resolution
- Data persistence

### 📱 **Advanced Features**
- Push notifications for upcoming events
- Recurring event support
- Calendar sharing with external users
- Import/export functionality
- Integration with other calendar systems

### 🤝 **Collaboration**
- Event approval workflows
- Comment threads on events
- Availability checking
- Meeting scheduling assistance

This calendar system provides a robust foundation for family coordination while maintaining flexibility for future enhancements and backend integration. 