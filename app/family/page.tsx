'use client';

import { useState, useEffect } from 'react';
import { Crown, Users, Calculator, Sparkles, Trophy } from 'lucide-react';

export default function FamilyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fake loading with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-20">
        <div className="max-w-sm mx-auto p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calculator size={32} className="text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Calculating Family Rankings
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Running advanced algorithms to determine the ultimate Hicks...
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(Math.min(progress, 100))}% Complete
              </p>
              
              {/* Fake calculation steps */}
              <div className="mt-6 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                {progress > 20 && <div>✓ Analyzing wit levels...</div>}
                {progress > 40 && <div>✓ Measuring dad joke quality...</div>}
                {progress > 60 && <div>✓ Calculating responsibility scores...</div>}
                {progress > 80 && <div>✓ Processing family contribution data...</div>}
                {progress > 95 && <div className="text-blue-600 dark:text-blue-400">✓ Finalizing supreme ranking...</div>}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pt-20">
      <div className="max-w-sm mx-auto p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
          {/* Crown Animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Crown size={40} className="text-yellow-900" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles size={24} className="text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Sparkles size={20} className="text-yellow-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>

          {/* Result */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            🎉 Results Are In! 🎉
          </h1>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 mb-6 border border-yellow-200 dark:border-yellow-700">
            <h2 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              Supreme Hicks Ranking
            </h2>
            <div className="flex items-center justify-center gap-2 text-yellow-900 dark:text-yellow-100">
              <Trophy size={20} />
              <span className="font-bold text-xl">Ben Hicks</span>
              <Trophy size={20} />
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              Score: 98.7/100 (Practically Perfect)
            </p>
          </div>

          {/* Fake Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">🏆</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Leadership</div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">🧠</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Big Brain</div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">😂</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Humor Level</div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">👨‍💻</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Tech Wizard</div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            * Results calculated using highly scientific family algorithms.<br/>
            No other family members were harmed in this ranking.
          </p>
        </div>
      </div>
    </main>
  );
} 