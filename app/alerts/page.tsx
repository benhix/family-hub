'use client';

import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Check, X, History, QrCode } from 'lucide-react';
import Link from 'next/link';
import { usePetFeeding } from '../hooks/usePetFeeding';

interface FeedingRecord {
  id: string;
  petType: 'dog' | 'cat';
  mealTime: 'morning' | 'evening';
  fed: boolean;
  date: string;
  triggeredBy: string;
  triggeredByUserId?: string;
  timestamp: string;
  source?: string;
}

export default function PetFeedingPage() {
  const {
    todayStatus,
    feedingHistory,
    loading,
    updateFeedingStatus,
    getCurrentMealTime
  } = usePetFeeding(7);
  const [showHistory, setShowHistory] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const groupedHistory = feedingHistory.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, FeedingRecord[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-4">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/"
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            🐾 Pet Feeding
            </h1>

            <div className="flex items-center gap-2">
              <Link
                href="/qr-generator"
                className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                title="Generate QR Code"
              >
                <QrCode size={16} className="text-blue-600 dark:text-blue-400" />
              </Link>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-full ${showHistory ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
              >
                <History size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {!showHistory ? (
          <>
            {/* Today's Status */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar size={20} className="text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Today&apos;s Status
                </h2>
                <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Dog Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🐕</span>
                  <h3 className="font-medium text-gray-900 dark:text-white">Dog</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateFeedingStatus('dog', 'morning', !todayStatus.dog.morning)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      todayStatus.dog.morning
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {todayStatus.dog.morning ? (
                        <Check size={20} className="text-green-600" />
                      ) : (
                        <X size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Morning</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {todayStatus.dog.morning ? 'Fed' : 'Not fed'}
                    </div>
                  </button>
                  
                  <button
                    onClick={() => updateFeedingStatus('dog', 'evening', !todayStatus.dog.evening)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      todayStatus.dog.evening
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {todayStatus.dog.evening ? (
                        <Check size={20} className="text-green-600" />
                      ) : (
                        <X size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Evening</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {todayStatus.dog.evening ? 'Fed' : 'Not fed'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Cat Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🐱</span>
                  <h3 className="font-medium text-gray-900 dark:text-white">Cat</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateFeedingStatus('cat', 'morning', !todayStatus.cat.morning)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      todayStatus.cat.morning
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {todayStatus.cat.morning ? (
                        <Check size={20} className="text-green-600" />
                      ) : (
                        <X size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Morning</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {todayStatus.cat.morning ? 'Fed' : 'Not fed'}
                    </div>
                  </button>
                  
                  <button
                    onClick={() => updateFeedingStatus('cat', 'evening', !todayStatus.cat.evening)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      todayStatus.cat.evening
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {todayStatus.cat.evening ? (
                        <Check size={20} className="text-green-600" />
                      ) : (
                        <X size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Evening</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {todayStatus.cat.evening ? 'Fed' : 'Not fed'}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Time Indicator */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Current meal time: {getCurrentMealTime().charAt(0).toUpperCase() + getCurrentMealTime().slice(1)}
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Feeding History */
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-2">
              Feeding History
            </h2>
            
            {Object.keys(groupedHistory).length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No feeding history yet</p>
              </div>
            ) : (
              Object.keys(groupedHistory)
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                .map(date => (
                  <div key={date} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      {formatDate(date)}
                    </h3>
                    <div className="space-y-3">
                      {groupedHistory[date]
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map(record => (
                          <div key={`${record.petType}-${record.mealTime}-${record.timestamp}`} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-gray-600">
                            {/* Main row with pet, meal, and status */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{record.petType === 'dog' ? '🐕' : '🐱'}</span>
                                <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                                  {record.petType} - {record.mealTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${record.fed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {record.fed ? 'Fed' : 'Not fed'}
                                </span>
                                {record.fed ? (
                                  <Check size={16} className="text-green-600 dark:text-green-400" />
                                ) : (
                                  <X size={16} className="text-red-600 dark:text-red-400" />
                                )}
                              </div>
                            </div>
                            
                            {/* Details row with time, person, and method */}
                            {record.fed && (
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-4">
                                  {/* Time */}
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>
                                      {new Date(record.timestamp).toLocaleTimeString('en-US', { 
                                        hour: 'numeric', 
                                        minute: '2-digit',
                                        hour12: true 
                                      })}
                                    </span>
                                  </div>
                                  
                                  {/* Person */}
                                  <div className="flex items-center gap-1">
                                    <span>👤</span>
                                    <span>{record.triggeredBy}</span>
                                  </div>
                                </div>
                                
                                {/* Method (QR or Manual) */}
                                <div className="flex items-center gap-1">
                                  {record.source === 'qr_code' ? (
                                    <>
                                      <QrCode size={12} className="text-blue-500 dark:text-blue-400" />
                                      <span className="text-blue-600 dark:text-blue-400 font-medium">QR Code</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-gray-600 dark:text-gray-400">📱</span>
                                      <span className="text-gray-600 dark:text-gray-400">Manual</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 