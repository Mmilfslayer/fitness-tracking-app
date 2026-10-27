import { useState, useEffect, useCallback, useRef } from 'react';
import { liveQuery } from 'dexie';
import { db } from './schema';

// Custom useLiveQuery hook using Dexie's liveQuery
function useLiveQuery<T>(query: () => Promise<T>, deps: unknown[], defaultValue?: T): T | undefined {
  const [result, setResult] = useState<T | undefined>(defaultValue);
  const queryRef = useRef(query);

  // Update query ref when deps change
  useEffect(() => {
    queryRef.current = query;
  }, deps);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const executeQuery = async () => {
      try {
        // liveQuery returns an Observable, subscribe to it
        const observable = liveQuery(async () => {
          const data = await queryRef.current();
          if (mounted) {
            setResult(data);
          }
        });

        // Subscribe and get the subscription object
        subscription = observable.subscribe();

        // Wait for initial value
        await new Promise(resolve => setTimeout(resolve, 0));
      } catch (error) {
        console.error('Live query error:', error);
      }
    };

    executeQuery();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, deps);

  return result;
}
import type {
  UserSettings,
  BodyMetricsEntry,
  DailyRoutine,
  NutritionLog,
  SyncQueue,
} from './types';
import {
  initDatabase,
  getSettings,
  updateSettings,
  addBodyMetrics,
  updateBodyMetrics,
  deleteBodyMetrics,
  getBodyMetricsRange,
  getLatestBodyMetrics,
  addDailyRoutine,
  getTodaysRoutine,
  getDailyRoutinesRange,
  addNutritionLog,
  updateNutritionLog,
  deleteNutritionLog,
  getNutritionForDate,
  getNutritionLogsRange,
  getTodaysNutritionSummary,
  addToSyncQueue,
  getPendingSync,
  markSynced,
  processQueue,
} from './db';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setIsReady(true));
  }, []);

  const settings = useLiveQuery(() => getSettings(), [], isReady ? undefined : DEFAULT_SETTINGS);
  const bodyMetrics = useLiveQuery(() => db.bodyMetrics.orderBy('date').reverse().toArray(), []);
  const dailyRoutines = useLiveQuery(() => db.dailyRoutines.orderBy('date').reverse().toArray(), []);
  const nutritionLogs = useLiveQuery(() => db.nutritionLogs.orderBy('date').reverse().toArray(), []);
  const syncQueue = useLiveQuery(() => db.syncQueue.orderBy('createdAt').toArray(), []);

  const saveSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    await updateSettings(newSettings);
  }, []);

  const addMetrics = useCallback(async (entry: BodyMetricsEntry) => {
    return await addBodyMetrics(entry);
  }, []);

  const updateMetrics = useCallback(async (id: number, entry: Partial<BodyMetricsEntry>) => {
    await updateBodyMetrics(id, entry);
  }, []);

  const removeMetrics = useCallback(async (id: number) => {
    await deleteBodyMetrics(id);
  }, []);

  const getMetricsRange = useCallback(async (startDate: string, endDate: string) => {
    return await getBodyMetricsRange(startDate, endDate);
  }, []);

  const getLatestMetrics = useCallback(async () => {
    return await getLatestBodyMetrics();
  }, []);

  const saveRoutine = useCallback(async (routine: DailyRoutine) => {
    return await addDailyRoutine(routine);
  }, []);

  const getRoutineForDate = useCallback(async (date: string) => {
    return await getTodaysRoutine(date);
  }, []);

  const getRoutinesRange = useCallback(async (startDate: string, endDate: string) => {
    return await getDailyRoutinesRange(startDate, endDate);
  }, []);

  const addNutrition = useCallback(async (log: NutritionLog) => {
    return await addNutritionLog(log);
  }, []);

  const updateNutrition = useCallback(async (id: number, log: Partial<NutritionLog>) => {
    await updateNutritionLog(id, log);
  }, []);

  const removeNutrition = useCallback(async (id: number) => {
    await deleteNutritionLog(id);
  }, []);

  const getNutritionForDay = useCallback(async (date: string) => {
    return await getNutritionForDate(date);
  }, []);

  const getNutritionRange = useCallback(async (startDate: string, endDate: string) => {
    return await getNutritionLogsRange(startDate, endDate);
  }, []);

  const getDailyNutritionSummary = useCallback(async (date: string) => {
    return await getTodaysNutritionSummary(date);
  }, []);

  const queueSync = useCallback(async (item: Omit<SyncQueue, 'id' | 'createdAt'>) => {
    return await addToSyncQueue(item);
  }, []);

  const getPending = useCallback(async () => {
    return await getPendingSync();
  }, []);

  const markItemSynced = useCallback(async (id: number) => {
    await markSynced(id);
  }, []);

  const runQueueProcessor = useCallback(async (processor: (item: SyncQueue) => Promise<void>) => {
    await processQueue(processor);
  }, []);

  return {
    isReady,
    settings,
    bodyMetrics,
    dailyRoutines,
    nutritionLogs,
    syncQueue,
    saveSettings,
    addMetrics,
    updateMetrics,
    removeMetrics,
    getMetricsRange,
    getLatestMetrics,
    saveRoutine,
    getRoutineForDate,
    getRoutinesRange,
    addNutrition,
    updateNutrition,
    removeNutrition,
    getNutritionForDay,
    getNutritionRange,
    getDailyNutritionSummary,
    queueSync,
    getPending,
    markItemSynced,
    runQueueProcessor,
  };
}

export const DEFAULT_SETTINGS: UserSettings = {
  baselineMetrics: {
    weight: 70,
    height: 175,
    age: 30,
    gender: 'male',
  },
  dailyMacroTargets: {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
  },
  primaryGoal: 'maintain',
  dumbbellWeights: {
    minKg: 5,
    maxKg: 25,
  },
};

export function useSettings() {
  const { settings, saveSettings, isReady } = useDatabase();
  return { settings, saveSettings, isReady };
}

export function useBodyMetrics() {
  const { bodyMetrics, addMetrics, updateMetrics, removeMetrics, getMetricsRange, getLatestMetrics, isReady } = useDatabase();
  return { bodyMetrics, addMetrics, updateMetrics, removeMetrics, getMetricsRange, getLatestMetrics, isReady };
}

export function useDailyRoutines() {
  const { dailyRoutines, saveRoutine, getRoutineForDate, getRoutinesRange, isReady } = useDatabase();
  return { dailyRoutines, saveRoutine, getRoutineForDate, getRoutinesRange, isReady };
}

export function useNutritionLogs() {
  const { nutritionLogs, addNutrition, updateNutrition, removeNutrition, getNutritionForDay, getNutritionRange, getDailyNutritionSummary, isReady } = useDatabase();
  return { nutritionLogs, addNutrition, updateNutrition, removeNutrition, getNutritionForDay, getNutritionRange, getDailyNutritionSummary, isReady };
}

export function useSyncQueue() {
  const { syncQueue, queueSync, getPending, markItemSynced, runQueueProcessor, isReady } = useDatabase();
  return { syncQueue, queueSync, getPending, markItemSynced, runQueueProcessor, isReady };
}