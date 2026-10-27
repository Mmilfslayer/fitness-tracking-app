import { useState, useEffect } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useBodyMetrics, useNutritionLogs, useDailyRoutines } from '@/services/database/useDatabase';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import Card from '@/components/ui/Card';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface WorkoutVolumePoint {
  date: string;
  volume: number;
}

export function Progress() {
  const { bodyMetrics, getMetricsRange, isReady: metricsReady } = useBodyMetrics();
  const { getNutritionRange } = useNutritionLogs();
  const { getRoutinesRange } = useDailyRoutines();
  const { isOnline } = useOnlineStatus();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  const [weightData, setWeightData] = useState<ChartDataPoint[]>([]);
  const [calorieData, setCalorieData] = useState<ChartDataPoint[]>([]);
  const [proteinData, setProteinData] = useState<ChartDataPoint[]>([]);
  const [workoutData, setWorkoutData] = useState<WorkoutVolumePoint[]>([]);

  useEffect(() => {
    if (!metricsReady) return;

    const endDate = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case 'month':
        startDate = subDays(endDate, 30);
        break;
      case 'quarter':
        startDate = subDays(endDate, 90);
        break;
    }

    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    loadData(startStr, endStr);
  }, [timeRange, metricsReady]);

  const loadData = async (startDate: string, endDate: string) => {
    try {
      const [metrics, nutrition, routines] = await Promise.all([
        getMetricsRange(startDate, endDate),
        getNutritionRange(startDate, endDate),
        getRoutinesRange(startDate, endDate),
      ]);

      // Process weight data
      const weightPoints = metrics.map(m => ({
        date: format(new Date(m.date), 'MMM d'),
        value: m.weight,
      }));
      setWeightData(weightPoints);

      // Process nutrition data by date
      const nutritionByDate = new Map<string, { calories: number; protein: number }>();
      nutrition.forEach(log => {
        const dateKey = log.date;
        const existing = nutritionByDate.get(dateKey) || { calories: 0, protein: 0 };
        existing.calories += log.parsedMacros.calories;
        existing.protein += log.parsedMacros.protein;
        nutritionByDate.set(dateKey, existing);
      });

      const caloriePoints = Array.from(nutritionByDate.entries())
        .map(([date, data]) => ({
          date: format(new Date(date), 'MMM d'),
          value: data.calories,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setCalorieData(caloriePoints);

      const proteinPoints = Array.from(nutritionByDate.entries())
        .map(([date, data]) => ({
          date: format(new Date(date), 'MMM d'),
          value: data.protein,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setProteinData(proteinPoints);

      // Process workout volume
      const workoutByDate = new Map<string, number>();
      routines.forEach(routine => {
        try {
          const plan = routine.workoutPlan as any;
          if (plan?.exercises) {
            let volume = 0;
            plan.exercises.forEach((ex: any) => {
              ex.sets?.forEach((set: any) => {
                if (set.completed && set.weight && set.reps) {
                  volume += set.weight * set.reps;
                }
              });
            });
            workoutByDate.set(routine.date, volume);
          }
        } catch {}
      });

      const workoutPoints = Array.from(workoutByDate.entries())
        .map(([date, volume]) => ({
          date: format(new Date(date), 'MMM d'),
          volume,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setWorkoutData(workoutPoints);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  };

  if (!metricsReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-system-grouped-background">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-system-blue border-t-transparent" />
      </div>
    );
  }

  // bodyMetrics could be undefined if useLiveQuery hasn't resolved yet
  const metrics = bodyMetrics ?? [];
  const latestWeight = metrics[0]?.weight || 0;
  const weightChange = metrics.length > 1
    ? (metrics[0].weight - metrics[1].weight).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-system-grouped-background">
      <div className="safe-area-top" />

      <header className="sticky top-16 z-10 bg-system-grouped-background/95 backdrop-blur border-b border-system-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-system-foreground">Progress</h1>
          <div className="flex gap-2 mt-3">
            {(['week', 'month', 'quarter'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-system-blue text-white'
                    : 'bg-system-background text-system-muted-foreground hover:text-system-foreground'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-24 space-y-6">
        {/* Weight Summary Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-system-muted-foreground">Current Weight</p>
              <p className="text-3xl font-bold text-system-foreground">{latestWeight} kg</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-system-muted-foreground">Change</p>
              <p className={`text-xl font-bold ${parseFloat(weightChange) < 0 ? 'text-system-green' : 'text-system-red'}`}>
                {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} kg
              </p>
            </div>
          </div>
        </Card>

        {/* Weight Chart */}
        <Card className="p-4">
          <h3 className="font-medium text-system-foreground mb-4">Weight Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-system-border" />
                <XAxis dataKey="date" className="text-system-muted-foreground" tick={{ fill: 'currentColor' }} />
                <YAxis className="text-system-muted-foreground" tick={{ fill: 'currentColor' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--system-background)',
                    border: '1px solid var(--system-border)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--system-blue)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--system-blue)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Calories & Protein Charts */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-medium text-system-foreground mb-4">Daily Calories</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calorieData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-system-border" />
                  <XAxis dataKey="date" className="text-system-muted-foreground" tick={{ fill: 'currentColor' }} />
                  <YAxis className="text-system-muted-foreground" tick={{ fill: 'currentColor' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--system-background)',
                      border: '1px solid var(--system-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="var(--system-orange)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-medium text-system-foreground mb-4">Daily Protein</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={proteinData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-system-border" />
                  <XAxis dataKey="date" className="text-system-muted-foreground" tick={{ fill: 'currentColor' }} />
                  <YAxis className="text-system-muted-foreground" tick={{ fill: 'currentColor' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--system-background)',
                      border: '1px solid var(--system-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="var(--system-blue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Workout Volume Chart */}
        <Card className="p-4">
          <h3 className="font-medium text-system-foreground mb-4">Workout Volume</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-system-border" />
                <XAxis dataKey="date" className="text-system-muted-foreground" tick={{ fill: 'currentColor' }} />
                <YAxis className="text-system-muted-foreground" tick={{ fill: 'currentColor' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--system-background)',
                    border: '1px solid var(--system-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="volume" fill="var(--system-purple)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {!isOnline && (
          <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
              Offline mode – showing cached progress data. Sync happens automatically when online.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}