'use client';

import { useActivityLog } from '@/app/contexts/ActivityLogContext';
import { useUser } from '@clerk/nextjs';
import { useUserDisplayName } from './useUserDisplayName';
import { ActivityLogEntry } from '@/app/types/activity';

export function useActivityLogger() {
  const { addActivity } = useActivityLog();
  const { user } = useUser();
  const userDisplayName = useUserDisplayName();

  const logActivity = async (message: string, type: ActivityLogEntry['type']) => {
    if (!user?.id) return;
    
    await addActivity(message, type, userDisplayName, user.id);
  };

  // Pre-built logging functions for common activities
  const logCalendarActivity = async (action: 'added' | 'updated' | 'deleted', eventTitle?: string) => {
    const messages = {
      added: eventTitle ? `added event "${eventTitle}"` : 'added a new event',
      updated: eventTitle ? `updated event "${eventTitle}"` : 'updated an event',
      deleted: eventTitle ? `deleted event "${eventTitle}"` : 'deleted an event',
    };
    await logActivity(messages[action], 'calendar');
  };

  const logShoppingActivity = async (action: 'added' | 'completed' | 'deleted' | 'updated', itemName?: string) => {
    const messages = {
      added: itemName ? `added "${itemName}" to shopping list` : 'added item to shopping list',
      completed: itemName ? `completed "${itemName}" from shopping list` : 'completed shopping item',
      deleted: itemName ? `deleted "${itemName}" from shopping list` : 'deleted shopping item',
      updated: itemName ? `updated "${itemName}" in shopping list` : 'updated shopping item',
    };
    await logActivity(messages[action], 'shopping');
  };

  const logTaskActivity = async (action: 'added' | 'completed' | 'deleted' | 'updated', taskTitle?: string) => {
    const messages = {
      added: taskTitle ? `added task "${taskTitle}"` : 'added a new task',
      completed: taskTitle ? `completed task "${taskTitle}"` : 'completed a task',
      deleted: taskTitle ? `deleted task "${taskTitle}"` : 'deleted a task',
      updated: taskTitle ? `updated task "${taskTitle}"` : 'updated a task',
    };
    await logActivity(messages[action], 'tasks');
  };

  const logFamilyActivity = async (action: string) => {
    await logActivity(action, 'family');
  };

  const logGeneralActivity = async (action: string) => {
    await logActivity(action, 'general');
  };

  return {
    logActivity,
    logCalendarActivity,
    logShoppingActivity,
    logTaskActivity,
    logFamilyActivity,
    logGeneralActivity,
  };
} 