'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

export interface Widget {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  order: number;
}

interface WidgetPreferencesContextType {
  widgets: Widget[];
  loading: boolean;
  updateWidgetVisibility: (widgetId: string, visible: boolean) => void;
  reorderWidgets: (widgets: Widget[]) => void;
  savePreferences: () => Promise<void>;
}

const WidgetPreferencesContext = createContext<WidgetPreferencesContextType | undefined>(undefined);

const defaultWidgets: Widget[] = [
  {
    id: 'upcoming-events',
    name: 'Upcoming Events',
    description: 'Shows upcoming family calendar events',
    visible: true,
    order: 0
  },
  {
    id: 'shopping-stats',
    name: 'Shopping Stats',
    description: 'Overview of shopping list progress',
    visible: true,
    order: 1
  },
  {
    id: 'pet-feeding',
    name: 'Pet Feeding',
    description: 'Track pet feeding status',
    visible: true,
    order: 2
  },
  {
    id: 'work-tracking',
    name: 'Work Week',
    description: 'Track your Monday-Friday work location',
    visible: true,
    order: 3
  },
  {
    id: 'dashboard-grid',
    name: 'App Grid',
    description: 'Quick access to all family apps',
    visible: true,
    order: 4
  },
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Report issues with the app',
    visible: true,
    order: 5
  },
  {
    id: 'ideas',
    name: 'Ideas',
    description: 'Submit suggestions and ideas',
    visible: true,
    order: 6
  },
  {
    id: 'activity-log',
    name: 'Activity Log',
    description: 'Recent family activity updates',
    visible: true,
    order: 7
  }
];

export function WidgetPreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    try {
      const response = await fetch(`/api/user-preferences?type=widgets`);
      if (response.ok) {
        const data = await response.json();
        if (data.widgetPreferences) {
          // Merge saved preferences with default widgets
          const savedWidgets = JSON.parse(data.widgetPreferences);
          const mergedWidgets = defaultWidgets.map(defaultWidget => {
            const savedWidget = savedWidgets.find((w: Widget) => w.id === defaultWidget.id);
            return savedWidget ? { ...defaultWidget, ...savedWidget } : defaultWidget;
          });
          
          // Sort by order
          mergedWidgets.sort((a, b) => a.order - b.order);
          setWidgets(mergedWidgets);
        }
      }
    } catch (error) {
      console.error('Error loading widget preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWidgetVisibility = (widgetId: string, visible: boolean) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId ? { ...widget, visible } : widget
      )
    );
  };

  const reorderWidgets = (reorderedWidgets: Widget[]) => {
    const updatedWidgets = reorderedWidgets.map((widget, index) => ({
      ...widget,
      order: index
    }));
    setWidgets(updatedWidgets);
  };

  const savePreferences = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'widgets',
          widgetPreferences: JSON.stringify(widgets),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save widget preferences');
      }
    } catch (error) {
      console.error('Error saving widget preferences:', error);
      throw error;
    }
  };

  return (
    <WidgetPreferencesContext.Provider
      value={{
        widgets,
        loading,
        updateWidgetVisibility,
        reorderWidgets,
        savePreferences,
      }}
    >
      {children}
    </WidgetPreferencesContext.Provider>
  );
}

export function useWidgetPreferences() {
  const context = useContext(WidgetPreferencesContext);
  if (context === undefined) {
    throw new Error('useWidgetPreferences must be used within a WidgetPreferencesProvider');
  }
  return context;
} 