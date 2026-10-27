// Core domain types for the fitness tracking application

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  workoutReminders: boolean;
  weeklyGoal: number; // in minutes
  defaultRestTime: number; // in seconds
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  caloriesBurned?: number;
  notes?: string;
  isTemplate: boolean;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  sets: ExerciseSet[];
  order: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number; // in kg or lbs based on user preference
  unit: 'kg' | 'lbs';
  restTime?: number; // in seconds
  rpe?: number; // Rate of Perceived Exertion (1-10)
  completed: boolean;
  completedAt?: Date;
}

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'cardio'
  | 'full_body';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'resistance_band'
  | 'smith_machine'
  | 'ez_bar'
  | 'trap_bar'
  | 'other';

export interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
  estimatedDuration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateExercise {
  id: string;
  templateId: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  targetSets: number;
  targetReps: number | [number, number]; // single number or range
  targetWeight?: number;
  targetUnit?: 'kg' | 'lbs';
  targetRestTime: number;
  order: number;
  notes?: string;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: Date;
  weight?: number;
  bodyFatPercentage?: number;
  measurements: BodyMeasurements;
  photos?: ProgressPhoto[];
  notes?: string;
}

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  neck?: number;
}

export interface ProgressPhoto {
  id: string;
  progressEntryId: string;
  angle: 'front' | 'side' | 'back';
  url: string;
  createdAt: Date;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // in minutes
  totalVolume: number; // weight * reps * sets
  totalCaloriesBurned: number;
  currentStreak: number;
  longestStreak: number;
  averageWorkoutsPerWeek: number;
  favoriteMuscleGroup: MuscleGroup;
  favoriteExercise: string;
  personalRecords: PersonalRecord[];
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  unit: 'kg' | 'lbs';
  date: Date;
  oneRepMax: number;
}

export interface AIWorkoutRecommendation {
  id: string;
  userId: string;
  generatedAt: Date;
  workout: Workout;
  reasoning: string;
  confidence: number; // 0-1
  basedOn: 'history' | 'goals' | 'recovery' | 'progressive_overload';
}

export interface NutritionEntry {
  id: string;
  userId: string;
  date: Date;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface Meal {
  id: string;
  nutritionEntryId: string;
  name: string;
  time: Date;
  foods: FoodItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  id: string;
  mealId: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// UI State types
export type Theme = 'light' | 'dark' | 'system';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  content?: React.ReactNode;
  onClose?: () => void;
}

// Chart data types
export interface ChartDataPoint {
  date: string | Date;
  value: number;
  label?: string;
}

export interface MuscleGroupVolume {
  muscleGroup: MuscleGroup;
  volume: number;
  percentage: number;
}

export interface WeeklyProgress {
  week: string;
  workouts: number;
  duration: number;
  volume: number;
  calories: number;
}