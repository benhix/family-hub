import { AlertTriangle, Zap, X, ThumbsDown, UserX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header with Back Arrow */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Help</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 pt-12">
        <div className="max-w-lg w-full text-center">
          {/* Warning Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-500/20 rounded-2xl flex items-center justify-center mb-4 animate-bounce">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            
            {/* Crossed out sparkles */}
            {/* <div className="absolute -top-2 -right-2">
              <div className="relative">
                <Zap size={16} className="text-gray-400" />
                <X size={20} className="text-red-500 absolute -top-1 -left-1" />
              </div>
            </div> */}
          </div>

          {/* Main Content */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Help Page
          </h1>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 space-y-6">
            <div className="flex items-center justify-center gap-2 mb-6">
              <ThumbsDown size={20} className="text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Plot Twist!
              </h2>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium text-sm">
                Need some help? Won&apos;t be finding it here. Looking for tutorials or guides? Try literally anywhere else on the internet. This page exists purely to disappoint and annoy you further.
              </p>
            </div>
            
            {/* <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Well, <strong>tough cookies</strong>! 🍪
            </p> */}
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Want to submit a complaint? <br /><br />You can&apos;t.
              <br />
            </p>
            
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">What you&apos;re NOT getting:</h3>
              <div className="space-y-2 text-sm text-red-700 dark:text-red-300">
                <div className="flex items-center gap-2">
                  <X size={16} />
                  <span>Revolutionary productivity hacks</span>
                </div>
                <div className="flex items-center gap-2">
                  <X size={16} />
                  <span>Mind-blowing organizational tips</span>
                </div>
                <div className="flex items-center gap-2">
                  <X size={16} />
                  <span>Life-changing family management secrets</span>
                </div>
                <div className="flex items-center gap-2">
                  <X size={16} />
                  <span>Any useful information whatsoever</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-500/10 border border-gray-200 dark:border-gray-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <UserX size={16} />
                What you ARE getting:
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A mildly amusing page that wastes 30 seconds of your time while telling you that you&apos;re not getting what you expected.
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                💡 Pro tip: Lower your expectations and you&apos;ll never be disappointed!
              </p>
            </div>
          </div>
          
          {/* Fake satisfaction rating */}
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
              How satisfied are you with this service?
            </p>
            <div className="flex justify-center gap-2">
              <span className="text-2xl">😤</span>
              <span className="text-2xl">😠</span>
              <span className="text-2xl">🙄</span>
              <span className="text-2xl">😐</span>
              <span className="text-2xl">🤷‍♂️</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              (These buttons don&apos;t actually do anything)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 