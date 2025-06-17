'use client';

import { useState } from 'react';
import { ArrowLeft, User, Palette, Bell, Eye, Moon, Sun, ToggleLeft, ToggleRight, Check, Layout, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useTheme } from '../contexts/ThemeContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { useWidgetPreferences, Widget } from '../contexts/WidgetPreferencesContext';
import { getUserDisplayName } from '../shopping/utils/getUserName';

export default function SettingsPage() {
  const { user } = useUser();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { 
    useNickname, 
    setUseNickname,
    compactMode,
    setCompactMode,
    showCompletedItems,
    setShowCompletedItems,
    shoppingReminders,
    setShoppingReminders,
    calendarNotifications,
    setCalendarNotifications,
    backgroundStyle,
    setBackgroundStyle,
    loading 
  } = useUserPreferences();
  
  const {
    widgets,
    loading: widgetsLoading,
    updateWidgetVisibility,
    reorderWidgets,
    savePreferences
  } = useWidgetPreferences();

  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [touchState, setTouchState] = useState<{
    isDragging: boolean;
    draggedIndex: number | null;
    touchY: number;
    initialY: number;
  }>({
    isDragging: false,
    draggedIndex: null,
    touchY: 0,
    initialY: 0
  });

  const wallpaperOptions = [
    { id: 'default', name: 'Default Gradient', preview: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800' },
    { id: 'blue', name: 'Ocean Blue', preview: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900' },
    { id: 'green', name: 'Forest Green', preview: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900' },
    { id: 'purple', name: 'Royal Purple', preview: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900' },
    { id: 'warm', name: 'Sunset Warm', preview: 'from-orange-50 to-red-100 dark:from-orange-950 dark:to-red-900' },
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, widget: Widget) => {
    setDraggedWidget(widget);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedWidget) return;
    
    const dragIndex = widgets.findIndex(w => w.id === draggedWidget.id);
    if (dragIndex === dropIndex) return;
    
    const newWidgets = [...widgets];
    const [movedWidget] = newWidgets.splice(dragIndex, 1);
    newWidgets.splice(dropIndex, 0, movedWidget);
    
    reorderWidgets(newWidgets);
    setDraggedWidget(null);
    setDragOverIndex(null);
  };

  const handleSaveWidgetPreferences = async () => {
    setIsSaving(true);
    try {
      await savePreferences();
    } catch (error) {
      console.error('Failed to save widget preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Touch event handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    setTouchState({
      isDragging: true,
      draggedIndex: index,
      touchY: touch.clientY,
      initialY: touch.clientY
    });
    setDraggedWidget(widgets[index]);
    
    // Prevent scrolling while dragging
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchState.isDragging || touchState.draggedIndex === null) return;
    
    const touch = e.touches[0];
    setTouchState(prev => ({
      ...prev,
      touchY: touch.clientY
    }));
    
    // Calculate which widget we're hovering over
    const elements = document.querySelectorAll('[data-widget-index]');
    let newHoverIndex = null;
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      const rect = element.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        newHoverIndex = parseInt(element.getAttribute('data-widget-index') || '0');
        break;
      }
    }
    
    setDragOverIndex(newHoverIndex);
    
    // Prevent scrolling while dragging
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchState.isDragging || touchState.draggedIndex === null || dragOverIndex === null) {
      setTouchState({
        isDragging: false,
        draggedIndex: null,
        touchY: 0,
        initialY: 0
      });
      setDraggedWidget(null);
      setDragOverIndex(null);
      return;
    }
    
    const dragIndex = touchState.draggedIndex;
    const dropIndex = dragOverIndex;
    
    if (dragIndex !== dropIndex) {
      const newWidgets = [...widgets];
      const [movedWidget] = newWidgets.splice(dragIndex, 1);
      newWidgets.splice(dropIndex, 0, movedWidget);
      reorderWidgets(newWidgets);
    }
    
    setTouchState({
      isDragging: false,
      draggedIndex: null,
      touchY: 0,
      initialY: 0
    });
    setDraggedWidget(null);
    setDragOverIndex(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-20">
        {/* Header */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <div className="w-10" />
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-4">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Profile Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <User size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
          </div>

          {/* Nickname Toggle */}
          {(user?.unsafeMetadata?.nickname as string) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">Use Nickname</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Display &quot;{user?.unsafeMetadata?.nickname as string}&quot; instead of &quot;{getUserDisplayName(user, false)}&quot;
                  </p>
                </div>
                <button
                  onClick={() => setUseNickname(!useNickname)}
                  className="p-1 focus:outline-none"
                >
                  {useNickname ? (
                    <ToggleRight size={32} className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ToggleLeft size={32} className="text-gray-300 dark:text-gray-600" />
                  )}
                </button>
              </div>
              
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Currently showing:</span> {getUserDisplayName(user, useNickname)}
                </p>
              </div>
            </div>
          )}

          {/* No nickname message */}
          {!user?.unsafeMetadata?.nickname && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-medium">No nickname set.</span> You can add one in your profile settings.
              </p>
              <Link 
                href="/account-setup?edit=true"
                className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit Profile →
              </Link>
            </div>
          )}
        </div>

        {/* Home Screen Widgets */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                <Layout size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Home Screen Widgets</h2>
            </div>
            <button
              onClick={handleSaveWidgetPreferences}
              disabled={isSaving || widgetsLoading}
              className="px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Order'}
            </button>
          </div>

          {widgetsLoading ? (
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-16"></div>
              ))}
            </div>
          ) : (
            <div 
              className="space-y-3"
              style={{ 
                touchAction: touchState.isDragging ? 'none' : 'auto',
                overscrollBehavior: touchState.isDragging ? 'none' : 'auto'
              }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span className="inline-block mr-1">📱</span>
                Tap and drag to reorder • Toggle to show/hide widgets on your home screen
              </p>
              {widgets.map((widget, index) => (
                <div
                  key={widget.id}
                  data-widget-index={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-move touch-none
                    ${dragOverIndex === index ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}
                    ${draggedWidget?.id === widget.id || touchState.draggedIndex === index ? 'opacity-50' : ''}
                    ${touchState.isDragging && touchState.draggedIndex === index ? 'transform scale-105 shadow-lg' : ''}
                    hover:border-gray-300 dark:hover:border-gray-500
                  `}
                  style={touchState.isDragging && touchState.draggedIndex === index ? {
                    transform: `translateY(${touchState.touchY - touchState.initialY}px) scale(1.05)`,
                    zIndex: 1000,
                    position: 'relative'
                  } : {}}
                >
                  <div className="flex items-center space-x-3">
                    <GripVertical size={16} className="text-gray-400 dark:text-gray-500" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{widget.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{widget.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateWidgetVisibility(widget.id, !widget.visible)}
                    className="p-1 focus:outline-none ml-4"
                  >
                    {widget.visible ? (
                      <ToggleRight size={32} className="text-blue-600 dark:text-blue-400" />
                    ) : (
                      <ToggleLeft size={32} className="text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appearance Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6 relative">
          {/* Coming Soon Overlay */}
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
              Coming Soon
            </span>
          </div>
          <div className="opacity-60 pointer-events-none">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Palette size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
            </div>

          <div className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Switch between light and dark themes
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-1 focus:outline-none"
              >
                {resolvedTheme === 'dark' ? (
                  <ToggleRight size={32} className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <ToggleLeft size={32} className="text-gray-300 dark:text-gray-600" />
                )}
              </button>
            </div>

            {/* Wallpaper Selection */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Background Style</h3>
              <div className="grid grid-cols-2 gap-3">
                {wallpaperOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setBackgroundStyle(option.id)}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      backgroundStyle === option.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-full h-12 rounded bg-gradient-to-br ${option.preview} mb-2`} />
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{option.name}</p>
                    {backgroundStyle === option.id && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Coming soon - wallpaper changes will be saved to your profile
              </p>
            </div>
          </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6 relative">
          {/* Coming Soon Overlay */}
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
              Coming Soon
            </span>
          </div>
          <div className="opacity-60 pointer-events-none">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Eye size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Display</h2>
            </div>

          <div className="space-y-4">
            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Compact Mode</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Show more content with smaller spacing
                </p>
              </div>
              <button 
                onClick={() => setCompactMode(!compactMode)}
                className="p-1 focus:outline-none"
              >
                {compactMode ? (
                  <ToggleRight size={32} className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <ToggleLeft size={32} className="text-gray-300 dark:text-gray-600" />
                )}
              </button>
            </div>

            {/* Show Completed Items */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Show Completed Items</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Display checked-off items in lists
                </p>
              </div>
              <button 
                onClick={() => setShowCompletedItems(!showCompletedItems)}
                className="p-1 focus:outline-none"
              >
                {showCompletedItems ? (
                  <ToggleRight size={32} className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <ToggleLeft size={32} className="text-gray-300 dark:text-gray-600" />
                )}
              </button>
            </div>
          </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6 relative">
          {/* Coming Soon Overlay */}
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
              Coming Soon
            </span>
          </div>
          <div className="opacity-60 pointer-events-none">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <Bell size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
            </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Shopping Reminders</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get reminded about incomplete shopping items
                </p>
              </div>
              <button 
                onClick={() => setShoppingReminders(!shoppingReminders)}
                className="p-1 focus:outline-none"
              >
                {shoppingReminders ? (
                  <ToggleRight size={32} className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <ToggleLeft size={32} className="text-gray-300 dark:text-gray-600" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Calendar Events</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Notifications for upcoming family events
                </p>
              </div>
              <button 
                onClick={() => setCalendarNotifications(!calendarNotifications)}
                className="p-1 focus:outline-none"
              >
                {calendarNotifications ? (
                  <ToggleRight size={32} className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <ToggleLeft size={32} className="text-gray-300 dark:text-gray-600" />
                )}
              </button>
            </div>
          </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>App Version</span>
              <span>Beta v0.4</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span>June 2025</span>
            </div>
            <div className="pt-12 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs">
                Built by Fez Co.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 