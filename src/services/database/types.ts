export interface UserSettings {
  id?: number;
  apiKey?: string;
  baselineMetrics: {
    weight: number;
    height: number;
    age: number;
    gender: 'male' | 'female';
  };
  dailyMacroTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  primaryGoal: 'lose' | 'maintain' | 'gain';
  dumbbellWeights: {
    minKg: number;
    maxKg: number;
  };
}

export interface BodyMetricsEntry {
  id?: number;
  date: string;
  weight: number;
  waist?: number;
  chest?: number;
  arms?: number;
  notes?: string;
}

export interface DailyRoutine {
  id?: number;
  date: string;
  workoutPlan: Record<string, unknown>;
  generatedAt: string;
  energyLevel: number;
  availableTime: number;
  calorieIntake?: number;
}

export interface NutritionLog {
  id?: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  naturalLanguageInput: string;
  parsedMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  timestamp: string;
}

export interface SyncQueue {
  id?: number;
  type: 'nutrition' | 'workout' | 'metrics';
  payload: Record<string, unknown>;
  createdAt: string;
  syncedAt?: string;
}

export type EntityType = 'settings' | 'bodyMetrics' | 'dailyRoutines' | 'nutritionLogs' | 'syncQueue';