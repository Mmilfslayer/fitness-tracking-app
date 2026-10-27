/**
 * NutritionDashboard - Main view with 4 progress rings (Calories, Protein, Carbs, Fat) in 2x2 grid
 */

import React, { forwardRef, useState, useCallback } from 'react';
import Card, { CardHeader, CardContent } from '../../ui/Card';
import MacroRing from './MacroRing';
import FoodLogEntry, { ParsedFoodItem } from './FoodLogEntry';
import MealBreakdown from './MealBreakdown';
import QuickAddBar from './QuickAddBar';
import DailySummaryCard from './DailySummaryCard';
import { spacing, fontSize, fontWeight, colors, borderRadius } from '../../../design/tokens';
import { NutritionEntry } from '../../../types';

interface NutritionDashboardProps {
  /** Nutrition data for the day */
  nutrition: NutritionEntry | null;
  /** Daily calorie goal */
  calorieGoal?: number;
  /** Daily protein goal (g) */
  proteinGoal?: number;
  /** Daily carbs goal (g) */
  carbsGoal?: number;
  /** Daily fat goal (g) */
  fatGoal?: number;
  /** Callback to log food */
  onLogFood?: (food: ParsedFoodItem) => void;
  /** Callback to delete meal */
  onDeleteMeal?: (mealId: string) => void;
  /** Callback to delete food item */
  onDeleteFood?: (mealId: string, foodId: string) => void;
  /** Callback to edit food item */
  onEditFood?: (mealId: string, food: any) => void;
  /** Callback to navigate to full nutrition view */
  onViewDetails?: () => void;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

const NutritionDashboard = forwardRef<HTMLDivElement, NutritionDashboardProps>(
  (
    {
      nutrition,
      calorieGoal = 2000,
      proteinGoal = 150,
      carbsGoal = 250,
      fatGoal = 70,
      onLogFood,
      onDeleteMeal,
      onDeleteFood,
      onEditFood,
      onViewDetails,
      className = '',
      style,
    },
    ref
  ) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'log' | 'meals'>('overview');

    const handleTabChange = useCallback((tab: 'overview' | 'log' | 'meals') => {
      setActiveTab(tab);
    }, []);
    const [showQuickAdd, setShowQuickAdd] = useState(false);

    const caloriesConsumed = nutrition?.totalCalories || 0;
    const proteinConsumed = nutrition?.totalProtein || 0;
    const carbsConsumed = nutrition?.totalCarbs || 0;
    const fatConsumed = nutrition?.totalFat || 0;

    const caloriesProgress = calorieGoal > 0 ? Math.min(1, caloriesConsumed / calorieGoal) : 0;
    const proteinProgress = proteinGoal > 0 ? Math.min(1, proteinConsumed / proteinGoal) : 0;
    const carbsProgress = carbsGoal > 0 ? Math.min(1, carbsConsumed / carbsGoal) : 0;
    const fatProgress = fatGoal > 0 ? Math.min(1, fatConsumed / fatGoal) : 0;

    const handleLogFood = useCallback((food: ParsedFoodItem) => {
      onLogFood?.(food);
      setActiveTab('meals');
      setShowQuickAdd(false);
    }, [onLogFood]);

    return (
      <div
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[4],
          ...style,
        }}
      >
        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: spacing[1],
            backgroundColor: 'var(--secondary-system-background, #F2F2F7)',
            padding: spacing[1],
            borderRadius: borderRadius.continuousLg,
            border: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
          }}
          role="tablist"
          aria-label="Nutrition sections"
        >
          {[
            { id: 'overview', label: 'Overview', icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            )},
            { id: 'log', label: 'Log Food', icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            )},
            { id: 'meals', label: 'Meals', icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            )},
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`nutrition-${tab.id}`}
              id={`nutrition-tab-${tab.id}`}
              onClick={() => handleTabChange(tab.id as 'overview' | 'log' | 'meals')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
                padding: `${spacing[2]}px ${spacing[3]}px`,
                borderRadius: borderRadius.continuousMd,
                border: 'none',
                backgroundColor: activeTab === tab.id
                  ? 'var(--system-background, #FFFFFF)'
                  : 'transparent',
                boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.05)' : 'none',
                color: activeTab === tab.id
                  ? 'var(--label-primary, #000000)'
                  : 'var(--label-secondary, #3C3C43)',
                fontSize: fontSize.callout.size,
                fontWeight: fontWeight.semibold,
                fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                cursor: 'pointer',
                transition: 'all 150ms cubic-bezier(0.42, 0, 0.58, 1)',
                minHeight: '44px',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div role="tabpanel" id="nutrition-overview" aria-labelledby="nutrition-tab-overview" hidden={activeTab !== 'overview'}>
          {activeTab === 'overview' && (
            <>
              {/* Daily Summary Card */}
              <DailySummaryCard
                nutrition={nutrition}
                calorieGoal={calorieGoal}
                proteinGoal={proteinGoal}
                carbsGoal={carbsGoal}
                fatGoal={fatGoal}
                onLogFood={() => setActiveTab('log')}
                onViewDetails={onViewDetails}
              />

              {/* Macro Rings Grid - 2x2 */}
              <Card variant="default" padding="lg">
                <CardHeader
                  title="Macro Progress"
                  subtitle="Tap a ring to log food for that macro"
                  action={
                    <button
                      onClick={() => handleTabChange('log')}
                      style={{
                        fontSize: fontSize.callout.size,
                        fontWeight: fontWeight.semibold,
                        color: 'var(--system-blue, #007AFF)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                      }}
                    >
                      Log Food
                    </button>
                  }
                />
                <CardContent style={{ gap: spacing[4] }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: spacing[4],
                    }}
                  >
                    <MacroRing
                      progress={caloriesProgress}
                      label="Calories"
                      value={caloriesConsumed}
                      target={calorieGoal}
                      unit="kcal"
                      color="calories"
                      size="lg"
                      onClick={() => handleTabChange('log')}
                      style={{ cursor: onLogFood ? 'pointer' : 'default' }}
                    />
                    <MacroRing
                      progress={proteinProgress}
                      label="Protein"
                      value={proteinConsumed}
                      target={proteinGoal}
                      unit="g"
                      color="protein"
                      size="lg"
                      onClick={() => handleTabChange('log')}
                      style={{ cursor: onLogFood ? 'pointer' : 'default' }}
                    />
                    <MacroRing
                      progress={carbsProgress}
                      label="Carbs"
                      value={carbsConsumed}
                      target={carbsGoal}
                      unit="g"
                      color="carbs"
                      size="lg"
                      onClick={() => handleTabChange('log')}
                      style={{ cursor: onLogFood ? 'pointer' : 'default' }}
                    />
                    <MacroRing
                      progress={fatProgress}
                      label="Fat"
                      value={fatConsumed}
                      target={fatGoal}
                      unit="g"
                      color="fat"
                      size="lg"
                      onClick={() => handleTabChange('log')}
                      style={{ cursor: onLogFood ? 'pointer' : 'default' }}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div role="tabpanel" id="nutrition-log" aria-labelledby="nutrition-tab-log" hidden={activeTab !== 'log'}>
          {activeTab === 'log' && (
            <Card variant="default" padding="lg">
              <CardHeader title="Log Food" subtitle="Enter what you ate or use quick add" />
              <CardContent style={{ gap: spacing[4] }}>
                <FoodLogEntry
                  onLogFood={handleLogFood}
                  placeholder="Describe what you ate (e.g., 'grilled chicken 200g with rice')"
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[2] }}>
                  <span style={{ fontSize: fontSize.subhead.size, fontWeight: fontWeight.semibold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                    Quick Add
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                    style={{
                      fontSize: fontSize.callout.size,
                      fontWeight: fontWeight.semibold,
                      color: 'var(--system-blue, #007AFF)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                    }}
                    aria-expanded={showQuickAdd}
                  >
                    {showQuickAdd ? 'Hide' : 'Show'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showQuickAdd ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {showQuickAdd && (
                  <QuickAddBar
                    onAddFood={handleLogFood}
                    category="all"
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div role="tabpanel" id="nutrition-meals" aria-labelledby="nutrition-tab-meals" hidden={activeTab !== 'meals'}>
          {activeTab === 'meals' && (
            <Card variant="default" padding="none">
              <CardHeader
                title="Today's Meals"
                subtitle={nutrition ? `${nutrition.meals.length} meals • ${nutrition.totalCalories} kcal` : 'No meals logged'}
              />
              <CardContent style={{ padding: 0, gap: 0 }}>
                <MealBreakdown
                  meals={nutrition?.meals || []}
                  onDeleteMeal={onDeleteMeal}
                  onDeleteFood={onDeleteFood}
                  onEditFood={onEditFood}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }
);

NutritionDashboard.displayName = 'NutritionDashboard';

export default NutritionDashboard;