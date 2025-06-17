'use client';

import { useState } from 'react';
import { X, Calendar, User, Gift, Clock, Bell, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Birthday } from '../types/birthday';

interface BirthdayDetailModalProps {
  birthday: Birthday | null;
  isVisible: boolean;
  onClose: () => void;
  onEdit?: (birthday: Birthday) => void;
  onDelete?: (birthdayId: string) => void;
}

export default function BirthdayDetailModal({ birthday, isVisible, onClose, onEdit, onDelete }: BirthdayDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isVisible || !birthday) return null;

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  const calculateAge = () => {
    if (birthday.originalYear) {
      const currentYear = new Date().getFullYear();
      return currentYear - birthday.originalYear;
    }
    return null;
  };

  const getUpcomingBirthday = () => {
    const today = new Date();
    const birthDate = new Date(birthday.birthDate);
    const thisYear = today.getFullYear();
    
    // Set to this year
    const thisYearBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
    
    // If birthday has passed this year, show next year's
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(thisYear + 1);
    }
    
    const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const age = calculateAge();
  const daysUntilBirthday = getUpcomingBirthday();

  const getReminderText = () => {
    if (!birthday.reminderDays) return 'No reminder set';
    if (birthday.reminderDays === 1) return '1 day before';
    if (birthday.reminderDays === 7) return '1 week before';
    if (birthday.reminderDays === 14) return '2 weeks before';
    if (birthday.reminderDays === 30) return '1 month before';
    return `${birthday.reminderDays} days before`;
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(birthday.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Birthday Details</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Birthday Title */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {birthday.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-pink-600">
                Birthday
              </span>
              {age && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300">
                  {age} years old
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          {birthday.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </h4>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {birthday.notes}
                </p>
              </div>
            </div>
          )}

          {/* Birthday Details */}
          <div className="space-y-4">
            {/* Birth Date */}
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Calendar size={16} />
              <span>Birth Date: <strong className="text-gray-900 dark:text-white">{format(birthday.birthDate, 'MMMM d')}</strong></span>
            </div>

            {/* Original Year */}
            {birthday.originalYear && (
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Calendar size={16} />
                <span>Birth Year: <strong className="text-gray-900 dark:text-white">{birthday.originalYear}</strong></span>
              </div>
            )}

            {/* Reminder */}
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Bell size={16} />
              <span>Reminder: <strong className="text-gray-900 dark:text-white">{getReminderText()}</strong></span>
            </div>

            {/* Added by */}
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <User size={16} />
              <span>Added by <strong className="text-gray-900 dark:text-white">{birthday.addedBy}</strong></span>
            </div>

            {/* Created date */}
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Clock size={16} />
              <span>Added on <strong className="text-gray-900 dark:text-white">{formatDate(birthday.createdAt)}</strong></span>
            </div>
          </div>

          {/* Upcoming Birthday Info */}
          {daysUntilBirthday !== null && (
            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-700 rounded-lg">
              <p className="text-sm text-pink-800 dark:text-pink-200">
                🎂 Next birthday: {daysUntilBirthday === 0 ? 'Today!' : daysUntilBirthday === 1 ? 'Tomorrow!' : `In ${daysUntilBirthday} days`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50">
          {showDeleteConfirm ? (
            /* Delete Confirmation */
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Birthday
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete the birthday for &quot;{birthday.name}&quot;? This action cannot be undone.
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
                  Delete Birthday
                </button>
              </div>
            </div>
          ) : (
            /* Normal Buttons */
            <div className="flex gap-3">
              {onEdit && (
                <button 
                  onClick={() => onEdit(birthday)}
                  className="flex-1 px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors"
                >
                  Edit Birthday
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={handleDeleteClick}
                  className="px-4 py-3 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                >
                  <Trash2 size={16} className="inline mr-2" />
                  Delete
                </button>
              )}
              {!onEdit && !onDelete && (
                <button 
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 