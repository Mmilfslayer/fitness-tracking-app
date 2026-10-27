import { db } from './schema';
import type {
  UserSettings,
  BodyMetricsEntry,
  DailyRoutine,
  NutritionLog,
  SyncQueue,
} from './types';

const DEFAULT_SETTINGS: UserSettings = {
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

export async function initDatabase(): Promise<void> {
  await db.open();
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add(DEFAULT_SETTINGS);
  }
}

export async function getSettings(): Promise<UserSettings> {
  const settings = await db.settings.toArray();
  return settings[0] || DEFAULT_SETTINGS;
}

export async function updateSettings(settings: Partial<UserSettings>): Promise<void> {
  const existing = await db.settings.toArray();
  if (existing.length > 0) {
    await db.settings.update(existing[0].id!, settings);
  } else {
    await db.settings.add({ ...DEFAULT_SETTINGS, ...settings });
  }
}

export async function addBodyMetrics(entry: BodyMetricsEntry): Promise<number> {
  return await db.bodyMetrics.add(entry);
}

export async function updateBodyMetrics(id: number, entry: Partial<BodyMetricsEntry>): Promise<void> {
  await db.bodyMetrics.update(id, entry);
}

export async function deleteBodyMetrics(id: number): Promise<void> {
  await db.bodyMetrics.delete(id);
}

export async function getBodyMetricsRange(startDate: string, endDate: string): Promise<BodyMetricsEntry[]> {
  return await db.bodyMetrics
    .where('date')
    .between(startDate, endDate, true, true)
    .sortBy('date');
}

export async function getLatestBodyMetrics(): Promise<BodyMetricsEntry | undefined> {
  const entries = await db.bodyMetrics.orderBy('date').reverse().limit(1).toArray();
  return entries[0];
}

export async function addDailyRoutine(routine: DailyRoutine): Promise<number> {
  const existing = await db.dailyRoutines.where('date').equals(routine.date).first();
  if (existing) {
    // Create update spec without id and with proper typing
    const { id, ...updateData } = routine;
    await db.dailyRoutines.update(existing.id!, updateData);
    return existing.id!;
  }
  return await db.dailyRoutines.add(routine);
}

export async function getTodaysRoutine(date: string): Promise<DailyRoutine | undefined> {
  return await db.dailyRoutines.where('date').equals(date).first();
}

export async function getDailyRoutineByDate(date: string): Promise<DailyRoutine | undefined> {
  return await db.dailyRoutines.where('date').equals(date).first();
}

export async function getDailyRoutinesRange(startDate: string, endDate: string): Promise<DailyRoutine[]> {
  return await db.dailyRoutines
    .where('date')
    .between(startDate, endDate, true, true)
    .sortBy('date');
}

export async function addNutritionLog(log: NutritionLog): Promise<number> {
  return await db.nutritionLogs.add(log);
}

export async function updateNutritionLog(id: number, log: Partial<NutritionLog>): Promise<void> {
  await db.nutritionLogs.update(id, log);
}

export async function deleteNutritionLog(id: number): Promise<void> {
  await db.nutritionLogs.delete(id);
}

export async function getNutritionForDate(date: string): Promise<NutritionLog[]> {
  return await db.nutritionLogs.where('date').equals(date).toArray();
}

export async function getNutritionLogsRange(startDate: string, endDate: string): Promise<NutritionLog[]> {
  return await db.nutritionLogs
    .where('date')
    .between(startDate, endDate, true, true)
    .sortBy('date');
}

export async function getTodaysNutritionSummary(date: string): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}> {
  const logs = await getNutritionForDate(date);
  return logs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.parsedMacros.calories,
      protein: acc.protein + log.parsedMacros.protein,
      carbs: acc.carbs + log.parsedMacros.carbs,
      fat: acc.fat + log.parsedMacros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export async function addToSyncQueue(item: Omit<SyncQueue, 'id' | 'createdAt'>): Promise<number> {
  return await db.syncQueue.add({
    ...item,
    createdAt: new Date().toISOString(),
  });
}

export async function getPendingSync(): Promise<SyncQueue[]> {
  return await db.syncQueue.filter(item => item.syncedAt === undefined).toArray();
}

export async function markSynced(id: number): Promise<void> {
  await db.syncQueue.update(id, { syncedAt: new Date().toISOString() });
}

export async function processQueue(
  processor: (item: SyncQueue) => Promise<void>
): Promise<void> {
  const pending = await getPendingSync();
  for (const item of pending) {
    try {
      await processor(item);
      await markSynced(item.id!);
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
    }
  }
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.settings, db.bodyMetrics, db.dailyRoutines, db.nutritionLogs, db.syncQueue, async () => {
    await db.bodyMetrics.clear();
    await db.dailyRoutines.clear();
    await db.nutritionLogs.clear();
    await db.syncQueue.clear();
    await db.settings.clear();
    await db.settings.add(DEFAULT_SETTINGS);
  });
}