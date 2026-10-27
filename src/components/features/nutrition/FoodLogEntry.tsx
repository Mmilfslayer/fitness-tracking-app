/**
 * FoodLogEntry - Natural language input with iOS-style text field + voice input button
 * Supports parsing natural language food entries (e.g., "chicken breast 200g")
 */

import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';
import { spacing, fontSize, fontWeight, colors, borderRadius, shadow, componentTokens } from '../../../design/tokens';

export interface ParsedFoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodLogEntryProps {
  /** Callback when food is parsed and ready to log */
  onLogFood: (food: ParsedFoodItem) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Initial value */
  defaultValue?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Show voice input button */
  showVoiceInput?: boolean;
  /** Voice input callback */
  onVoiceInput?: () => void;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

const FoodLogEntry = forwardRef<HTMLDivElement, FoodLogEntryProps>(
  (
    {
      onLogFood,
      placeholder = 'Describe what you ate (e.g., "grilled chicken breast 200g with rice")',
      defaultValue = '',
      disabled = false,
      showVoiceInput = true,
      onVoiceInput,
      className = '',
      style,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [isProcessing] = useState(false);
    const [suggestions, setSuggestions] = useState<ParsedFoodItem[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const parseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    // Egyptian food database for quick parsing
    const egyptianFoods: Record<string, Partial<ParsedFoodItem>> = {
      'فول': { name: 'Foul Medames', calories: 182, protein: 13, carbs: 24, fat: 5, unit: 'cup' },
      'فول مدمس': { name: 'Foul Medames', calories: 182, protein: 13, carbs: 24, fat: 5, unit: 'cup' },
      'طعمية': { name: 'Taameya (Falafel)', calories: 75, protein: 3, carbs: 8, fat: 4, unit: 'piece' },
      'فلافل': { name: 'Falafel', calories: 57, protein: 2, carbs: 5, fat: 3, unit: 'piece' },
      'كشري': { name: 'Koshari', calories: 350, protein: 12, carbs: 55, fat: 10, unit: 'plate' },
      'كشرى': { name: 'Koshari', calories: 350, protein: 12, carbs: 55, fat: 10, unit: 'plate' },
      'محشي': { name: 'Mahshi', calories: 120, protein: 4, carbs: 15, fat: 6, unit: 'piece' },
      'مكرونة': { name: 'Pasta', calories: 200, protein: 7, carbs: 40, fat: 2, unit: 'cup' },
      'ارز': { name: 'White Rice', calories: 205, protein: 4, carbs: 45, fat: 0.5, unit: 'cup' },
      'رز': { name: 'White Rice', calories: 205, protein: 4, carbs: 45, fat: 0.5, unit: 'cup' },
      'دجاج': { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: '100g' },
      'فراخ': { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: '100g' },
      'لحمة': { name: 'Beef', calories: 250, protein: 26, carbs: 0, fat: 17, unit: '100g' },
      'سمك': { name: 'Fish', calories: 206, protein: 22, carbs: 0, fat: 12, unit: '100g' },
      'بيض': { name: 'Egg', calories: 78, protein: 6, carbs: 0.6, fat: 5, unit: 'piece' },
      'بيضه': { name: 'Egg', calories: 78, protein: 6, carbs: 0.6, fat: 5, unit: 'piece' },
      'جبنة': { name: 'Cheese', calories: 113, protein: 7, carbs: 1, fat: 9, unit: 'slice' },
      'جبنه': { name: 'Cheese', calories: 113, protein: 7, carbs: 1, fat: 9, unit: 'slice' },
      'زبادي': { name: 'Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: '100g' },
      'لبن': { name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fat: 1, unit: '100ml' },
      'خبز': { name: 'Egyptian Bread (Baladi)', calories: 170, protein: 6, carbs: 35, fat: 1.5, unit: 'piece' },
      'عيش': { name: 'Egyptian Bread (Baladi)', calories: 170, protein: 6, carbs: 35, fat: 1.5, unit: 'piece' },
      'بلدي': { name: 'Egyptian Bread (Baladi)', calories: 170, protein: 6, carbs: 35, fat: 1.5, unit: 'piece' },
      'سلطة': { name: 'Salad', calories: 25, protein: 1, carbs: 5, fat: 0.3, unit: 'cup' },
      'طماطم': { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, unit: 'piece' },
      'خيار': { name: 'Cucumber', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, unit: 'piece' },
      'موز': { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, unit: 'piece' },
      'تفاح': { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, unit: 'piece' },
      'برتقال': { name: 'Orange', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, unit: 'piece' },
    };

    // Parse natural language input
    const parseFoodInput = useCallback((input: string): ParsedFoodItem | null => {
      const lowerInput = input.toLowerCase().trim();
      if (!lowerInput) return null;

      // Try to match Egyptian foods first
      for (const [key, food] of Object.entries(egyptianFoods)) {
        if (lowerInput.includes(key)) {
          // Extract quantity
          const quantityMatch = lowerInput.match(/(\d+(?:\.\d+)?)\s*(g|gm|gr|kg|piece|pieces|cup|cups|plate|plates|slice|slices|ml)?/);
          let quantity = 1;
          let unit = food.unit || 'serving';

          if (quantityMatch) {
            quantity = parseFloat(quantityMatch[1]);
            unit = quantityMatch[2] || food.unit || 'serving';
          }

          return {
            name: food.name || key,
            quantity,
            unit,
            calories: Math.round((food.calories || 0) * quantity),
            protein: Math.round((food.protein || 0) * quantity * 10) / 10,
            carbs: Math.round((food.carbs || 0) * quantity * 10) / 10,
            fat: Math.round((food.fat || 0) * quantity * 10) / 10,
          };
        }
      }

      // Generic parsing for other foods
      const genericMatch = lowerInput.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(g|gm|gr|kg|oz|lb|piece|pieces|cup|cups|tbsp|tsp|ml|l)?$/);
      if (genericMatch) {
        const name = genericMatch[1].trim();
        const quantity = parseFloat(genericMatch[2]);
        const unit = genericMatch[3] || 'g';

        // Estimate macros (very rough estimates)
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          quantity,
          unit,
          calories: Math.round(quantity * 1.5), // rough estimate
          protein: Math.round(quantity * 0.1 * 10) / 10,
          carbs: Math.round(quantity * 0.2 * 10) / 10,
          fat: Math.round(quantity * 0.05 * 10) / 10,
        };
      }

      return null;
    }, []);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      // Debounce parsing
      if (parseTimeoutRef.current) {
        clearTimeout(parseTimeoutRef.current);
      }
      parseTimeoutRef.current = window.setTimeout(() => {
        const parsed = parseFoodInput(value);
        if (parsed) {
          setSuggestions([parsed]);
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      }, 300);
    }, [parseFoodInput]);

    // Handle form submission
    const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();
      const parsed = parseFoodInput(inputValue);
      if (parsed) {
        onLogFood(parsed);
        setInputValue('');
        setShowSuggestions(false);
      }
    }, [inputValue, onLogFood, parseFoodInput]);

