/**
 * Gemini AI Client
 * Wrapper around @google/generative-ai with structured responses, retry logic, and token tracking
 */

import {
  GoogleGenerativeAI,
  GenerativeModel,
  GenerationConfig,
  GenerateContentResult,
} from '@google/generative-ai';

import {
  AIError,
  AIErrorCode,
  DEFAULT_RETRY_CONFIG,
  RetryConfig,
  CircuitBreaker,
  CircuitBreakerConfig,
  TokenUsage,
  TokenUsageTracker,
  createTokenUsageTracker,
  estimateCost,
} from './errorTypes';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  retryConfig?: Partial<RetryConfig>;
  circuitBreakerConfig?: Partial<CircuitBreakerConfig>;
  defaultGenerationConfig?: Partial<GenerationConfig>;
}

export interface StructuredResponse<T> {
  data: T;
  tokenUsage: TokenUsage;
  confidence?: number;
  modelVersion: string;
  responseTimeMs: number;
}

export interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  responseSchema?: object; // JSON Schema for response validation
  generationConfig?: Partial<GenerationConfig>;
  retryConfig?: Partial<RetryConfig>;
  onTokenUsage?: (usage: TokenUsage) => void;
}

const DEFAULT_MODEL = 'gemini-1.5-flash';
const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  temperature: 0.3,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config: Required<GeminiConfig>;
  private circuitBreaker: CircuitBreaker;
  private tokenTracker: TokenUsageTracker;
  private modelVersion: string;

  constructor(config: GeminiConfig) {
    if (!config.apiKey) {
      throw new AIError(
        AIErrorCode.CONFIGURATION_ERROR,
        'API key is required for GeminiClient',
        { fallbackAvailable: false }
      );
    }

    this.config = {
      apiKey: config.apiKey,
      model: config.model ?? DEFAULT_MODEL,
      retryConfig: { ...DEFAULT_RETRY_CONFIG, ...config.retryConfig },
      circuitBreakerConfig: config.circuitBreakerConfig ?? {},
      defaultGenerationConfig: { ...DEFAULT_GENERATION_CONFIG, ...config.defaultGenerationConfig },
    };

    this.client = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.client.getGenerativeModel({
      model: this.config.model,
      generationConfig: this.config.defaultGenerationConfig,
    });
    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreakerConfig);
    this.tokenTracker = createTokenUsageTracker();
    this.modelVersion = this.config.model;
  }

  /**
   * Generate structured JSON response with schema validation
   */
  async generateStructured<T>(
    options: GenerateOptions
  ): Promise<StructuredResponse<T>> {
    const startTime = Date.now();

    return this.circuitBreaker.execute(async () => {
      return this.executeWithRetry(async () => {
        const fullPrompt = options.systemPrompt
          ? `${options.systemPrompt}\n\n${options.prompt}`
          : options.prompt;

        const generationConfig: GenerationConfig = {
          ...this.config.defaultGenerationConfig,
          ...options.generationConfig,
        };

        // Add response schema if provided
        if (options.responseSchema) {
          generationConfig.responseSchema = options.responseSchema;
        }

        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig,
        });

        return this.processResponse<T>(result, startTime, options.onTokenUsage);
      });
    });
  }

  /**
   * Generate text response (non-structured)
   */
  async generateText(
    prompt: string,
    systemPrompt?: string,
    generationConfig?: Partial<GenerationConfig>
  ): Promise<StructuredResponse<string>> {
    const startTime = Date.now();

    return this.circuitBreaker.execute(async () => {
      return this.executeWithRetry(async () => {
        const fullPrompt = systemPrompt
          ? `${systemPrompt}\n\n${prompt}`
          : prompt;

        const config: GenerationConfig = {
          ...this.config.defaultGenerationConfig,
          ...generationConfig,
          responseMimeType: 'text/plain',
        };

        // Add timeout to prevent hanging on network issues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
          const result = await this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: config,
          });

          return this.processTextResponse(result, startTime);
        } finally {
          clearTimeout(timeoutId);
        }
      });
    });
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const baseConfig = this.config.retryConfig as Required<RetryConfig>;
    const config: RetryConfig = {
      maxAttempts: retryConfig?.maxAttempts ?? baseConfig.maxAttempts,
      baseDelayMs: retryConfig?.baseDelayMs ?? baseConfig.baseDelayMs,
      maxDelayMs: retryConfig?.maxDelayMs ?? baseConfig.maxDelayMs,
      backoffMultiplier: retryConfig?.backoffMultiplier ?? baseConfig.backoffMultiplier,
      retryableCodes: retryConfig?.retryableCodes ?? baseConfig.retryableCodes,
    };
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on last attempt
        if (attempt === config.maxAttempts) {
          break;
        }

        // Check if error is retryable
        if (error instanceof AIError && !config.retryableCodes.includes(error.code)) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelayMs
        );

        // Add jitter
        const jitter = delay * 0.1 * Math.random();
        await this.sleep(delay + jitter);
      }
    }

    // Always wrap final error as AIError
    if (lastError instanceof AIError) {
      throw lastError;
    }

    // Convert common Google SDK errors to AIError
    const errorMessage = lastError?.message ?? 'Unknown error';
    let code = AIErrorCode.UNKNOWN_ERROR;

    if (errorMessage.includes('API key') || errorMessage.includes('authentication') || errorMessage.includes('401') || errorMessage.includes('403')) {
      code = AIErrorCode.API_KEY_INVALID;
    } else if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      code = AIErrorCode.RATE_LIMIT_EXCEEDED;
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection') || errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      code = AIErrorCode.NETWORK_ERROR;
    } else if (errorMessage.includes('model') || errorMessage.includes('unavailable') || errorMessage.includes('503')) {
      code = AIErrorCode.MODEL_UNAVAILABLE;
    }

    throw new AIError(
      code,
      errorMessage,
      {
        fallbackAvailable: true,
        originalError: lastError,
        statusCode: lastError instanceof Response ? lastError.status : undefined,
      }
    );
  }

  /**
   * Process structured JSON response
   */
  private processResponse<T>(
    result: GenerateContentResult,
    startTime: number,
    onTokenUsage?: (usage: TokenUsage) => void
  ): StructuredResponse<T> {
    const response = result.response;
    const text = response.text();

    if (!text || text.trim() === '') {
      throw new AIError(
        AIErrorCode.EMPTY_RESPONSE,
        'Received empty response from Gemini',
        { fallbackAvailable: true }
      );
    }

    // Extract token usage
    const usage = this.extractTokenUsage(response);
    this.tokenTracker.recordUsage(usage);
    onTokenUsage?.(usage);

    // Parse JSON
    let data: T;
    try {
      data = JSON.parse(text) as T;
    } catch (parseError) {
      throw new AIError(
        AIErrorCode.RESPONSE_PARSING_FAILED,
        `Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
        {
          fallbackAvailable: true,
          originalError: parseError instanceof Error ? parseError : undefined,
          context: { rawResponse: text.substring(0, 500) },
        }
      );
    }

    return {
      data,
      tokenUsage: usage,
      modelVersion: this.modelVersion,
      responseTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Process text response
   */
  private processTextResponse(
    result: GenerateContentResult,
    startTime: number
  ): StructuredResponse<string> {
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new AIError(
        AIErrorCode.EMPTY_RESPONSE,
        'Received empty response from Gemini',
        { fallbackAvailable: true }
      );
    }

    const usage = this.extractTokenUsage(response);
    this.tokenTracker.recordUsage(usage);

    return {
      data: text,
      tokenUsage: usage,
      modelVersion: this.modelVersion,
      responseTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Extract token usage from response
   */
  private extractTokenUsage(response: GenerateContentResult['response']): TokenUsage {
    // Note: Gemini API returns usage metadata in response.usageMetadata
    // This is a simplified extraction - actual structure may vary
    const usageMeta = (response as { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } }).usageMetadata;

    const promptTokens = usageMeta?.promptTokenCount ?? 0;
    const completionTokens = usageMeta?.candidatesTokenCount ?? 0;
    const totalTokens = usageMeta?.totalTokenCount ?? (promptTokens + completionTokens);

    const usage: TokenUsage = {
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd: estimateCost({ promptTokens, completionTokens, totalTokens }),
    };

    return usage;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get token usage statistics
   */
  getTokenUsage(): { session: TokenUsage; total: TokenUsage } {
    return {
      session: this.tokenTracker.getSessionUsage(),
      total: this.tokenTracker.getTotalUsage(),
    };
  }

  /**
   * Reset session token counter
   */
  resetSessionTokens(): void {
    this.tokenTracker.resetSession();
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState() {
    return this.circuitBreaker.getState();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  /**
   * Update model (e.g., switch to pro for complex tasks)
   */
  setModel(model: string): void {
    this.model = this.client.getGenerativeModel({
      model,
      generationConfig: this.config.defaultGenerationConfig,
    });
    this.modelVersion = model;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.generateText('Reply with "OK"', undefined, { maxOutputTokens: 10 });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create GeminiClient from environment
 */
export function createGeminiClient(apiKey?: string): GeminiClient {
  const key = apiKey ?? import.meta.env.VITE_GEMINI_API_KEY ?? import.meta.env.GEMINI_API_KEY;

  if (!key) {
    throw new AIError(
      AIErrorCode.API_KEY_INVALID,
      'Gemini API key not found. Set VITE_GEMINI_API_KEY or GEMINI_API_KEY environment variable.',
      { fallbackAvailable: false }
    );
  }

  return new GeminiClient({ apiKey: key });
}

/**
 * Default singleton instance (lazy initialization)
 */
let defaultClient: GeminiClient | null = null;

export function getDefaultClient(): GeminiClient {
  if (!defaultClient) {
    defaultClient = createGeminiClient();
  }
  return defaultClient;
}

export function setDefaultClient(client: GeminiClient): void {
  defaultClient = client;
}