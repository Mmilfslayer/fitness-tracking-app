/**
 * Workout Service
 * Generates structured workout plans using AI
 * Supports bodyweight + dumbbell only equipment constraints
 */

import { GeminiClient, getDefaultClient } from './gemini';
import {
  WORKOUT_GENERATOR_PROMPT,
  buildWorkoutPrompt,
} from './prompts';
import {
  AIError,
  AIErrorCode,
  executeWithFallback,
  FallbackStrategy,
} from './errorTypes';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'core'
  | 'obliques'
  | 'arms'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'cardio'
  | 'full_body'
  | 'cardio'
  | 'full_body';

// ============================================================================
// Types
// ============================================================================

export interface WorkoutGenerationParams {
  energyLevel: 1 | 2 | 3 | 4 | 5;
  availableTime: number; // minutes
  calorieIntake: number; // today's calories
  currentMetrics: {
    weight: number; // kg
    height: number; // cm
    age: number;
    bodyFatPercentage?: number;
  };
  goal: 'strength' | 'hypertrophy' | 'endurance' | 'fat_loss' | 'general_fitness';
  maxDumbbellWeight: number; // kg (5-15)
  preferredFocus?: MuscleGroup[];
  injuries?: string[];
}

export interface GeneratedExercise {
  name: string;
  type: 'strength' | 'cardio' | 'mobility' | 'core';
  sets: number;
  reps: number | [number, number];
  restSeconds: number;
  weightKg?: number;
  instructions: string;
  muscleGroups: MuscleGroup[];
}

export interface GeneratedWorkout {
  exercises: GeneratedExercise[];
  totalDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: MuscleGroup[];
  warmup: string[];
  cooldown: string[];
}

export interface WorkoutServiceConfig {
  geminiClient?: GeminiClient;
  enableCache?: boolean;
  cacheTTLMs?: number;
  defaultMaxDumbbellWeight?: number;
}

// ============================================================================
// Cache Implementation
// ============================================================================

interface WorkoutCacheEntry {
  data: GeneratedWorkout;
  timestamp: number;
  paramsHash: string;
}

class WorkoutCache {
  private cache = new Map<string, WorkoutCacheEntry>();
  private ttl: number;

  constructor(ttlMs: number = 1800000) { // 30 minutes default
    this.ttl = ttlMs;
  }

