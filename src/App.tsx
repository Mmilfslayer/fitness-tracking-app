import { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { OnlineStatusProvider } from '@/hooks/useOnlineStatus';
import { ToastProvider } from '@/hooks/useToast';
import { ThemeProvider } from '@/hooks/useTheme';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { TabBar } from '@/components/ui/TabBar';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { initDatabase } from '@/services/database/db';
import { kvSyncService } from '@/services/kv/syncService';

// Lazy load pages for code splitting
const Nutrition = lazy(() => import('./pages/Nutrition').then(m => ({ default: m.Nutrition })));
const Workout = lazy(() => import('./pages/Workout').then(m => ({ default: m.Workout })));
const Progress = lazy(() => import('./pages/Progress').then(m => ({ default: m.Progress })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));

type TabId = 'nutrition' | 'workout' | 'progress' | 'settings';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-system-grouped-background">
      <div className="animate-spin rounded-full h-8 w-8 border-3 border-system-blue border-t-transparent" />
    </div>
  );
}

function PageWrapper({ children, featureName }: { children: React.ReactNode; featureName: string }) {
  return (
    <ErrorBoundary featureName={featureName}>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('nutrition');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initialize() {
      await initDatabase();
      const onboardingComplete = localStorage.getItem('onboarding_complete');
      if (!onboardingComplete) {
        setShowOnboarding(true);
      }
      await kvSyncService.initialize();
      setIsInitialized(true);
    }
    initialize();
  }, []);

  if (!isInitialized) {
    return <LoadingFallback />;
  }

  if (showOnboarding) {
    return (
      <OnlineStatusProvider>
        <ToastProvider>
          <Onboarding />
          <OfflineBanner />
        </ToastProvider>
      </OnlineStatusProvider>
    );
  }

  return (
    <OnlineStatusProvider>
      <ToastProvider>
        <div className="min-h-screen bg-system-grouped-background pb-16">
          <OfflineBanner />

          <main className="pb-20">
            <AnimatePresence mode="wait">
              {activeTab === 'nutrition' && (
                <PageWrapper key="nutrition" featureName="Nutrition">
                  <Nutrition />
                </PageWrapper>
              )}
              {activeTab === 'workout' && (
                <PageWrapper key="workout" featureName="Workout">
                  <Workout />
                </PageWrapper>
              )}
              {activeTab === 'progress' && (
                <PageWrapper key="progress" featureName="Progress">
                  <Progress />
                </PageWrapper>
              )}
              {activeTab === 'settings' && (
                <PageWrapper key="settings" featureName="Settings">
                  <Settings />
                </PageWrapper>
              )}
            </AnimatePresence>
          </main>

          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </ToastProvider>
    </OnlineStatusProvider>
  );
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </Suspense>
    </AnimatePresence>
  );
}