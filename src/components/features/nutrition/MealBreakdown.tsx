/**
 * MealBreakdown - Expandable list of logged meals with macros
 */

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card, { CardContent } from '../../ui/Card';
import Button from '../../ui/Button';
import { spacing, fontSize, fontWeight, colors, borderRadius } from '../../../design/tokens';
import { Meal, FoodItem } from '../../../types';

export interface MealBreakdownProps {
  /** Meals to display */
  meals: Meal[];
  /** Callback to delete a meal */
  onDeleteMeal?: (mealId: string) => void;
  /** Callback to delete a food item */
  onDeleteFood?: (mealId: string, foodId: string) => void;
  /** Callback to edit a food item */
  onEditFood?: (mealId: string, food: FoodItem) => void;
  /** Show meal totals */
  showTotals?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

const mealIcons: Record<string, React.ReactNode> = {
  breakfast: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 18a5 5 0 0 0-10 0" />
      <path d="M12 2v7" />
      <path d="M7 9h10" />
      <path d="M9 9v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9" />
    </svg>
  ),
  lunch: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  dinner: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v6" />
      <path d="M12 15v6" />
      <path d="M4 12h16" />
      <path d="M4 12a8 8 0 0 1 16 0" />
    </svg>
  ),
  snack: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
};

const mealColors: Record<string, string> = {
  breakfast: '#FF9F0A',  // Orange
  lunch: '#FF3B30',      // Red
  dinner: '#5856D6',     // Indigo
  snack: '#34C759',      // Green
};

const MealBreakdown = forwardRef<HTMLDivElement, MealBreakdownProps>(
  (
    {
      meals,
      onDeleteMeal,
      onDeleteFood,
      onEditFood,
      showTotals = true,
      className = '',
      style,
    },
    ref
  ) => {
    const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

    const toggleMeal = (mealId: string) => {
      setExpandedMeals(prev => {
        const next = new Set(prev);
        if (next.has(mealId)) {
          next.delete(mealId);
        } else {
          next.add(mealId);
        }
        return next;
      });
    };

    const formatTime = (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    if (meals.length === 0) {
      return (
        <div
          ref={ref}
          className={className}
          style={{
            ...style,
            padding: spacing[6],
            textAlign: 'center',
            color: 'var(--label-tertiary, #3C3C4399)',
            fontSize: fontSize.body.size,
            fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: spacing[3], color: 'var(--label-quaternary, #3C3C434D)' }}>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
            <path d="M12 6v6l4 2" />
          </svg>
          <p style={{ margin: 0 }}>No meals logged yet</p>
          <p style={{ margin: `${spacing[1]}px 0 0 0`, fontSize: fontSize.caption1.size }}>Tap "Log Food" to add your first meal</p>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[3],
          ...style,
        }}
      >
        {meals.map((meal) => {
          const isExpanded = expandedMeals.has(meal.id);
          const mealColor = mealColors[meal.name.toLowerCase()] || mealColors.snack;
          const mealIcon = mealIcons[meal.name.toLowerCase()] || mealIcons.snack;

          return (
            <Card
              key={meal.id}
              variant="default"
              padding="none"
              style={{
                borderRadius: borderRadius.continuousLg,
                overflow: 'hidden',
              }}
            >
              {/* Meal Header */}
              <motion.div
                onClick={() => toggleMeal(meal.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${spacing[4]}px ${spacing[4]}px`,
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  borderBottom: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
                }}
                whileTap={{ scale: 0.99 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: borderRadius.full,
                      backgroundColor: `${mealColor}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: mealColor,
                    }}
                  >
                    {mealIcon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                      <h3 style={{ margin: 0, fontSize: fontSize.headline.size, fontWeight: fontWeight.semibold, lineHeight: fontSize.headline.lineHeight, letterSpacing: fontSize.headline.letterSpacing, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                        {meal.name.charAt(0).toUpperCase() + meal.name.slice(1)}
                      </h3>
                      <span style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.medium, color: mealColor, backgroundColor: `${mealColor}15`, padding: `${spacing[1]}px ${spacing[2]}px`, borderRadius: borderRadius.full, fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                        {meal.calories} kcal
                      </span>
                    </div>
                    <div style={{ marginTop: spacing[1], fontSize: fontSize.caption1.size, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                      {formatTime(meal.time)} • {meal.foods.length} item{meal.foods.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  {showTotals && (
                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      <div style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.medium, color: 'var(--label-secondary, #3C3C43)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                        P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                      </div>
                    </div>
                  )}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{ color: 'var(--label-tertiary, #3C3C4399)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* Meal Content - Expandable */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <CardContent style={{ padding: spacing[4], gap: spacing[3] }}>
                      {/* Macro breakdown for meal */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[3] }}>
                        {[
                          { label: 'Protein', value: meal.protein, unit: 'g', color: '#34C759', key: 'protein' },
                          { label: 'Carbs', value: meal.carbs, unit: 'g', color: '#007AFF', key: 'carbs' },
                          { label: 'Fat', value: meal.fat, unit: 'g', color: '#FF9F0A', key: 'fat' },
                        ].map((macro) => (
                          <div key={macro.key} style={{ textAlign: 'center', padding: spacing[2], backgroundColor: `${macro.color}10`, borderRadius: borderRadius.md }}>
                            <div style={{ fontSize: fontSize.title3.size, fontWeight: fontWeight.semibold, color: macro.color, lineHeight: fontSize.title3.lineHeight, letterSpacing: fontSize.title3.letterSpacing, fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                              {macro.value}{macro.unit}
                            </div>
                            <div style={{ fontSize: fontSize.caption2.size, color: 'var(--label-secondary, #3C3C43)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                              {macro.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Food items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                        {meal.foods.map((food, index) => (
                          <motion.div
                            key={food.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: spacing[3],
                              backgroundColor: 'var(--secondary-system-background, #F2F2F7)',
                              borderRadius: borderRadius.md,
                              gap: spacing[3],
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
                                <span style={{ fontSize: fontSize.body.size, fontWeight: fontWeight.medium, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                                  {food.name}
                                </span>
                                <span style={{ fontSize: fontSize.caption1.size, color: 'var(--label-secondary, #3C3C43)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                                  {food.quantity} {food.unit}
                                </span>
                              </div>
                              <div style={{ marginTop: spacing[1], display: 'flex', gap: spacing[3], fontSize: fontSize.caption1.size, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                                <span style={{ color: '#34C759' }}>P: {food.protein}g</span>
                                <span style={{ color: '#007AFF' }}>C: {food.carbs}g</span>
                                <span style={{ color: '#FF9F0A' }}>F: {food.fat}g</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flexShrink: 0 }}>
                              <span style={{ fontSize: fontSize.callout.size, fontWeight: fontWeight.semibold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                                {food.calories} kcal
                              </span>
                              <Button
                                variant="tertiary"
                                size="sm"
                                onClick={() => onEditFood?.(meal.id, food)}
                                aria-label={`Edit ${food.name}`}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </Button>
                              <Button
                                variant="tertiary"
                                size="sm"
                                onClick={() => onDeleteFood?.(meal.id, food.id)}
                                aria-label={`Delete ${food.name}`}
                                style={{ color: 'var(--system-red, #FF3B30)' }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Delete meal button */}
                      {onDeleteMeal && (
                        <Button
                          variant="destructive"
                          size="sm"
                          fullWidth
                          onClick={() => onDeleteMeal(meal.id)}
                          style={{ marginTop: spacing[2] }}
                        >
                          Delete Meal
                        </Button>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    );
  }
);

MealBreakdown.displayName = 'MealBreakdown';

export default MealBreakdown;