  private hashParams(params: WorkoutGenerationParams): string {
    const str = JSON.stringify(params);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  get(params: WorkoutGenerationParams): GeneratedWorkout | null {
    const key = this.hashParams(params);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(params: WorkoutGenerationParams, data: GeneratedWorkout): void {
    const key = this.hashParams(params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      paramsHash: key,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// ============================================================================
// Fallback Workout Templates
// ============================================================================

function createBeginnerFullBodyWorkout(params: WorkoutGenerationParams): GeneratedWorkout {
  const maxWeight = Math.min(params.maxDumbbellWeight, 10);
  const workingWeight = Math.round(maxWeight * 0.7);

  return {
    exercises: [
      {
        name: 'Goblet Squats',
        type: 'strength',
        sets: 3,
        reps: 12,
        restSeconds: 90,
        weightKg: workingWeight,
        instructions: 'Hold dumbbell at chest, squat down keeping chest up, drive through heels',
        muscleGroups: ['quadriceps', 'glutes', 'core'],
      },
      {
        name: 'Push-ups (knees if needed)',
        type: 'strength',
        sets: 3,
        reps: [8, 15],
        restSeconds: 90,
        instructions: 'Keep core tight, lower chest to floor, push up explosively',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
      },
      {
        name: 'Dumbbell Rows (single arm)',
        type: 'strength',
        sets: 3,
        reps: 10,
        restSeconds: 90,
        weightKg: workingWeight,
        instructions: 'Support on bench, pull dumbbell to hip, squeeze shoulder blade',
        muscleGroups: ['back', 'biceps'],
      },
      {
        name: 'Dumbbell Overhead Press',
        type: 'strength',
        sets: 3,
        reps: 10,
        restSeconds: 90,
        weightKg: Math.round(workingWeight * 0.6),
        instructions: 'Press overhead, keep core engaged, don\'t arch back',
        muscleGroups: ['shoulders', 'triceps'],
      },
      {
        name: 'Glute Bridges',
        type: 'strength',
        sets: 3,
        reps: 15,
        restSeconds: 60,
        instructions: 'Drive through heels, squeeze glutes at top, hold 2 seconds',
        muscleGroups: ['glutes', 'hamstrings'],
      },
      {
        name: 'Plank',
        type: 'core',
        sets: 3,
        reps: 30, // seconds
        restSeconds: 60,
        instructions: 'Forearms on ground, body straight, engage core and glutes',
        muscleGroups: ['abs'],
      },
    ],
    totalDuration: Math.min(params.availableTime, 35),
    difficulty: 'beginner',
    focus: ['quadriceps', 'chest', 'back', 'shoulders', 'glutes', 'abs'],
    warmup: [
      'Arm circles (30s forward, 30s backward)',
      'Bodyweight squats (15 reps)',
      'Cat-cow stretch (30s)',
      'Shoulder rolls (30s)',
      'Glute bridges (10 reps)',
    ],
    cooldown: [
      'Child\'s pose (30s)',
      'Chest stretch on wall (30s/side)',
      'Hip flexor stretch (30s/side)',
      'Neck stretches (30s)',
      'Deep breathing (1 min)',
    ],
  };
}

function createIntermediateUpperLowerWorkout(params: WorkoutGenerationParams): GeneratedWorkout {
  const maxWeight = params.maxDumbbellWeight;
  const workingWeight = Math.round(maxWeight * 0.75);
  const isUpper = Math.random() > 0.5; // Alternate upper/lower

  if (isUpper) {
    return {
      exercises: [
        {
          name: 'Dumbbell Bench Press (floor)',
          type: 'strength',
          sets: 4,
          reps: 8,
          restSeconds: 120,
          weightKg: workingWeight,
          instructions: 'Lower with control, press explosively, 3-0-1 tempo',
          muscleGroups: ['chest', 'triceps', 'shoulders'],
        },
        {
          name: 'Dumbbell Rows (supported)',
          type: 'strength',
          sets: 4,
          reps: 10,
          restSeconds: 120,
          weightKg: workingWeight,
          instructions: 'Pull to hip, squeeze lat, control eccentric',
          muscleGroups: ['back', 'biceps'],
        },
        {
          name: 'Dumbbell Overhead Press',
          type: 'strength',
          sets: 3,
          reps: 10,
          restSeconds: 90,
          weightKg: Math.round(workingWeight * 0.7),
          instructions: 'Standing, brace core, press straight up',
          muscleGroups: ['shoulders', 'triceps'],
        },
        {
          name: 'Dumbbell Lateral Raises',
          type: 'strength',
          sets: 3,
          reps: 15,
          restSeconds: 60,
          weightKg: Math.round(maxWeight * 0.3),
          instructions: 'Slight bend in elbows, raise to shoulder height',
          muscleGroups: ['shoulders'],
        },
        {
          name: 'Diamond Push-ups',
          type: 'strength',
          sets: 3,
          reps: [8, 12],
          restSeconds: 90,
          instructions: 'Hands close together, target triceps',
          muscleGroups: ['triceps', 'chest'],
        },
        {
          name: 'Dumbbell Bicep Curls',
          type: 'strength',
          sets: 3,
          reps: 12,
          restSeconds: 60,
          weightKg: Math.round(maxWeight * 0.5),
          instructions: 'Supinate at top, control negative',
          muscleGroups: ['biceps'],
        },
        {
          name: 'Plank with Shoulder Taps',
          type: 'core',
          sets: 3,
          reps: 20, // total taps
          restSeconds: 60,
          instructions: 'Stay stable, alternate shoulder taps',
          muscleGroups: ['abs', 'shoulders'],
        },
      ],
      totalDuration: Math.min(params.availableTime, 45),
      difficulty: 'intermediate',
      focus: ['chest', 'back', 'shoulders', 'triceps', 'biceps', 'abs'],
      warmup: [
        'Band pull-aparts (15 reps)',
        'Scapular push-ups (10 reps)',
        'Arm circles (30s each direction)',
        'Cat-cow (30s)',
        'Push-up to down dog (5 reps)',
      ],
      cooldown: [
        'Doorway chest stretch (30s/side)',
        'Thread the needle (30s/side)',
        'Child\'s pose (30s)',
        'Neck release (30s/side)',
      ],
    };
  } else {
    return {
      exercises: [
        {
          name: 'Goblet Squats',
          type: 'strength',
          sets: 4,
          reps: 10,
          restSeconds: 120,
          weightKg: workingWeight,
          instructions: 'Deep squat, drive through heels, 3-1-1 tempo',
          muscleGroups: ['quadriceps', 'glutes', 'core'],
        },
        {
          name: 'Romanian Deadlifts',
          type: 'strength',
          sets: 4,
          reps: 10,
          restSeconds: 120,
          weightKg: workingWeight,
          instructions: 'Hinge at hips, keep back flat, feel hamstring stretch',
          muscleGroups: ['hamstrings', 'glutes', 'back'],
        },
        {
          name: 'Bulgarian Split Squats',
          type: 'strength',
          sets: 3,
          reps: 10,
          restSeconds: 90,
          weightKg: Math.round(workingWeight * 0.6),
          instructions: 'Rear foot elevated, front knee tracks toes',
          muscleGroups: ['quadriceps', 'glutes'],
        },
        {
          name: 'Dumbbell Hip Thrusts',
          type: 'strength',
          sets: 3,
          reps: 12,
          restSeconds: 90,
          weightKg: workingWeight,
          instructions: 'Upper back on bench, drive through heels, squeeze glutes',
          muscleGroups: ['glutes', 'hamstrings'],
        },
        {
          name: 'Calf Raises',
          type: 'strength',
          sets: 4,
          reps: 15,
          restSeconds: 60,
          weightKg: workingWeight,
          instructions: 'Full stretch at bottom, pause at top',
          muscleGroups: ['calves'],
        },
        {
          name: 'Dead Bug',
          type: 'core',
          sets: 3,
          reps: 12, // per side
          restSeconds: 60,
          instructions: 'Lower opposite arm/leg, keep back pressed to floor',
          muscleGroups: ['abs'],
        },
        {
          name: 'Side Plank',
          type: 'core',
          sets: 3,
          reps: 30, // seconds per side
          restSeconds: 60,
          instructions: 'Stack feet, lift hips, hold',
          muscleGroups: ['abs', 'obliques'],
        },
      ],
      totalDuration: Math.min(params.availableTime, 50),
      difficulty: 'intermediate',
      focus: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abs'],
      warmup: [
        'Bodyweight squats (15 reps)',
        'Leg swings (15/side)',
        'Hip circles (10/side)',
        'Glute bridges (15 reps)',
        'Walking lunges (10/side)',
      ],
      cooldown: [
        'Pigeon pose (30s/side)',
        'Standing quad stretch (30s/side)',
        'Hamstring stretch (30s/side)',
        'Child\'s pose (30s)',
      ],
    };
  }
}

function createAdvancedFullBodyWorkout(params: WorkoutGenerationParams): GeneratedWorkout {
  const maxWeight = params.maxDumbbellWeight;
  const workingWeight = Math.round(maxWeight * 0.8);

  return {
    exercises: [
      {
        name: 'Dumbbell Clean & Press',
        type: 'strength',
        sets: 4,
        reps: 6,
        restSeconds: 150,
        weightKg: Math.round(workingWeight * 0.7),
        instructions: 'Explosive hip drive, catch at shoulders, press overhead',
        muscleGroups: ['full_body', 'shoulders', 'quadriceps'],
      },
      {
        name: 'Renegade Rows',
        type: 'strength',
        sets: 3,
        reps: 8,
        restSeconds: 120,
        weightKg: Math.round(workingWeight * 0.6),
        instructions: 'Plank position, row one arm, anti-rotation core',
        muscleGroups: ['back', 'core', 'shoulders'],
      },
      {
        name: 'Bulgarian Split Squats',
        type: 'strength',
        sets: 4,
        reps: 8,
        restSeconds: 120,
        weightKg: Math.round(workingWeight * 0.7),
        instructions: 'Control descent, drive up explosively',
        muscleGroups: ['quadriceps', 'glutes'],
      },
      {
        name: 'Dumbbell Floor Press',
        type: 'strength',
        sets: 4,
        reps: 8,
        restSeconds: 120,
        weightKg: workingWeight,
        instructions: 'Elbows 45 degrees, touch triceps to floor',
        muscleGroups: ['chest', 'triceps'],
      },
      {
        name: 'Dumbbell RDL to Row',
        type: 'strength',
        sets: 3,
        reps: 10,
        restSeconds: 90,
        weightKg: Math.round(workingWeight * 0.6),
        instructions: 'Hinge, row at bottom, stand up',
        muscleGroups: ['hamstrings', 'back', 'glutes'],
      },
      {
        name: 'Pike Push-ups',
        type: 'strength',
        sets: 3,
        reps: [8, 12],
        restSeconds: 90,
        instructions: 'Hips high, lower head to floor, press up',
        muscleGroups: ['shoulders', 'triceps'],
      },
      {
        name: 'Hanging Knee Raises / Leg Raises',
        type: 'core',
        sets: 3,
        reps: 12,
        restSeconds: 90,
        instructions: 'Control movement, avoid swinging',
        muscleGroups: ['abs'],
      },
      {
        name: 'Burpees',
        type: 'cardio',
        sets: 3,
        reps: 10,
        restSeconds: 60,
        instructions: 'Full burpee with push-up and jump',
        muscleGroups: ['full_body', 'cardio'],
      },
    ],
    totalDuration: Math.min(params.availableTime, 60),
    difficulty: 'advanced',
    focus: ['full_body', 'shoulders', 'quadriceps', 'glutes', 'chest', 'back', 'hamstrings', 'abs', 'cardio'],
    warmup: [
      'Jump rope / jumping jacks (2 min)',
      'World\'s greatest stretch (5/side)',
      'Band pull-aparts (15)',
      'Scapular push-ups (10)',
      'Bodyweight squats (15)',
      'Push-up to down dog (8)',
    ],
    cooldown: [
      'Pigeon pose (45s/side)',
      'Doorway chest stretch (30s/side)',
      'Child\'s pose to cobra (30s)',
      'Standing forward fold (30s)',
      'Deep breathing (1 min)',
    ],
  };
}

function createFatLossCircuitWorkout(params: WorkoutGenerationParams): GeneratedWorkout {
  const maxWeight = params.maxDumbbellWeight;
  const weight = Math.round(maxWeight * 0.5);

  return {
    exercises: [
      {
        name: 'Goblet Squats',
        type: 'strength',
        sets: 3,
        reps: 15,
        restSeconds: 30,
        weightKg: weight,
        instructions: 'Circuit style - move quickly to next exercise',
        muscleGroups: ['quadriceps', 'glutes', 'core'],
      },
      {
        name: 'Push-ups',
        type: 'strength',
        sets: 3,
        reps: [10, 20],
        restSeconds: 30,
        instructions: 'Modify on knees if needed',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
      },
      {
        name: 'Dumbbell Rows (alternating)',
        type: 'strength',
        sets: 3,
        reps: 12,
        restSeconds: 30,
        weightKg: weight,
        instructions: 'Alternate arms, minimal rest',
        muscleGroups: ['back', 'biceps'],
      },
      {
        name: 'Dumbbell Thrusters',
        type: 'cardio',
        sets: 3,
        reps: 12,
        restSeconds: 30,
        weightKg: Math.round(weight * 0.7),
        instructions: 'Squat to overhead press in one motion',
        muscleGroups: ['full_body', 'cardio', 'shoulders', 'quadriceps'],
      },
      {
        name: 'Mountain Climbers',
        type: 'cardio',
        sets: 3,
        reps: 40, // total
        restSeconds: 30,
        instructions: 'Fast pace, drive knees',
        muscleGroups: ['core', 'cardio', 'shoulders'],
      },
      {
        name: 'Dumbbell Swings',
        type: 'cardio',
        sets: 3,
        reps: 15,
        restSeconds: 30,
        weightKg: weight,
        instructions: 'Hip hinge, explosive swing to chest height',
        muscleGroups: ['glutes', 'hamstrings', 'core', 'cardio'],
      },
      {
        name: 'Plank Jacks',
        type: 'core',
        sets: 3,
        reps: 30, // seconds
        restSeconds: 30,
        instructions: 'Plank position, jump feet wide and narrow',
        muscleGroups: ['abs', 'cardio', 'shoulders'],
      },
    ],
    totalDuration: Math.min(params.availableTime, 30),
    difficulty: 'intermediate',
    focus: ['full_body', 'cardio', 'quadriceps', 'glutes', 'chest', 'back', 'core'],
    warmup: [
      'Marching in place (1 min)',
      'Arm circles (30s)',
      'Bodyweight squats (15)',
      'Inchworms (5)',
      'High knees (30s)',
    ],
    cooldown: [
      'Walk around (1 min)',
      'Standing quad stretch (30s/side)',
      'Chest opener (30s)',
      'Child\'s pose (30s)',
      'Deep breathing (1 min)',
    ],
  };
}

// ============================================================================
// Fallback Strategies
// ============================================================================

function createTemplateFallback(params: WorkoutGenerationParams): FallbackStrategy<GeneratedWorkout> {
  return {
    name: 'template_based',
    description: 'Pre-built workout templates based on goal and level',
    async execute(): Promise<GeneratedWorkout> {
      // Determine difficulty based on energy level and experience
      let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

      if (params.energyLevel >= 4 && params.goal !== 'general_fitness') {
        difficulty = 'advanced';
      } else if (params.energyLevel >= 3) {
        difficulty = 'intermediate';
      }

      // Select template based on goal
      switch (params.goal) {
        case 'strength':
        case 'hypertrophy':
          if (difficulty === 'advanced') {
            return createAdvancedFullBodyWorkout(params);
          } else if (difficulty === 'intermediate') {
            return createIntermediateUpperLowerWorkout(params);
          }
          return createBeginnerFullBodyWorkout(params);

        case 'fat_loss':
        case 'endurance':
          return createFatLossCircuitWorkout(params);

        case 'general_fitness':
        default:
          if (difficulty === 'advanced') {
            return createAdvancedFullBodyWorkout(params);
          } else if (difficulty === 'intermediate') {
            return createIntermediateUpperLowerWorkout(params);
          }
          return createBeginnerFullBodyWorkout(params);
      }
    },
  };
}

function createCacheFallback(cache: WorkoutCache, params: WorkoutGenerationParams): FallbackStrategy<GeneratedWorkout> {
  return {
    name: 'cached_workout',
    description: 'Return previously generated workout for similar parameters',
    async execute(): Promise<GeneratedWorkout> {
      const cached = cache.get(params);
      if (!cached) {
        throw new AIError(AIErrorCode.INSUFFICIENT_DATA, 'No cached workout available');
      }
      return cached;
    },
  };
}

// ============================================================================
// Workout Service Class
// ============================================================================

export class WorkoutService {
  private client: GeminiClient;
  private cache: WorkoutCache;
  private config: Required<WorkoutServiceConfig>;

  constructor(config: WorkoutServiceConfig = {}) {
    this.client = config.geminiClient ?? getDefaultClient();
    this.config = {
      geminiClient: this.client,
      enableCache: config.enableCache ?? true,
      cacheTTLMs: config.cacheTTLMs ?? 1800000,
      defaultMaxDumbbellWeight: config.defaultMaxDumbbellWeight ?? 10,
    };
    this.cache = new WorkoutCache(this.config.cacheTTLMs);
  }

  /**
   * Generate a structured workout plan
   */
  async generateWorkout(params: WorkoutGenerationParams): Promise<GeneratedWorkout> {
    // Validate params
    this.validateParams(params);

    // Check cache first
    if (this.config.enableCache) {
      const cached = this.cache.get(params);
      if (cached) {
        return cached;
      }
    }

    // Build prompt
    const prompt = buildWorkoutPrompt(params);

    // Prepare fallback strategies
    const strategies: FallbackStrategy<GeneratedWorkout>[] = [
      {
        name: 'gemini_primary',
        description: 'AI-generated workout with structured JSON output',
        execute: async () => {
          const response = await this.client.generateStructured<GeneratedWorkout>({
            prompt,
            systemPrompt: WORKOUT_GENERATOR_PROMPT,
            generationConfig: {
              temperature: 0.4, // Slightly higher for variety
              maxOutputTokens: 6144,
            },
          });

          // Validate workout structure
          this.validateWorkout(response.data, params);

          return response.data;
        },
      },
    ];

    // Add cache fallback
    if (this.config.enableCache) {
      strategies.push(createCacheFallback(this.cache, params));
    }

    // Add template fallback
    strategies.push(createTemplateFallback(params));

    // Execute with fallback
    const result = await executeWithFallback(strategies, (strategy, error) => {
      console.warn(`Workout generation fallback: ${strategy} failed -`, error.message);
    });

    // Cache result
    if (this.config.enableCache) {
      this.cache.set(params, result);
    }

    return result;
  }

  /**
   * Generate multiple workout options
   */
  async generateWorkoutOptions(params: WorkoutGenerationParams, count: number = 3): Promise<GeneratedWorkout[]> {
    const workouts: GeneratedWorkout[] = [];

    // Generate first with AI
    workouts.push(await this.generateWorkout(params));

    // Generate variations using templates with different focuses
    const focuses: MuscleGroup[][] = [
      ['chest', 'back'],
      ['quadriceps', 'hamstrings', 'glutes'],
      ['shoulders', 'arms'],
      ['core', 'cardio'],
    ];

    for (let i = 1; i < count; i++) {
      const focus = focuses[i % focuses.length];
      const variantParams = { ...params, preferredFocus: focus };
      const templateFallback = createTemplateFallback(variantParams);
      const workout = await templateFallback.execute();
      workouts.push(workout);
    }

    return workouts;
  }

  /**
   * Validate generation parameters
   */
  private validateParams(params: WorkoutGenerationParams): void {
    if (params.energyLevel < 1 || params.energyLevel > 5) {
      throw new AIError(AIErrorCode.INVALID_REQUEST, 'energyLevel must be 1-5');
    }
    if (params.availableTime < 10 || params.availableTime > 180) {
      throw new AIError(AIErrorCode.INVALID_REQUEST, 'availableTime must be 10-180 minutes');
    }
    if (params.maxDumbbellWeight < 1 || params.maxDumbbellWeight > 50) {
      throw new AIError(AIErrorCode.INVALID_REQUEST, 'maxDumbbellWeight must be 1-50kg');
    }
    if (params.currentMetrics.weight < 30 || params.currentMetrics.weight > 300) {
      throw new AIError(AIErrorCode.INVALID_REQUEST, 'Invalid weight');
    }
    if (params.currentMetrics.height < 100 || params.currentMetrics.height > 250) {
      throw new AIError(AIErrorCode.INVALID_REQUEST, 'Invalid height');
    }
    if (params.currentMetrics.age < 13 || params.currentMetrics.age > 100) {
      throw new AIError(AIErrorCode.INVALID_REQUEST, 'Invalid age');
    }
  }

  /**
   * Validate generated workout structure
   */
  private validateWorkout(workout: GeneratedWorkout, params: WorkoutGenerationParams): void {
    if (!workout.exercises || workout.exercises.length === 0) {
      throw new AIError(AIErrorCode.INVALID_RESPONSE_FORMAT, 'No exercises in generated workout');
    }

    if (!workout.totalDuration || workout.totalDuration < 5) {
      throw new AIError(AIErrorCode.INVALID_RESPONSE_FORMAT, 'Invalid workout duration');
    }

    // Validate weight constraints
    for (const exercise of workout.exercises) {
      if (exercise.weightKg !== undefined && exercise.weightKg > params.maxDumbbellWeight) {
        exercise.weightKg = params.maxDumbbellWeight;
      }
      if (exercise.weightKg !== undefined && exercise.weightKg < 1) {
        delete exercise.weightKg;
      }
    }

    // Ensure muscle groups are valid
    const validMuscleGroups: MuscleGroup[] = [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'abs', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'cardio', 'full_body'
    ];

    for (const exercise of workout.exercises) {
      exercise.muscleGroups = exercise.muscleGroups.filter(mg =>
        validMuscleGroups.includes(mg)
      );
      if (exercise.muscleGroups.length === 0) {
        exercise.muscleGroups = ['full_body'];
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number } {
    return { size: this.cache.size() };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WorkoutServiceConfig>): void {
    Object.assign(this.config, config);
    if (config.cacheTTLMs) {
      this.cache = new WorkoutCache(config.cacheTTLMs);
    }
  }

  /**
   * Get token usage from underlying client
   */
  getTokenUsage() {
    return this.client.getTokenUsage();
  }
}

/**
 * Default singleton instance
 */
let defaultWorkoutService: WorkoutService | null = null;

export function getWorkoutService(config?: WorkoutServiceConfig): WorkoutService {
  if (!defaultWorkoutService) {
    defaultWorkoutService = new WorkoutService(config);
  }
  return defaultWorkoutService;
}

export function setWorkoutService(service: WorkoutService): void {
  defaultWorkoutService = service;
}

/**
 * Convenience function for simple generation
 */
export async function generateWorkout(params: WorkoutGenerationParams): Promise<GeneratedWorkout> {
  const service = getWorkoutService();
  return service.generateWorkout(params);
}