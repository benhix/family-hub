'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { getRandomSuccessMessage, getRandomErrorMessage, getRandomAlreadyFedMessage, type SuccessMessage } from '../data/sucessMessages';

export default function QRPetFeedingPage() {
  const { user } = useUser();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-fed'>('loading');
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);
  const [errorMessage, setErrorMessage] = useState<SuccessMessage | null>(null);
  const [alreadyFedMessage, setAlreadyFedMessage] = useState<SuccessMessage | null>(null);

  useEffect(() => {
    if (!user) return;

    const processPetFeeding = async () => {
      try {
        const response = await fetch('/api/pet-feeding/qr-scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qrCode: 'FAMILY_DASH_PET_FEEDING_BOTH'
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.mealTime);
          // Get a random success message when the operation succeeds
          setSuccessMessage(getRandomSuccessMessage());
        } else if (response.status === 409 && data.alreadyFed) {
          // Handle already fed case (409 Conflict)
          setStatus('already-fed');
          setMessage(data.mealTime);
          // Get a random already fed message
          setAlreadyFedMessage(getRandomAlreadyFedMessage());
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to mark pets as fed');
          // Get a random error message when the operation fails
          setErrorMessage(getRandomErrorMessage());
        }
      } catch (error) {
        console.error('Error processing pet feeding:', error);
        setStatus('error');
        setMessage('Failed to connect to server');
        // Get a random error message when there's a network/server error
        setErrorMessage(getRandomErrorMessage());
      }
    };

    processPetFeeding();
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:border-gray-700/50 p-8 text-center max-w-md">
          <AlertCircle size={48} className="text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Please Sign In
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to be signed in to mark pets as fed
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can close this tab now
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:border-gray-700/50 p-8 text-center max-w-md">
        {status === 'loading' && (
          <>
            <Loader2 size={64} className="text-blue-500 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Feeding the Hungry Beasts...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Just a moment while we update their royal status
            </p>
          </>
        )}

        {status === 'success' && successMessage && (
          <>
            <div className="text-6xl mb-4">🐕🐈</div>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {successMessage.headline} 🎉
            </h1>
            {/* Section One - Dynamic headline with meal time */}
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Fed for <strong>{message}</strong>
            </p>
            {/* Section Two - Dynamic subtext */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                {successMessage.subtext} 🍽️
              </p>
            </div>
            <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <X size={16} />
              You can close this tab now
            </p>
          </>
        )}

        {status === 'already-fed' && alreadyFedMessage && (
          <>
            <div className="text-6xl mb-4">🐕🐈</div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-orange-600 dark:text-orange-400 text-2xl">ℹ️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {alreadyFedMessage.headline}
            </h1>
            {/* Already fed meal time info */}
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Already fed for <strong>{message}</strong>
            </p>
            {/* Already fed subtext */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {alreadyFedMessage.subtext}
              </p>
            </div>
            <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <X size={16} />
              You can close this tab now
            </p>
          </>
        )}

        {status === 'error' && errorMessage && (
          <>
            <div className="text-5xl mb-4">😿</div>
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {errorMessage.headline}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Technical details: {message}
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                {errorMessage.subtext}
              </p>
            </div>
            <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <X size={16} />
              You can close this tab now
            </p>
          </>
        )}
      </div>
    </main>
  );
} 