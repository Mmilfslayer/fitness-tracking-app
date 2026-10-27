/**
 * Nutrition Service
 * Parses natural language food descriptions into structured nutrition data
 * Specialized for Egyptian cuisine with fallback strategies
 */

import { GeminiClient, getDefaultClient } from './gemini';
import {
  NUTRITION_PARSER_PROMPT,
  buildNutritionPrompt,
} from './prompts';
import {
  AIError,
  AIErrorCode,
  executeWithFallback,
  FallbackStrategy,
} from './errorTypes';

// ============================================================================
// Types
// ============================================================================

export interface ParsedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  recognizedItems: RecognizedFoodItem[];
  notes: string;
}

export interface RecognizedFoodItem {
  name: string;
  quantity: number;
  unit: 'g';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  matchedTo: string;
}

export interface NutritionParseOptions {
  userInput: string;
  previousMeals?: string[];
  dietaryRestrictions?: string[];
  targetCalories?: number;
  useCache?: boolean;
  minConfidence?: number;
}

export interface NutritionServiceConfig {
  geminiClient?: GeminiClient;
  minConfidenceThreshold?: number;
  enableCache?: boolean;
  cacheTTLMs?: number;
}

// ============================================================================
// Cache Implementation
// ============================================================================

interface CacheEntry {
  data: ParsedNutrition;
  timestamp: number;
  inputHash: string;
}

class NutritionCache {
  private cache = new Map<string, CacheEntry>();
  private ttl: number;

  constructor(ttlMs: number = 3600000) { // 1 hour default
    this.ttl = ttlMs;
  }

