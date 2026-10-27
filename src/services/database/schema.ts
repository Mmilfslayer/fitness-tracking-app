import Dexie, { Table } from 'dexie';
import type {
  UserSettings,
  BodyMetricsEntry,
  DailyRoutine,
  NutritionLog,
  SyncQueue,
} from './types';

export class FitnessDatabase extends Dexie {
  settings!: Table<UserSettings, number>;
  bodyMetrics!: Table<BodyMetricsEntry, number>;
  dailyRoutines!: Table<DailyRoutine, number>;
  nutritionLogs!: Table<NutritionLog, number>;
  syncQueue!: Table<SyncQueue, number>;

  constructor() {
    super('FitnessDatabase');
    this.version(1).stores({
      settings: '++id',
      bodyMetrics: '++id, date',
      dailyRoutines: '++id, date',
      nutritionLogs: '++id, date, mealType',
      syncQueue: '++id, type, createdAt',
    });
  }
}

export const db = new FitnessDatabase();