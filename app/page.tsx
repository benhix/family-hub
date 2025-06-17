'use client';

import { useState } from 'react';
import DashboardGrid from './components/DashboardGrid';
import ShoppingStatsWidget from './components/ShoppingStatsWidget';
import UpcomingEventsWidget from './components/UpcomingEventsWidget';
import ActivityLogWidget from './components/ActivityLogWidget';
import BugReportModal from './components/BugReportModal';
import IdeasModal from './components/IdeasModal';
import PetFeedingWidget from './components/PetFeedingWidget';
/* import WorkTrackingWidget from './components/WorkTrackingWidget';
import DismissibleAlert from './components/DismissibleAlert'; */
import { useWidgetPreferences } from './contexts/WidgetPreferencesContext';
import { Zap } from 'lucide-react';

export default function Home() {
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [showIdeasModal, setShowIdeasModal] = useState(false);
  const { widgets, loading: widgetsLoading } = useWidgetPreferences();

  // Widget component mapping
  const widgetComponents = {
    'upcoming-events': <UpcomingEventsWidget key="upcoming-events" />,
    'shopping-stats': <ShoppingStatsWidget key="shopping-stats" />,
    'pet-feeding': <PetFeedingWidget key="pet-feeding" />,
    /* 'work-tracking': <WorkTrackingWidget key="work-tracking" />, */
    'dashboard-grid': <DashboardGrid key="dashboard-grid" />,
    'bug-report': (
      <button
        key="bug-report"
        onClick={() => setShowBugReportModal(true)}
        className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            Report a Bug
          </span>
        </div>
      </button>
    ),
    'ideas': (
      <button
        key="ideas"
        onClick={() => setShowIdeasModal(true)}
        className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-300 dark:shadow-sm dark:border-gray-700/50 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/30 transition-colors">
            <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
            Ideas
          </span>
        </div>
      </button>
    ),
    'activity-log': <ActivityLogWidget key="activity-log" />
  };

  // Get visible widgets sorted by order
  const visibleWidgets = widgets
    .filter(widget => widget.visible)
    .sort((a, b) => a.order - b.order);

  // Function to render widget with divider
  const renderWidgetWithDivider = (component: React.ReactNode, index: number, isLast: boolean) => (
    <div key={`widget-${index}`}>
      {component}
      {!isLast && (
        <div className="flex justify-center">
          <div className="w-2/3 h-px bg-gray-300 dark:bg-gray-700"></div>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      
      {/* Cool Alert Message */}
      {/* <DismissibleAlert
        alertId="Beta_v0.4"
        type="info"
        icon={<Zap size={20} />}
        title="Update to Beta v0.4"
        message={`Changes are:
- Added widget to show where Ben is relating to the office/work. Tap the info icon to learn more.
- Can tap notes in upcoming events to expand them`}
      /> */}
      
      <div className="max-w-sm mx-auto p-4 space-y-6">
        {widgetsLoading ? (
          // Loading skeleton
          <div className="space-y-6">
            {[...Array(7)].map((_, i) => (
              <div key={i}>
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
                {i < 6 && (
                  <div className="flex justify-center mt-6">
                    <div className="w-2/3 h-px bg-gray-300 dark:bg-gray-700"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Render widgets based on preferences
          visibleWidgets.map((widget, index) => {
            const component = widgetComponents[widget.id as keyof typeof widgetComponents];
            if (!component) return null;
            
            return renderWidgetWithDivider(
              component,
              index,
              index === visibleWidgets.length - 1
            );
          })
        )}
      </div>

      {/* Footer Space for Mobile Navigation */}
      <div className="h-20"></div>

      {/* Bug Report Modal */}
      <BugReportModal
        isVisible={showBugReportModal}
        onClose={() => setShowBugReportModal(false)}
      />

      {/* Ideas Modal */}
      <IdeasModal
        isVisible={showIdeasModal}
        onClose={() => setShowIdeasModal(false)}
      />
    </main>
  );
}
