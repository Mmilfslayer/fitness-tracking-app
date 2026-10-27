import { useState } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useDailyRoutines } from '@/services/database/useDatabase';
import { kvSyncService } from '@/services/kv/syncService';
import { useToastHelpers } from '@/hooks/useToast';
import { format, subDays } from 'date-fns';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export function Workout() {
  const { dailyRoutines, saveRoutine, getRoutineForDate, isReady } = useDailyRoutines();
  const { isOnline, wasOffline } = useOnlineStatus();
  const { success, warning } = useToastHelpers();
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const handleWorkoutComplete = async (routine: any) => {
    try {
      await saveRoutine({ ...routine, date: selectedDate });
      await kvSyncService.queueWorkoutSync('completed');

      if (!isOnline) {
        warning('Saved Offline', 'Workout saved locally. Will sync when online.');
      } else {
        success('Workout Complete', 'Great job! Your workout has been saved.');
      }
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  const loadYesterdayRoutine = async () => {
    const yesterdayRoutine = await getRoutineForDate(yesterday);
    if (yesterdayRoutine) {
      await saveRoutine({ ...yesterdayRoutine, date: today, generatedAt: new Date().toISOString() });
      setSelectedDate(today);
      success('Loaded Yesterday\'s Plan', 'Using yesterday\'s workout as today\'s plan.');
    }
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-system-grouped-background">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-system-blue border-t-transparent" />
      </div>
    );
  }

  // dailyRoutines could be undefined if useLiveQuery hasn't resolved yet
  const routines = dailyRoutines ?? [];
  const todaysRoutine = routines.find((r: { date: string }) => r.date === selectedDate);
  const hasTodaysRoutine = !!todaysRoutine;
  const showFallbackPrompt = selectedDate === today && !hasTodaysRoutine && !isOnline && !wasOffline;

  return (
    <div className="min-h-screen bg-system-grouped-background">
      <div className="safe-area-top" />

      <header className="sticky top-16 z-10 bg-system-grouped-background/95 backdrop-blur border-b border-system-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-system-foreground">Workout</h1>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-system-background border border-system-border rounded-lg text-sm text-system-foreground focus:outline-none focus:ring-2 focus:ring-system-blue"
            />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-24 space-y-4">
        {showFallbackPrompt && (
          <div className="p-4 bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-800 dark:text-blue-200">No workout for today</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  You're offline and today's workout hasn't been generated yet.
                </p>
                <button
                  onClick={loadYesterdayRoutine}
                  className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 underline hover:no-underline"
                >
                  Load yesterday's routine instead
                </button>
              </div>
            </div>
          </div>
        )}

        {hasTodaysRoutine && todaysRoutine && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-system-foreground">Today's Workout</h2>
              <span className="text-sm text-system-muted-foreground">
                Generated: {format(new Date(todaysRoutine.generatedAt), 'MMM d, yyyy HH:mm')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-system-muted rounded-lg">
                <p className="text-2xl font-bold text-system-foreground">{todaysRoutine.energyLevel}/10</p>
                <p className="text-xs text-system-muted-foreground">Energy Level</p>
              </div>
              <div className="p-3 bg-system-muted rounded-lg">
                <p className="text-2xl font-bold text-system-foreground">{todaysRoutine.availableTime} min</p>
                <p className="text-xs text-system-muted-foreground">Available Time</p>
              </div>
              <div className="p-3 bg-system-muted rounded-lg">
                <p className="text-2xl font-bold text-system-foreground">{todaysRoutine.calorieIntake || 'N/A'}</p>
                <p className="text-xs text-system-muted-foreground">Calorie Target</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-system-foreground">Workout Plan</h3>
              <pre className="p-3 bg-system-background border border-system-border rounded-lg text-sm text-system-foreground overflow-auto max-h-64">
                {JSON.stringify(todaysRoutine.workoutPlan, null, 2)}
              </pre>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={() => handleWorkoutComplete(todaysRoutine)}
              className="mt-2"
            >
              Complete Workout
            </Button>
          </Card>
        )}

        {!hasTodaysRoutine && selectedDate !== today && (
          <Card className="p-6 text-center">
            <p className="text-system-muted-foreground">No workout recorded for this date.</p>
          </Card>
        )}

        {!hasTodaysRoutine && selectedDate === today && !showFallbackPrompt && (
          <Card className="p-6 text-center">
            <p className="text-system-muted-foreground">No workout generated for today yet.</p>
            <p className="text-sm text-system-muted-foreground mt-2">Use the workout generator to create today's plan.</p>
          </Card>
        )}
      </div>

      {!isOnline && (
        <div className="fixed bottom-20 left-4 right-4 z-30">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                Offline mode – workouts saved locally. Sync happens automatically when online.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}