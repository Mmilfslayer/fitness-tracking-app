// Utility functions for the fitness tracking application

import { format, parseISO, differenceInMinutes, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { ExerciseSet, MuscleGroup, Equipment, Workout, UserPreferences } from '../types';

// Date formatting utilities
export const formatDate = (date: Date | string, pattern: string = 'MMM d, yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export const formatDurationShort = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// ID generation
export const generateId = (): string => uuidv4();

// Weight formatting
export const formatWeight = (weight: number, unit: 'kg' | 'lbs', precision: number = 1): string => {
  return `${weight.toFixed(precision)} ${unit}`;
};

export const convertWeight = (weight: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs'): number => {
  if (fromUnit === toUnit) return weight;
  const conversionFactor = fromUnit === 'kg' ? 2.20462 : 1 / 2.20462;
  return Math.round(weight * conversionFactor * 10) / 10;
};

// Volume calculation
export const calculateVolume = (sets: ExerciseSet[]): number => {
  return sets.reduce((total, set) => {
    if (!set.completed) return total;
    return total + (set.weight * set.reps);
  }, 0);
};

export const calculateTotalVolume = (workout: Workout): number => {
  return workout.exercises.reduce((total, exercise) => {
    return total + calculateVolume(exercise.sets);
  }, 0);
};

// One-rep max calculation (Epley formula)
export const calculateOneRepMax = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
};

// Muscle group utilities
export const getMuscleGroupLabel = (group: MuscleGroup): string => {
  const labels: Record<MuscleGroup, string> = {
    chest: 'Chest',
    back: 'Back',
    shoulders: 'Shoulders',
    biceps: 'Biceps',
    triceps: 'Triceps',
    forearms: 'Forearms',
    abs: 'Abs',
    quadriceps: 'Quadriceps',
    hamstrings: 'Hamstrings',
    glutes: 'Glutes',
    calves: 'Calves',
    cardio: 'Cardio',
    full_body: 'Full Body'
  };
  return labels[group];
};

export const getMuscleGroupColor = (group: MuscleGroup): string => {
  const colors: Record<MuscleGroup, string> = {
    chest: '#FF3B30',      // system-red
    back: '#007AFF',       // system-blue
    shoulders: '#FF9F0A',  // system-orange
    biceps: '#AF52DE',     // system-purple
    triceps: '#FF2D55',    // system-pink
    forearms: '#5856D6',   // system-indigo
    abs: '#34C759',        // system-green
    quadriceps: '#FFCC00', // system-yellow
    hamstrings: '#5AC8FA', // system-teal
    glutes: '#FF3B30',     // system-red
    calves: '#FF9F0A',     // system-orange
    cardio: '#007AFF',     // system-blue
    full_body: '#5856D6'   // system-indigo
  };
  return colors[group];
};

// Equipment utilities
export const getEquipmentLabel = (equipment: Equipment): string => {
  const labels: Record<Equipment, string> = {
    barbell: 'Barbell',
    dumbbell: 'Dumbbell',
    machine: 'Machine',
    cable: 'Cable',
    bodyweight: 'Bodyweight',
    kettlebell: 'Kettlebell',
    resistance_band: 'Resistance Band',
    smith_machine: 'Smith Machine',
    ez_bar: 'EZ Bar',
    trap_bar: 'Trap Bar',
    other: 'Other'
  };
  return labels[equipment];
};

export const getEquipmentIcon = (equipment: Equipment): string => {
  const icons: Record<Equipment, string> = {
    barbell: '🏋️',
    dumbbell: '🏋️‍♂️',
    machine: '🏋️‍♀️',
    cable: '🔗',
    bodyweight: '🤸',
    kettlebell: '🔮',
    resistance_band: '🟣',
    smith_machine: '🏗️',
    ez_bar: '🏋️',
    trap_bar: '🏋️',
    other: '📦'
  };
  return icons[equipment];
};

// Workout utilities
export const getWorkoutDuration = (workout: Workout): number => {
  if (workout.duration) return workout.duration;
  if (workout.completedAt && workout.startedAt) {
    return differenceInMinutes(new Date(workout.completedAt), new Date(workout.startedAt)) * 60;
  }
  return 0;
};

export const isWorkoutCompleted = (workout: Workout): boolean => {
  return !!workout.completedAt;
};

export const getCompletedExercisesCount = (workout: Workout): number => {
  return workout.exercises.filter(ex =>
    ex.sets.some(set => set.completed)
  ).length;
};

export const getTotalSetsCount = (workout: Workout): number => {
  return workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
};

export const getCompletedSetsCount = (workout: Workout): number => {
  return workout.exercises.reduce((total, ex) =>
    total + ex.sets.filter(set => set.completed).length, 0
  );
};

// Preferences utilities
export const getDefaultPreferences = (): UserPreferences => ({
  units: 'metric',
  theme: 'system',
  notifications: true,
  workoutReminders: true,
  weeklyGoal: 150, // 150 minutes per week
  defaultRestTime: 90 // 90 seconds
});

export const getPreferredUnit = (preferences: UserPreferences): 'kg' | 'lbs' => {
  return preferences.units === 'metric' ? 'kg' : 'lbs';
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Array utilities
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T, K>(array: T[], key: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter(item => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// Number utilities
export const roundTo = (num: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

// Date range utilities
export const getWeekRange = (date: Date = new Date()): { start: Date; end: Date } => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 })
  };
};

export const isDateInWeek = (date: Date, weekStart: Date): boolean => {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return isWithinInterval(date, { start: weekStart, end: weekEnd });
};

// Local storage utilities
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
  clear: (): void => {
    localStorage.clear();
  }
};

// Debounce utility
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Haptic feedback (for mobile)
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'): void => {
  if ('vibrate' in navigator) {
    const patterns: Record<string, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10],
      warning: [20, 50, 20],
      error: [30, 50, 30, 50, 30]
    };
    navigator.vibrate(patterns[type]);
  }
};

// Screen utilities
export const isMobile = (): boolean => {
  return window.innerWidth < 768;
};

export const isTablet = (): boolean => {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = (): boolean => {
  return window.innerWidth >= 1024;
};

export const getSafeAreaInsets = (): { top: number; bottom: number; left: number; right: number } => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10)
  };
};