    // Handle voice input
    const handleVoiceInput = useCallback(() => {
      if (onVoiceInput) {
        onVoiceInput();
      } else {
        // Fallback: use Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.lang = 'ar-EG';
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
            const parsed = parseFoodInput(transcript);
            if (parsed) {
              onLogFood(parsed);
              setInputValue('');
            }
          };

          recognition.onerror = () => {
            // Silently fail
          };

          recognition.start();
        }
      }
    }, [onVoiceInput, parseFoodInput, onLogFood]);

    // Click outside to close suggestions
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input on mount
    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    return (
      <div
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[2],
          ...style,
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={placeholder}
              disabled={disabled || isProcessing}
              style={{
                width: '100%',
                height: componentTokens.input.height,
                padding: componentTokens.input.padding,
                borderRadius: borderRadius.md,
                borderWidth: componentTokens.input.borderWidth,
                borderColor: 'var(--separator-opaque, #C6C6C8)',
                borderStyle: 'solid',
                fontSize: componentTokens.input.fontSize,
                fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                color: 'var(--label-primary, #000000)',
                backgroundColor: 'var(--system-background, #FFFFFF)',
                outline: 'none',
                transition: 'border-color 150ms cubic-bezier(0.42, 0, 0.58, 1), box-shadow 150ms cubic-bezier(0.42, 0, 0.58, 1)',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
              aria-label="Food entry"
              aria-autocomplete="list"
              aria-controls="food-suggestions"
              aria-expanded={showSuggestions && suggestions.length > 0}
            />

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  ref={suggestionsRef}
                  id="food-suggestions"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: spacing[1],
                    backgroundColor: 'var(--system-background, #FFFFFF)',
                    borderRadius: borderRadius.md,
                    boxShadow: shadow.level4,
                    border: `1px solid var(--separator-opaque, ${colors.separator.opaque})`,
                    overflow: 'hidden',
                    zIndex: 100,
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                  role="listbox"
                >
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        onLogFood(suggestion);
                        setInputValue('');
                        setShowSuggestions(false);
                      }}
                      role="option"
                      aria-selected={index === 0}
                      style={{
                        width: '100%',
                        padding: `${spacing[3]}px ${spacing[4]}px`,
                        textAlign: 'left',
                        border: 'none',
                        backgroundColor: 'transparent',
                        fontSize: fontSize.body.size,
                        fontWeight: fontWeight.regular,
                        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                        color: 'var(--label-primary, #000000)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: spacing[3],
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--secondary-system-background, #F2F2F7)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1], flex: 1 }}>
                        <span style={{ fontWeight: fontWeight.medium }}>{suggestion.name}</span>
                        <span style={{ fontSize: fontSize.caption1.size, color: 'var(--label-secondary, #3C3C43)' }}>
                          {suggestion.quantity} {suggestion.unit} • {suggestion.calories} kcal • P:{suggestion.protein}g C:{suggestion.carbs}g F:{suggestion.fat}g
                        </span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--system-green, #34C759)', flexShrink: 0 }}>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {showVoiceInput && (
            <Button
              variant="tertiary"
              size="md"
              onClick={handleVoiceInput}
              disabled={disabled || isProcessing}
              aria-label="Voice input"
              style={{ flexShrink: 0 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: isProcessing ? 'pulse 1.5s ease-in-out infinite' : 'none' }}>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
              <style>{`
                @keyframes pulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.1); }
                }
              `}</style>
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={disabled || isProcessing || !inputValue.trim()}
            loading={isProcessing}
          >
            Log Food
          </Button>
        </form>

        {/* Quick tips */}
        <div style={{ fontSize: fontSize.caption2.size, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
          Try: "chicken breast 200g", "كشري", "2 eggs", "rice 1 cup"
        </div>
      </div>
    );
  }
);

FoodLogEntry.displayName = 'FoodLogEntry';

export default FoodLogEntry;