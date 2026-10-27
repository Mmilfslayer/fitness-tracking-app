/**
 * AI Service Error Types and Fallback Strategies
 * Provides structured error handling with retry logic and graceful degradation
 */

export enum AIErrorCode {
  // Network/Connection errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  // API errors
  API_KEY_INVALID = 'API_KEY_INVALID',
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  MODEL_UNAVAILABLE = 'MODEL_UNAVAILABLE',
  INVALID_REQUEST = 'INVALID_REQUEST',

  // Response errors
  INVALID_RESPONSE_FORMAT = 'INVALID_RESPONSE_FORMAT',
  RESPONSE_PARSING_FAILED = 'RESPONSE_PARSING_FAILED',
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',
  EMPTY_RESPONSE = 'EMPTY_RESPONSE',

  // Business logic errors
  LOW_CONFIDENCE = 'LOW_CONFIDENCE',
  UNRECOGNIZED_FOOD = 'UNRECOGNIZED_FOOD',
  UNSUPPORTED_EXERCISE = 'UNSUPPORTED_EXERCISE',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',

  // Internal errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

export class AIError extends Error {
  public readonly code: AIErrorCode;
  public readonly statusCode?: number;
  public readonly retryable: boolean;
  public readonly fallbackAvailable: boolean;
  public readonly originalError?: Error;
  public readonly context?: Record<string, unknown>;

  constructor(
    code: AIErrorCode,
    message: string,
    options: {
      statusCode?: number;
      retryable?: boolean;
      fallbackAvailable?: boolean;
      originalError?: Error;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable ?? this.isRetryableByDefault(code);
    this.fallbackAvailable = options.fallbackAvailable ?? this.hasFallbackByDefault(code);
    this.originalError = options.originalError;
    this.context = options.context;

    // Note: Error.captureStackTrace is Node.js only, not available in browsers
    // Stack traces are automatically captured in modern browsers
  }

  private isRetryableByDefault(code: AIErrorCode): boolean {
    return [
      AIErrorCode.NETWORK_ERROR,
      AIErrorCode.TIMEOUT,
      AIErrorCode.CONNECTION_REFUSED,
      AIErrorCode.RATE_LIMIT_EXCEEDED,
      AIErrorCode.MODEL_UNAVAILABLE,
    ].includes(code);
  }

  private hasFallbackByDefault(code: AIErrorCode): boolean {
    return [
      AIErrorCode.RATE_LIMIT_EXCEEDED,
      AIErrorCode.QUOTA_EXCEEDED,
      AIErrorCode.MODEL_UNAVAILABLE,
      AIErrorCode.LOW_CONFIDENCE,
      AIErrorCode.UNRECOGNIZED_FOOD,
      AIErrorCode.UNSUPPORTED_EXERCISE,
    ].includes(code);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      retryable: this.retryable,
      fallbackAvailable: this.fallbackAvailable,
      context: this.context,
    };
  }
}

/**
 * Retry configuration for API calls
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableCodes: AIErrorCode[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableCodes: [
    AIErrorCode.NETWORK_ERROR,
    AIErrorCode.TIMEOUT,
    AIErrorCode.CONNECTION_REFUSED,
    AIErrorCode.RATE_LIMIT_EXCEEDED,
    AIErrorCode.MODEL_UNAVAILABLE,
  ],
};

/**
 * Fallback strategy types
 */
export type FallbackStrategy<T> = {
  name: string;
  execute: () => Promise<T>;
  description: string;
};

/**
 * Creates a fallback chain that tries strategies in order until one succeeds
 */
export async function executeWithFallback<T>(
  strategies: FallbackStrategy<T>[],
  onFallback?: (strategyName: string, error: Error) => void
): Promise<T> {
  let lastError: Error | undefined;

  for (const strategy of strategies) {
    try {
      return await strategy.execute();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (onFallback) {
        onFallback(strategy.name, lastError);
      }
      // Continue to next fallback
    }
  }

  throw lastError ?? new Error('All fallback strategies failed');
}

/**
 * Circuit breaker state for preventing cascade failures
 */
export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      successThreshold: config.successThreshold ?? 2,
      timeoutMs: config.timeoutMs ?? 30000,
    };
  }

  getState(): CircuitState {
    if (this.state === CircuitState.OPEN) {
      // Check if timeout has passed to transition to half-open
      if (Date.now() - this.lastFailureTime >= this.config.timeoutMs) {
        this.state = CircuitState.HALF_OPEN;
      }
    }
    return this.state;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const state = this.getState();

    if (state === CircuitState.OPEN) {
      throw new AIError(
        AIErrorCode.MODEL_UNAVAILABLE,
        'Circuit breaker is open - service unavailable',
        { fallbackAvailable: true }
      );
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.successes = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
    } else if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * Token usage tracking
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd?: number;
}

export interface TokenUsageTracker {
  sessionUsage: TokenUsage;
  totalUsage: TokenUsage;
  recordUsage(usage: TokenUsage): void;
  getSessionUsage(): TokenUsage;
  getTotalUsage(): TokenUsage;
  resetSession(): void;
}

export function createTokenUsageTracker(): TokenUsageTracker {
  const sessionUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  const totalUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  return {
    sessionUsage,
    totalUsage,
    recordUsage(usage: TokenUsage): void {
      sessionUsage.promptTokens += usage.promptTokens;
      sessionUsage.completionTokens += usage.completionTokens;
      sessionUsage.totalTokens += usage.totalTokens;

      totalUsage.promptTokens += usage.promptTokens;
      totalUsage.completionTokens += usage.completionTokens;
      totalUsage.totalTokens += usage.totalTokens;
    },
    getSessionUsage(): TokenUsage {
      return { ...sessionUsage };
    },
    getTotalUsage(): TokenUsage {
      return { ...totalUsage };
    },
    resetSession(): void {
      sessionUsage.promptTokens = 0;
      sessionUsage.completionTokens = 0;
      sessionUsage.totalTokens = 0;
    },
  };
}

/**
 * Estimates cost based on token usage (Gemini 1.5 Flash pricing as of 2024)
 * Input: $0.075 per 1M tokens, Output: $0.30 per 1M tokens
 */
export function estimateCost(usage: TokenUsage): number {
  const inputCostPerMillion = 0.075;
  const outputCostPerMillion = 0.30;

  const inputCost = (usage.promptTokens / 1_000_000) * inputCostPerMillion;
  const outputCost = (usage.completionTokens / 1_000_000) * outputCostPerMillion;

  return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimal places
}