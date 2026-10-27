/**
 * DailySummaryCard - Top-level summary card for nutrition dashboard
 */

import React, { forwardRef } from 'react';
import Card, { CardContent } from '../../ui/Card';
import ProgressBar from '../../ui/ProgressBar';
import Button from '../../ui/Button';
import { spacing, fontSize, fontWeight, colors, borderRadius } from '../../../design/tokens';
import { NutritionEntry } from '../../../types';

interface DailySummaryCardProps {
  /** Nutrition data for the day */
  nutrition: NutritionEntry | null;
  /** Daily calorie goal */
  calorieGoal: number;
  /** Daily protein goal (g) */
  proteinGoal: number;
  /** Daily carbs goal (g) */
  carbsGoal: number;
  /** Daily fat goal (g) */
  fatGoal: number;
  /** Callback to navigate to food log */
  onLogFood?: () => void;
  /** Callback to view full nutrition details */
  onViewDetails?: () => void;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

const DailySummaryCard = forwardRef<HTMLDivElement, DailySummaryCardProps>(
  (
    {
      nutrition,
      calorieGoal = 2000,
      proteinGoal = 150,
      carbsGoal = 250,
      fatGoal = 70,
      onLogFood,
      onViewDetails,
      className = '',
      style,
    },
    ref
  ) => {
    const caloriesConsumed = nutrition?.totalCalories || 0;
    const proteinConsumed = nutrition?.totalProtein || 0;
    const carbsConsumed = nutrition?.totalCarbs || 0;
    const fatConsumed = nutrition?.totalFat || 0;

    const caloriesRemaining = Math.max(0, calorieGoal - caloriesConsumed);
    const caloriesProgress = calorieGoal > 0 ? caloriesConsumed / calorieGoal : 0;

    const getProgressColor = (progress: number) => {
      if (progress > 1) return '#FF3B30'; // Red - over
      if (progress > 0.9) return '#FF9F0A'; // Orange - near limit
      return '#34C759'; // Green - good
    };

    return (
      <Card
        ref={ref}
        variant="elevated"
        padding="lg"
        className={className}
        style={{
          ...style,
          borderRadius: borderRadius.continuousLg,
        }}
      >
        <CardContent style={{ gap: spacing[4] }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: fontSize.title2.size, fontWeight: fontWeight.semibold, lineHeight: fontSize.title2.lineHeight, letterSpacing: fontSize.title2.letterSpacing, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                Today's Nutrition
              </h2>
              <p style={{ margin: `${spacing[1]}px 0 0 0`, fontSize: fontSize.caption1.size, color: 'var(--label-secondary, #3C3C43)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div style={{ display: 'flex', gap: spacing[2] }}>
              {onViewDetails && (
                <Button variant="tertiary" size="sm" onClick={onViewDetails}>
                  View Details
                </Button>
              )}
              {onLogFood && (
                <Button variant="primary" size="sm" onClick={onLogFood}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: spacing[1] }}>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Log Food
                </Button>
              )}
            </div>
          </div>

          {/* Calories Overview - Large */}
          <div style={{ padding: spacing[3], backgroundColor: 'var(--secondary-system-background, #F2F2F7)', borderRadius: borderRadius.continuousMd }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing[3] }}>
              <div>
                <div style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.medium, color: 'var(--label-secondary, #3C3C43)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                  Calories
                </div>
                <div style={{ marginTop: spacing[1], display: 'flex', alignItems: 'flex-end', gap: spacing[1] }}>
                  <span style={{ fontSize: '48px', fontWeight: fontWeight.bold, lineHeight: 1, color: getProgressColor(caloriesProgress), fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)' }}>
                    {caloriesConsumed}
                  </span>
                  <span style={{ fontSize: fontSize.title3.size, fontWeight: fontWeight.regular, color: 'var(--label-tertiary, #3C3C4399)', marginBottom: '4px', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                    / {calorieGoal} kcal
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.medium, color: caloriesRemaining > 0 ? '#34C759' : '#FF3B30', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                  {caloriesRemaining > 0 ? `${caloriesRemaining} kcal left` : `${Math.abs(caloriesRemaining)} kcal over`}
                </div>
                <div style={{ marginTop: spacing[1], fontSize: fontSize.caption2.size, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                  {Math.round(caloriesProgress * 100)}% of goal
                </div>
              </div>
            </div>

            {/* Calories Progress Bar */}
            <ProgressBar
              progress={caloriesProgress}
              height="thick"
              color={getProgressColor(caloriesProgress)}
              rounded
              animationDuration={800}
            />
          </div>

          {/* Macro Breakdown - 3 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[3] }}>
            {[
              {
                label: 'Protein',
                consumed: proteinConsumed,
                goal: proteinGoal,
                unit: 'g',
                color: '#34C759',
                key: 'protein',
              },
              {
                label: 'Carbs',
                consumed: carbsConsumed,
                goal: carbsGoal,
                unit: 'g',
                color: '#007AFF',
                key: 'carbs',
              },
              {
                label: 'Fat',
                consumed: fatConsumed,
                goal: fatGoal,
                unit: 'g',
                color: '#FF9F0A',
                key: 'fat',
              },
            ].map((macro) => {
              const progress = macro.goal > 0 ? macro.consumed / macro.goal : 0;
              const remaining = Math.max(0, macro.goal - macro.consumed);

              return (
                <div
                  key={macro.key}
                  style={{
                    padding: spacing[3],
                    backgroundColor: `${macro.color}10`,
                    borderRadius: borderRadius.continuousMd,
                    border: `1px solid ${macro.color}30`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                    <span style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.medium, color: macro.color, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                      {macro.label}
                    </span>
                    <span style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.semibold, color: macro.color, fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                      {Math.round(progress * 100)}%
                    </span>
                  </div>

                  <ProgressBar
                    progress={progress}
                    height="default"
                    color={macro.color}
                    rounded
                    animationDuration={600}
                  />

                  <div style={{ marginTop: spacing[2], display: 'flex', justifyContent: 'space-between', fontSize: fontSize.caption2.size, fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                    <span style={{ color: 'var(--label-secondary, #3C3C43)' }}>
                      {macro.consumed}{macro.unit}
                    </span>
                    <span style={{ color: 'var(--label-tertiary, #3C3C4399)' }}>
                      {remaining > 0 ? `${remaining}{macro.unit} left` : 'Goal met'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: spacing[4], paddingTop: spacing[2], borderTop: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})` }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: fontSize.title3.size, fontWeight: fontWeight.bold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)' }}>
                {nutrition?.meals.length || 0}
              </div>
              <div style={{ fontSize: fontSize.caption2.size, color: 'var(--label-tertiary, #3C3C4399)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                Meals
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '1px', backgroundColor: 'var(--separator-non-opaque, #3C3C434D)' }} />
              <div style={{ fontSize: fontSize.title3.size, fontWeight: fontWeight.bold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)' }}>
                {nutrition?.meals.reduce((sum, m) => sum + m.foods.length, 0) || 0}
              </div>
              <div style={{ fontSize: fontSize.caption2.size, color: 'var(--label-tertiary, #3C3C4399)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                Foods
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: fontSize.title3.size, fontWeight: fontWeight.bold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)' }}>
                {Math.round((proteinConsumed * 4 + carbsConsumed * 4 + fatConsumed * 9) / (calorieGoal > 0 ? calorieGoal : 1) * 100)}%
              </div>
              <div style={{ fontSize: fontSize.caption2.size, color: 'var(--label-tertiary, #3C3C4399)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                Accuracy
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

DailySummaryCard.displayName = 'DailySummaryCard';

export default DailySummaryCard;