  private hashInput(input: string): string {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  get(input: string): ParsedNutrition | null {
    const key = this.hashInput(input.toLowerCase().trim());
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(input: string, data: ParsedNutrition): void {
    const key = this.hashInput(input.toLowerCase().trim());
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      inputHash: key,
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
// Fallback Strategies
// ============================================================================

/**
 * Basic keyword-based nutrition estimation (no AI)
 */
function createBasicEstimationFallback(input: string): FallbackStrategy<ParsedNutrition> {
  return {
    name: 'basic_estimation',
    description: 'Keyword-based estimation using common food database',
    async execute(): Promise<ParsedNutrition> {
      const lowerInput = input.toLowerCase();
      const items: RecognizedFoodItem[] = [];
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      // Simple keyword matching with rough estimates
      const foodDatabase: Record<string, { cal: number; pro: number; carb: number; fat: number; weight: number }> = {
        // Egyptian foods
        'koshari': { cal: 130, pro: 5, carb: 22, fat: 3, weight: 350 },
        'koshary': { cal: 130, pro: 5, carb: 22, fat: 3, weight: 350 },
        'ful': { cal: 110, pro: 7, carb: 16, fat: 3, weight: 220 },
        'ful medames': { cal: 110, pro: 7, carb: 16, fat: 3, weight: 220 },
        'taameya': { cal: 330, pro: 13, carb: 30, fat: 18, weight: 35 },
        'falafel': { cal: 330, pro: 13, carb: 30, fat: 18, weight: 35 },
        'hawawshi': { cal: 280, pro: 15, carb: 25, fat: 14, weight: 180 },
        'mahshi': { cal: 90, pro: 4, carb: 12, fat: 4, weight: 100 },
        'molokhia': { cal: 40, pro: 3, carb: 4, fat: 2, weight: 250 },
        'fatta': { cal: 220, pro: 12, carb: 18, fat: 10, weight: 350 },
        'kebab': { cal: 250, pro: 20, carb: 0, fat: 18, weight: 120 },
        'kofta': { cal: 220, pro: 15, carb: 5, fat: 16, weight: 70 },
        'shawarma': { cal: 200, pro: 18, carb: 8, fat: 12, weight: 220 },
        // Staples
        'rice': { cal: 130, pro: 2.5, carb: 28, fat: 0.3, weight: 180 },
        'bread': { cal: 250, pro: 9, carb: 50, fat: 2, weight: 110 },
        'baladi': { cal: 250, pro: 9, carb: 50, fat: 2, weight: 110 },
        'shami': { cal: 270, pro: 8, carb: 52, fat: 3, weight: 90 },
        // Proteins
        'chicken': { cal: 165, pro: 31, carb: 0, fat: 3.5, weight: 150 },
        'beef': { cal: 250, pro: 26, carb: 0, fat: 15, weight: 150 },
        'egg': { cal: 155, pro: 13, carb: 1, fat: 11, weight: 50 },
        'fish': { cal: 130, pro: 25, carb: 0, fat: 3, weight: 150 },
        'tuna': { cal: 100, pro: 23, carb: 0, fat: 1, weight: 100 },
        // Oils
        'oil': { cal: 884, pro: 0, carb: 0, fat: 100, weight: 14 },
        'olive oil': { cal: 884, pro: 0, carb: 0, fat: 100, weight: 14 },
        'butter': { cal: 717, pro: 0.8, carb: 0, fat: 81, weight: 14 },
        'ghee': { cal: 900, pro: 0, carb: 0, fat: 100, weight: 14 },
        'samna': { cal: 900, pro: 0, carb: 0, fat: 100, weight: 14 },
      };

      for (const [keyword, nutrition] of Object.entries(foodDatabase)) {
        if (lowerInput.includes(keyword)) {
          const weight = nutrition.weight;
          const factor = weight / 100;

          items.push({
            name: keyword,
            quantity: weight,
            unit: 'g',
            calories: Math.round(nutrition.cal * factor),
            protein: Math.round(nutrition.pro * factor * 10) / 10,
            carbs: Math.round(nutrition.carb * factor * 10) / 10,
            fat: Math.round(nutrition.fat * factor * 10) / 10,
            matchedTo: keyword,
          });

          totalCalories += Math.round(nutrition.cal * factor);
          totalProtein += Math.round(nutrition.pro * factor * 10) / 10;
          totalCarbs += Math.round(nutrition.carb * factor * 10) / 10;
          totalFat += Math.round(nutrition.fat * factor * 10) / 10;
        }
      }

      // If nothing recognized, return minimal estimate
      if (items.length === 0) {
        return {
          calories: 200,
          protein: 10,
          carbs: 20,
          fat: 8,
          confidence: 0.15,
          recognizedItems: [],
          notes: 'No recognized foods - rough estimate provided',
        };
      }

      return {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        confidence: 0.55,
        recognizedItems: items,
        notes: 'Estimated from keyword matching (fallback mode)',
      };
    },
  };
}

/**
 * Cached result fallback
 */
function createCacheFallback(cache: NutritionCache, input: string): FallbackStrategy<ParsedNutrition> {
  return {
    name: 'cached_result',
    description: 'Return previously cached result for similar input',
    async execute(): Promise<ParsedNutrition> {
      const cached = cache.get(input);
      if (!cached) {
        throw new AIError(AIErrorCode.INSUFFICIENT_DATA, 'No cached result available');
      }
      return {
        ...cached,
        confidence: Math.min(cached.confidence * 0.9, 0.7), // Reduce confidence for cached
        notes: `${cached.notes} (from cache)`,
      };
    },
  };
}

// ============================================================================
// Nutrition Service Class
// ============================================================================

export class NutritionService {
  private client: GeminiClient;
  private cache: NutritionCache;
  private config: Required<NutritionServiceConfig>;

  constructor(config: NutritionServiceConfig = {}) {
    this.client = config.geminiClient ?? getDefaultClient();
    this.config = {
      geminiClient: this.client,
      minConfidenceThreshold: config.minConfidenceThreshold ?? 0.6,
      enableCache: config.enableCache ?? true,
      cacheTTLMs: config.cacheTTLMs ?? 3600000,
    };
    this.cache = new NutritionCache(this.config.cacheTTLMs);
  }

  /**
   * Parse natural language food description into nutrition data
   */
  async parseNutrition(options: NutritionParseOptions): Promise<ParsedNutrition> {
    const { userInput, previousMeals, dietaryRestrictions, targetCalories, useCache = true, minConfidence } = options;

    if (!userInput || userInput.trim().length === 0) {
      throw new AIError(
        AIErrorCode.INVALID_REQUEST,
        'Empty input provided for nutrition parsing',
        { fallbackAvailable: true }
      );
    }

    const threshold = minConfidence ?? this.config.minConfidenceThreshold;

    // Check cache first
    if (useCache && this.config.enableCache) {
      const cached = this.cache.get(userInput);
      if (cached) {
        return cached;
      }
    }

    // Build dynamic prompt
    const prompt = buildNutritionPrompt(userInput, {
      previousMeals,
      dietaryRestrictions,
      targetCalories,
    });

    // Prepare fallback strategies for this request
    const strategies: FallbackStrategy<ParsedNutrition>[] = [
      {
        name: 'gemini_primary',
        description: 'Primary Gemini AI parsing with structured output',
        execute: async () => {
          const response = await this.client.generateStructured<ParsedNutrition>({
            prompt,
            systemPrompt: NUTRITION_PARSER_PROMPT,
            generationConfig: {
              temperature: 0.2, // Lower temperature for more consistent parsing
              maxOutputTokens: 4096,
            },
          });

          // Validate confidence
          if (response.data.confidence < threshold) {
            throw new AIError(
              AIErrorCode.LOW_CONFIDENCE,
              `Confidence ${response.data.confidence} below threshold ${threshold}`,
              { fallbackAvailable: true, context: { confidence: response.data.confidence } }
            );
          }

          return response.data;
        },
      },
    ];

    // Add cache fallback if enabled
    if (useCache && this.config.enableCache) {
      strategies.push(createCacheFallback(this.cache, userInput));
    }

    // Add basic estimation fallback
    strategies.push(createBasicEstimationFallback(userInput));

    // Execute with fallback chain
    const result = await executeWithFallback(strategies, (strategy, error) => {
      console.warn(`Nutrition parsing fallback: ${strategy} failed -`, error.message);
    });

    // Cache successful result
    if (useCache && this.config.enableCache && result.confidence >= 0.5) {
      this.cache.set(userInput, result);
    }

    return result;
  }

  /**
   * Parse multiple food items at once
   */
  async parseMultipleNutrition(inputs: string[]): Promise<ParsedNutrition[]> {
    return Promise.all(inputs.map(input => this.parseNutrition({ userInput: input })));
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate?: number } {
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
  updateConfig(config: Partial<NutritionServiceConfig>): void {
    Object.assign(this.config, config);
    if (config.cacheTTLMs) {
      this.cache = new NutritionCache(config.cacheTTLMs);
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
let defaultNutritionService: NutritionService | null = null;

export function getNutritionService(config?: NutritionServiceConfig): NutritionService {
  if (!defaultNutritionService) {
    defaultNutritionService = new NutritionService(config);
  }
  return defaultNutritionService;
}

export function setNutritionService(service: NutritionService): void {
  defaultNutritionService = service;
}

/**
 * Convenience function for simple parsing
 */
export async function parseNutrition(input: string, options?: Partial<NutritionParseOptions>): Promise<ParsedNutrition> {
  const service = getNutritionService();
  return service.parseNutrition({ userInput: input, ...options });
}