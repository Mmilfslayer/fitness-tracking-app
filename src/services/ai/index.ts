/**
 * AI Services Index
 * Central export for all AI-related services
 */

// Gemini Client
export {
  GeminiClient,
  createGeminiClient,
  getDefaultClient,
  setDefaultClient,
} from './gemini';

export type {
  GeminiConfig,
  StructuredResponse,
  GenerateOptions,
} from './gemini';

// Error Types & Utilities - Values
export {
  AIError,
  AIErrorCode,
  DEFAULT_RETRY_CONFIG,
  CircuitBreaker,
  CircuitState,
  createTokenUsageTracker,
  estimateCost,
  executeWithFallback,
} from './errorTypes';

// Error Types & Utilities - Types
export type {
  RetryConfig,
  CircuitBreakerConfig,
  TokenUsage,
  TokenUsageTracker,
  FallbackStrategy,
} from './errorTypes';

// Prompts
export {
  NUTRITION_PARSER_PROMPT,
  WORKOUT_GENERATOR_PROMPT,
  PROGRESS_ANALYSIS_PROMPT,
  buildNutritionPrompt,
  buildWorkoutPrompt,
  buildProgressAnalysisPrompt,
} from './prompts';

// Nutrition Service
export {
  NutritionService,
  getNutritionService,
  setNutritionService,
  parseNutrition,
} from './nutritionService';

export type {
  ParsedNutrition,
  RecognizedFoodItem,
  NutritionParseOptions,
  NutritionServiceConfig,
} from './nutritionService';

// Workout Service
export {
  WorkoutService,
  getWorkoutService,
  setWorkoutService,
  generateWorkout,
} from './workoutService';

export type {
  WorkoutGenerationParams,
  GeneratedExercise,
  GeneratedWorkout,
  WorkoutServiceConfig,
} from './workoutService';