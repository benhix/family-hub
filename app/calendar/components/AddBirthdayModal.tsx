'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { X, Calendar, User, Gift, Bell } from 'lucide-react';
import { Birthday, CreateBirthdayRequest } from '../types/birthday';
import { useUserDisplayName } from '../../hooks/useUserDisplayName';

interface AddBirthdayModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddBirthday: (birthdayData: Omit<Birthday, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editBirthday?: Birthday | null;
}

export default function AddBirthdayModal({ 
  isVisible, 
  onClose, 
  onAddBirthday,
  editBirthday 
}: AddBirthdayModalProps) {
  const { user } = useUser();
  const userDisplayName = useUserDisplayName();
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    originalYear: '',
    notes: '',
    reminderDays: '7'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or when editing changes
  useEffect(() => {
    if (isVisible) {
      if (editBirthday) {
        // Format date for input (YYYY-MM-DD)
        const birthDateStr = editBirthday.birthDate.toISOString().split('T')[0];
        setFormData({
          name: editBirthday.name,
          birthDate: birthDateStr,
          originalYear: editBirthday.originalYear?.toString() || '',
          notes: editBirthday.notes || '',
          reminderDays: editBirthday.reminderDays?.toString() || '7'
        });
      } else {
        setFormData({
          name: '',
          birthDate: '',
          originalYear: '',
          notes: '',
          reminderDays: '7'
        });
      }
      setError(null);
    }
  }, [isVisible, editBirthday]);

  if (!isVisible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.birthDate) {
        throw new Error('Birth date is required');
      }

      // Parse dates
      const birthDate = new Date(formData.birthDate);
      const originalYear = formData.originalYear ? parseInt(formData.originalYear) : undefined;
      const reminderDays = formData.reminderDays ? parseInt(formData.reminderDays) : 7;

      // Validate year if provided
      if (originalYear && (originalYear < 1900 || originalYear > new Date().getFullYear())) {
        throw new Error('Please enter a valid birth year');
      }

      // Create birthday data
      const birthdayData = {
        name: formData.name.trim(),
        birthDate,
        originalYear,
        notes: formData.notes.trim() || undefined,
        reminderDays,
        addedBy: userDisplayName,
        addedByUserId: user?.id || ''
      };

      await onAddBirthday(birthdayData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save birthday');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = () => {
    if (formData.birthDate && formData.originalYear) {
      const currentYear = new Date().getFullYear();
      const birthYear = parseInt(formData.originalYear);
      return currentYear - birthYear;
    }
    return null;
  };

  const getUpcomingBirthday = () => {
    if (formData.birthDate) {
      const today = new Date();
      const birthDate = new Date(formData.birthDate);
      const thisYear = today.getFullYear();
      
      // Set to this year
      const thisYearBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
      
      // If birthday has passed this year, show next year's
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(thisYear + 1);
      }
      
      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil;
    }
    return null;
  };

  const age = calculateAge();
  const daysUntilBirthday = getUpcomingBirthday();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editBirthday ? 'Edit Birthday' : 'Add Birthday'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Birth Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Birth Date *
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Birth Year Field (Optional) */}
          <div>
            <label className="hidden block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Birth Year (optional)
            </label>
            <input
              type="number"
              value={formData.originalYear}
              onChange={(e) => setFormData(prev => ({ ...prev, originalYear: e.target.value }))}
              className="hidden w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="e.g., 1990"
              min="1900"
              max={new Date().getFullYear()}
            />
            {age && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {age} years old {daysUntilBirthday === 0 ? 'today!' : daysUntilBirthday === 1 ? 'tomorrow!' : `in ${daysUntilBirthday} days`}
              </p>
            )}
          </div>

          {/* Reminder Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Bell className="w-4 h-4 inline mr-1" />
              Reminder (days before)
            </label>
            <select
              value={formData.reminderDays}
              onChange={(e) => setFormData(prev => ({ ...prev, reminderDays: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="1">1 day before</option>
              <option value="3">3 days before</option>
              <option value="7">1 week before</option>
              <option value="14">2 weeks before</option>
              <option value="30">1 month before</option>
            </select>
          </div>

          {/* Notes Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="Add any special notes about this birthday..."
              rows={3}
            />
          </div>

          {/* Birthday Info */}
          {daysUntilBirthday !== null && (
            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-700 rounded-lg">
              <p className="text-sm text-pink-800 dark:text-pink-200">
                🎂 Next birthday: {daysUntilBirthday === 0 ? 'Today!' : daysUntilBirthday === 1 ? 'Tomorrow!' : `In ${daysUntilBirthday} days`}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : editBirthday ? 'Update Birthday' : 'Add Birthday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 