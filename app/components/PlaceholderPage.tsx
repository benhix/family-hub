import Link from 'next/link';
import { ArrowLeft, LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

export default function PlaceholderPage({ title, icon: Icon, color, description }: PlaceholderPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </Link>
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                <Icon size={24} className={color} />
                {title}
              </h1>
            </div>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color.replace('text-', 'from-').replace('-500', '-400').replace('-500', '-600')} mx-auto mb-4 flex items-center justify-center`}>
            <Icon size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This is a placeholder page for the {title} feature. You can build out the full functionality here.
              </p>
            </div>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 