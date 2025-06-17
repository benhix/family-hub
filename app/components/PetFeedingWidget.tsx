'use client';

import { useState } from 'react';
import { Check, X, ArrowRight, Clock, QrCode } from 'lucide-react';
import Link from 'next/link';
import { usePetFeeding } from '../hooks/usePetFeeding';
import QRCodeScanner from './QRCodeScanner';

export default function PetFeedingWidget() {
  const {
    todayStatus,
    loading,
    updateFeedingStatus,
    getCurrentMealTime,
    fetchFeedingData
  } = usePetFeeding(1);
  
  const [showQRScanner, setShowQRScanner] = useState(false);

  const getPetStatus = (petType: 'dog' | 'cat') => {
    const currentMeal = getCurrentMealTime();
    const status = todayStatus[petType];
    
    if (currentMeal === 'morning') {
      return status.morning ? 'fed' : 'pending';
    } else {
      // Evening - check if both meals are done
      if (status.morning && status.evening) return 'fed';
      if (!status.morning) return 'missed'; // Missed morning
      if (!status.evening) return 'pending'; // Pending evening
    }
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fed': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-orange-600 dark:text-orange-400';
      case 'missed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fed': return <Check size={14} className="text-green-600 dark:text-green-400" />;
      case 'pending': return <Clock size={14} className="text-orange-600 dark:text-orange-400" />;
      case 'missed': return <X size={14} className="text-red-600 dark:text-red-400" />;
      default: return <X size={14} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'fed': return 'All fed';
      case 'pending': return 'Needs feeding';
      case 'missed': return 'Missed meal';
      default: return 'Unknown';
    }
  };

  const handleQuickFeed = async (petType: 'dog' | 'cat', event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation to alerts page
    event.stopPropagation();
    
    const currentMeal = getCurrentMealTime();
    const currentStatus = todayStatus[petType][currentMeal];
    
    await updateFeedingStatus(petType, currentMeal, !currentStatus);
  };

  const handleQRScanSuccess = () => {
    // Refresh the feeding data after successful QR scan
    fetchFeedingData();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            🐾 Pet Feeding 
          </h3>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/alerts" className="text-gray-400 hover:text-blue-500 transition-colors">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            🐾 Pet Feeding
          </h3>
          </Link>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => setShowQRScanner(true)}
              className="p-1.5 rounded-lg bg-blue-100 hidden dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              title="Scan QR Code to feed both pet"
            >
              <QrCode size={16} className="text-blue-600 dark:text-blue-400" />
            </button> */}
            <Link href="/alerts" className="text-gray-400 hover:text-blue-500 transition-colors">
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {/* Dog Status */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="text-sm">🐕</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Dog</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleQuickFeed('dog', e)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium hover:bg-white dark:hover:bg-slate-600 transition-colors"
              >
                <span className={getStatusColor(getPetStatus('dog'))}>
                  {getStatusText(getPetStatus('dog'))}
                </span>
                {getStatusIcon(getPetStatus('dog'))}
              </button>
            </div>
          </div>

          {/* Cat Status */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="text-sm">🐱</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Cat</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleQuickFeed('cat', e)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium hover:bg-white dark:hover:bg-slate-600 transition-colors"
              >
                <span className={getStatusColor(getPetStatus('cat'))}>
                  {getStatusText(getPetStatus('cat'))}
                </span>
                {getStatusIcon(getPetStatus('cat'))}
              </button>
            </div>
          </div>
        </div>

        {/* Current Meal Time Indicator */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Current meal: {getCurrentMealTime().charAt(0).toUpperCase() + getCurrentMealTime().slice(1)}
            </p>
            <button
              onClick={() => setShowQRScanner(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <QrCode size={12} />
              Scan QR
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      <QRCodeScanner
        isVisible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onSuccess={handleQRScanSuccess}
      />
    </>
  );
} 