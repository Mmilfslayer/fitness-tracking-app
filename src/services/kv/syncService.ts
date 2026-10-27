import { db } from '@/services/database/schema';
import type { SyncQueue } from '@/services/database/types';

export interface SyncPayload {
  userId: string;
  protein: number;
  proteinTarget: number;
  calories: number;
  workoutStatus: 'completed' | 'in_progress' | 'not_started';
  timestamp: string;
  [key: string]: unknown; // Index signature for compatibility with Record<string, unknown>
}

export interface KVSyncConfig {
  baseUrl: string;
  apiKey: string;
  batchSize: number;
  maxRetries: number;
  baseRetryDelayMs: number;
}

const DEFAULT_CONFIG: KVSyncConfig = {
  baseUrl: 'https://api.vercel.com/v1/kv',
  apiKey: '',
  batchSize: 10,
  maxRetries: 3,
  baseRetryDelayMs: 1000,
};

export class KVSyncService {
  private config: KVSyncConfig;
  private userId: string;
  private isProcessing = false;

  constructor(config: Partial<KVSyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.userId = this.getOrCreateUserId();
  }

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem('fitness_user_id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('fitness_user_id', userId);
    }
    return userId;
  }

  async initialize(): Promise<void> {
    const settings = await db.settings.toArray();
    if (settings.length > 0 && settings[0].apiKey) {
      this.config.apiKey = settings[0].apiKey!;
    }
  }

  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  async queueNutritionSync(protein: number, calories: number): Promise<void> {
    const settings = await db.settings.toArray();
    const proteinTarget = settings[0]?.dailyMacroTargets?.protein || 150;

    await this.addToQueue('nutrition', {
      userId: this.userId,
      protein,
      proteinTarget,
      calories,
      workoutStatus: 'not_started',
      timestamp: new Date().toISOString(),
    });
  }

  async queueWorkoutSync(status: SyncPayload['workoutStatus']): Promise<void> {
    const settings = await db.settings.toArray();
    const todaysNutrition = await db.nutritionLogs.where('date').equals(new Date().toISOString().split('T')[0]).toArray();
    const totalProtein = todaysNutrition.reduce((sum, log) => sum + log.parsedMacros.protein, 0);
    const totalCalories = todaysNutrition.reduce((sum, log) => sum + log.parsedMacros.calories, 0);
    const proteinTarget = settings[0]?.dailyMacroTargets?.protein || 150;

    await this.addToQueue('workout', {
      userId: this.userId,
      protein: totalProtein,
      proteinTarget,
      calories: totalCalories,
      workoutStatus: status,
      timestamp: new Date().toISOString(),
    });
  }

  async queueMetricsSync(_weight: number): Promise<void> {
    const settings = await db.settings.toArray();
    const todaysNutrition = await db.nutritionLogs.where('date').equals(new Date().toISOString().split('T')[0]).toArray();
    const totalProtein = todaysNutrition.reduce((sum, log) => sum + log.parsedMacros.protein, 0);
    const totalCalories = todaysNutrition.reduce((sum, log) => sum + log.parsedMacros.calories, 0);
    const proteinTarget = settings[0]?.dailyMacroTargets?.protein || 150;

    await this.addToQueue('metrics', {
      userId: this.userId,
      protein: totalProtein,
      proteinTarget,
      calories: totalCalories,
      workoutStatus: 'not_started',
      timestamp: new Date().toISOString(),
    });
  }

  private async addToQueue(type: SyncQueue['type'], payload: SyncPayload): Promise<void> {
    await db.syncQueue.add({
      type,
      payload,
      createdAt: new Date().toISOString(),
    });

    // Try to process queue immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine || !this.config.apiKey) {
      return;
    }

    this.isProcessing = true;

    try {
      const pending = await db.syncQueue.filter(item => item.syncedAt === undefined).toArray();

      if (pending.length === 0) {
        return;
      }

      // Process in batches
      for (let i = 0; i < pending.length; i += this.config.batchSize) {
        const batch = pending.slice(i, i + this.config.batchSize);
        await this.processBatch(batch);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processBatch(batch: SyncQueue[]): Promise<void> {
    for (const item of batch) {
      await this.syncWithRetry(item);
    }
  }

  private async syncWithRetry(item: SyncQueue, attempt = 0): Promise<void> {
    try {
      await this.sendToKV(item.payload as SyncPayload);
      await db.syncQueue.update(item.id!, { syncedAt: new Date().toISOString() });
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        const delay = this.config.baseRetryDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        await this.syncWithRetry(item, attempt + 1);
      } else {
        console.error(`Failed to sync item ${item.id} after ${this.config.maxRetries} retries:`, error);
      }
    }
  }

  private async sendToKV(payload: SyncPayload): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/set`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: `fitness:${this.userId}:${payload.timestamp}`,
        value: JSON.stringify(payload),
        ttl: 86400 * 30, // 30 days
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`KV sync failed: ${response.status} - ${error.message || response.statusText}`);
    }
  }

  async pullLatestData(): Promise<SyncPayload | null> {
    if (!this.config.apiKey || !navigator.onLine) {
      return null;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/get?key=fitness:${this.userId}:latest`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.result ? JSON.parse(data.result) : null;
    } catch {
      return null;
    }
  }

  getUserId(): string {
    return this.userId;
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}

export const kvSyncService = new KVSyncService();