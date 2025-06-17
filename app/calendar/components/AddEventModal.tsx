'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Edit, Calendar, MapPin, Users, Clock, Tag, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { CalendarEvent, EventCategory, EVENT_CATEGORIES } from '../types';
import { useUserDisplayName } from '../../hooks/useUserDisplayName';

interface AddEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditEvent?: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent?: (event: CalendarEvent) => void;
  availablePeople: string[];
  selectedDate?: Date;
  editEvent?: CalendarEvent | null; // Event to edit (null for add mode)
}

export default function AddEventModal({ 
  isVisible, 
  onClose, 
  onAddEvent, 
  onEditEvent,
  onDeleteEvent,
  availablePeople, 
  selectedDate,
  editEvent 
}: AddEventModalProps) {
  const { user } = useUser();
  const userDisplayName = useUserDisplayName();
  const isEditMode = !!editEvent;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    endTime: '10:00',
    location: '',
    category: 'family' as EventCategory,
    customCategory: '',
    allDay: false,
    attendees: [] as string[],
    useCustomName: false,
    customName: '',
  });

  const [validationErrors, setValidationErrors] = useState({
    timeConflict: false,
    pastDate: false,
    customNameRequired: false,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState({
    category: false,
    attendees: false,
    location: false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const commonLocations = [
    '🏠 Home',
    '🏢 Office',
    '🏥 Hospital',
    '🏫 School',
    '🛒 Store',
    '🍽️ Restaurant',
    '🎬 Movie Theater',
    '🏃‍♂️ Gym',
  ];

  // Helper function to capitalize each word
  const capitalizeWords = (str: string) => {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper function to capitalize single word and prevent spaces
  const capitalizeSingleWord = (str: string) => {
    // Remove any spaces and capitalize first letter
    const cleanStr = str.replace(/\s+/g, '');
    return cleanStr.charAt(0).toUpperCase() + cleanStr.slice(1).toLowerCase();
  };

  // Populate form data when editing
  useEffect(() => {
    if (editEvent && isVisible) {
      const startDate = editEvent.startDate instanceof Date ? editEvent.startDate : new Date(editEvent.startDate);
      const endDate = editEvent.endDate instanceof Date ? editEvent.endDate : new Date(editEvent.endDate);
      
      // Detect if this event was created with a custom name
      const hasCustomName = editEvent.useCustomCreator || false;
      
      setFormData({
        title: editEvent.title,
        description: editEvent.description || '',
        startDate: format(startDate, 'yyyy-MM-dd'),
        startTime: editEvent.allDay ? '09:00' : format(startDate, 'HH:mm'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        endTime: editEvent.allDay ? '10:00' : format(endDate, 'HH:mm'),
        location: editEvent.location || '',
        category: editEvent.category,
        customCategory: editEvent.category === 'custom' ? editEvent.description?.split('\n')[0] || '' : '',
        allDay: editEvent.allDay,
        attendees: editEvent.attendees || [],
        useCustomName: hasCustomName,
        customName: hasCustomName ? (editEvent.customCreatorName || '') : '',
      });
    } else if (!editEvent && isVisible) {
      // Reset for add mode - always default to today or selected date
      const defaultDate = selectedDate || new Date();
      const currentTime = new Date();
      const nextHour = new Date(currentTime.getTime() + (60 * 60 * 1000)); // Add 1 hour
      
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        startDate: format(defaultDate, 'yyyy-MM-dd'),
        startTime: format(currentTime, 'HH:mm'),
        endDate: format(defaultDate, 'yyyy-MM-dd'),
        endTime: format(nextHour, 'HH:mm'),
        location: '',
        category: 'family',
        customCategory: '',
        allDay: false,
        attendees: [],
        useCustomName: false,
        customName: '',
      }));
    }
  }, [editEvent, selectedDate, isVisible]);

  // Validate form data
  useEffect(() => {
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`);
    const now = new Date();
    
    setValidationErrors({
      timeConflict: !formData.allDay && startDateTime >= endDateTime,
      pastDate: endDateTime < now && format(endDateTime, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd'),
      customNameRequired: formData.useCustomName && !formData.customName.trim(),
    });
  }, [formData]);

  // Auto-adjust end time when start time changes
  const handleStartTimeChange = (newStartTime: string) => {
    if (!isEditMode) { // Only auto-adjust for new events
      const [hours, minutes] = newStartTime.split(':').map(Number);
      let endHours = hours + 1; // Default to 1 hour duration
      
      // Handle day rollover
      if (endHours >= 24) {
        endHours = 23;
        const endTime = '59'; // End at 11:59 PM
        setFormData(prev => ({
          ...prev,
          startTime: newStartTime,
          endTime: `${endHours}:${endTime}`,
        }));
      } else {
        const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        setFormData(prev => ({
          ...prev,
          startTime: newStartTime,
          endTime: endTime,
        }));
      }
    } else {
      // For editing, just update start time
      setFormData(prev => ({
        ...prev,
        startTime: newStartTime,
      }));
    }
  };

  // Auto-adjust end date when start date changes
  const handleStartDateChange = (newStartDate: string) => {
    setFormData(prev => ({
      ...prev,
      startDate: newStartDate,
      // If end date is before start date, update it to match
      endDate: prev.endDate < newStartDate ? newStartDate : prev.endDate,
    }));
  };

  if (!isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (formData.category === 'custom' && !formData.customCategory.trim()) return;
    if (formData.useCustomName && !formData.customName.trim()) return;

    const startDateTime = formData.allDay 
      ? new Date(`${formData.startDate}T00:00:00`)
      : new Date(`${formData.startDate}T${formData.startTime}:00`);
    
    const endDateTime = formData.allDay 
      ? new Date(`${formData.endDate}T23:59:59`)
      : new Date(`${formData.endDate}T${formData.endTime}:00`);

    if (isEditMode && editEvent && onEditEvent) {
      // Edit existing event
      // Handle custom category
      const finalCategory = formData.category;
      const finalDescription = formData.category === 'custom' && formData.customCategory.trim()
        ? `${capitalizeWords(formData.customCategory.trim())}\n${formData.description.trim()}`
        : formData.description.trim() || undefined;

      const updates: Partial<CalendarEvent> = {
        title: formData.title.trim(),
        description: finalDescription,
        startDate: startDateTime,
        endDate: endDateTime,
        location: formData.location.trim() || undefined,
        addedBy: userDisplayName, // Always use the actual creator's name
        addedByUserId: user?.id,
        customCreatorName: formData.useCustomName ? capitalizeSingleWord(formData.customName) : undefined,
        useCustomCreator: formData.useCustomName,
        attendees: formData.attendees,
        category: finalCategory,
        allDay: formData.allDay,
        color: EVENT_CATEGORIES[finalCategory].color,
      };
      
      onEditEvent(editEvent.id, updates);
    } else {
      // Add new event
      // Handle custom category
      const finalCategory = formData.category;
      const finalDescription = formData.category === 'custom' && formData.customCategory.trim()
        ? `${capitalizeWords(formData.customCategory.trim())}\n${formData.description.trim()}`
        : formData.description.trim() || undefined;

      const newEvent: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title.trim(),
        description: finalDescription,
        startDate: startDateTime,
        endDate: endDateTime,
        location: formData.location.trim() || undefined,
        addedBy: userDisplayName, // Always use the actual creator's name
        addedByUserId: user?.id,
        customCreatorName: formData.useCustomName ? capitalizeSingleWord(formData.customName) : undefined,
        useCustomCreator: formData.useCustomName,
        attendees: formData.attendees,
        category: finalCategory,
        allDay: formData.allDay,
        color: EVENT_CATEGORIES[finalCategory].color,
      };

      onAddEvent(newEvent);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endDate: format(new Date(), 'yyyy-MM-dd'),
      endTime: '10:00',
      location: '',
      category: 'family',
      customCategory: '',
      allDay: false,
      attendees: [],
      useCustomName: false,
      customName: '',
    });
    setIsDropdownOpen({ category: false, attendees: false, location: false });
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (editEvent && onDeleteEvent) {
      onDeleteEvent(editEvent);
      handleClose();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const toggleAttendee = (person: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(person)
        ? prev.attendees.filter(p => p !== person)
        : [...prev.attendees, person]
    }));
  };

  const toggleDropdown = (dropdown: keyof typeof isDropdownOpen) => {
    setIsDropdownOpen(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-auto max-h-[90vh] min-h-[60vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isEditMode 
                ? 'bg-orange-100 dark:bg-orange-900/20' 
                : 'bg-blue-100 dark:bg-blue-900/20'
            }`}>
              {isEditMode ? (
                <Edit size={20} className="text-orange-600 dark:text-orange-400" />
              ) : (
                <Plus size={20} className="text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Event' : 'Add Event'}
            </h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title..."
                required
                autoFocus
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add event details..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* All Day Toggle */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.allDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, allDay: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">All Day Event</span>
              </label>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.pastDate 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                />
                {validationErrors.pastDate && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Event date cannot be in the past
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {!formData.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.timeConflict 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.timeConflict 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  />
                  {validationErrors.timeConflict && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      End time must be after start time
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  onFocus={() => toggleDropdown('location')}
                  placeholder="Add location..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {isDropdownOpen.location && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {commonLocations.map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, location: location }));
                          toggleDropdown('location');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white transition-colors"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('category')}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: EVENT_CATEGORIES[formData.category].color }}
                    />
                    <span>{EVENT_CATEGORIES[formData.category].name}</span>
                  </div>
                  <Tag size={16} className="text-gray-400" />
                </button>
                
                {isDropdownOpen.category && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: key as EventCategory }));
                          toggleDropdown('category');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white transition-colors flex items-center gap-2"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Category Input */}
            {formData.category === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Category Name *
                </label>
                <input
                  type="text"
                  value={formData.customCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                  placeholder="Enter custom category name..."
                  required={formData.category === 'custom'}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Each word will be automatically capitalized
                </p>
              </div>
            )}

            {/* Attendees */}
            {availablePeople.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attendees
                </label>
                <div className="space-y-2">
                  {availablePeople.map((person) => (
                    <label key={person} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.attendees.includes(person)}
                        onChange={() => toggleAttendee(person)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-gray-900 dark:text-white">{person}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Created By Section */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created By
                </label>
                
                {/* Default creator display */}
                {!formData.useCustomName && (
                  <div className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                    {userDisplayName}
                  </div>
                )}
                
                {/* Custom name input */}
                {formData.useCustomName && (
                  <input
                    type="text"
                    value={formData.customName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customName: e.target.value.replace(/\s+/g, '') }))}
                    onBlur={(e) => setFormData(prev => ({ ...prev, customName: capitalizeSingleWord(e.target.value) }))}
                    placeholder="Enter person's name..."
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.customNameRequired 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  />
                )}
                
                {/* Checkbox */}
                <label className="flex items-center space-x-3 mt-3">
                  <input
                    type="checkbox"
                    checked={formData.useCustomName}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      useCustomName: e.target.checked,
                      customName: e.target.checked ? prev.customName : ''
                    }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Create this for another person
                  </span>
                </label>
                
                {/* Help text */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.useCustomName 
                    ? 'Enter a single name (spaces will be removed and capitalized)' 
                    : 'Automatically filled from your account'
                  }
                </p>
                
                {/* Validation error */}
                {validationErrors.customNameRequired && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Please enter a name for this person
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50">
          {/* Validation status */}
          {(validationErrors.timeConflict || validationErrors.pastDate || validationErrors.customNameRequired || !formData.title.trim()) && (
            <div className="mb-4 text-sm">
              {!formData.title.trim() && (
                <p className="text-gray-500 dark:text-gray-400">
                  💡 Add an event title to continue
                </p>
              )}
              {validationErrors.timeConflict && (
                <p className="text-red-600 dark:text-red-400">
                  ⚠️ Check your event times
                </p>
              )}
              {validationErrors.pastDate && (
                <p className="text-red-600 dark:text-red-400">
                  ⚠️ Event cannot be scheduled in the past
                </p>
              )}
              {validationErrors.customNameRequired && (
                <p className="text-red-600 dark:text-red-400">
                  ⚠️ Please enter a name for this person
                </p>
              )}
            </div>
          )}
          
          {showDeleteConfirm ? (
            /* Delete Confirmation */
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Event
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete &quot;{editEvent?.title}&quot;? This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Delete Event
                </button>
              </div>
            </div>
          ) : (
            /* Normal Buttons */
            <div className="flex space-x-3">
              <button 
                onClick={handleClose}
                className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              {isEditMode && onDeleteEvent && (
                <button 
                  onClick={handleDeleteClick}
                  className="px-4 py-3 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                >
                  <Trash2 size={16} className="inline mr-2" />
                  Delete
                </button>
              )}
              <button 
                onClick={handleSubmit}
                disabled={!formData.title.trim() || validationErrors.timeConflict || validationErrors.pastDate || validationErrors.customNameRequired}
                className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${
                  isEditMode 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Background overlay to close dropdowns */}
      {(isDropdownOpen.category || isDropdownOpen.location) && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setIsDropdownOpen({ category: false, attendees: false, location: false })}
        />
      )}
    </div>
  );
} 