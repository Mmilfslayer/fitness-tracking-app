import { useState, useEffect, useMemo } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useNutritionLogs, useSyncQueue } from '@/services/database/useDatabase';
import { kvSyncService } from '@/services/kv/syncService';
import NutritionDashboard from '@/components/features/nutrition/NutritionDashboard';
import QuickAddBar from '@/components/features/nutrition/QuickAddBar';
import { useToastHelpers } from '@/hooks/useToast';
import type { NutritionEntry, Meal, FoodItem } from '@/types';
import type { NutritionLog } from '@/services/database/types';
import type { ParsedFoodItem } from '@/components/features/nutrition/FoodLogEntry';

export function Nutrition() {
  const { addNutrition, getNutritionForDay, isReady } = useNutritionLogs();
  const { queueSync } = useSyncQueue();
  const { isOnline } = useOnlineStatus();
  const { success, warning } = useToastHelpers();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [nutritionEntry, setNutritionEntry] = useState<NutritionEntry | null>(null);

  // Load nutrition data when date changes
  useEffect(() => {
    const loadNutrition = async () => {
      try {
        const logs = await getNutritionForDay(selectedDate);
        setNutritionEntry(transformLogsToEntry(logs, selectedDate));
      } catch (error) {
        console.error('Failed to load nutrition:', error);
        setNutritionEntry(null);
      }
    };
    loadNutrition();
  }, [selectedDate, getNutritionForDay]);

  // Transform NutritionLog[] to NutritionEntry format
  const transformLogsToEntry = (logs: NutritionLog[], date: string): NutritionEntry => {
    const mealsMap = new Map<string, Meal>();

    logs.forEach((log, index) => {
      const mealId = `${log.mealType}-${log.id}-${index}`;
      const foodItem: FoodItem = {
        id: `food-${log.id}-${index}`,
        mealId,
        name: log.naturalLanguageInput,
        quantity: 1,
        unit: 'serving',
        calories: log.parsedMacros.calories,
        protein: log.parsedMacros.protein,
        carbs: log.parsedMacros.carbs,
        fat: log.parsedMacros.fat,
      };

      const existingMeal = mealsMap.get(log.mealType);
      if (existingMeal) {
        existingMeal.foods.push(foodItem);
        existingMeal.calories += foodItem.calories;
        existingMeal.protein += foodItem.protein;
        existingMeal.carbs += foodItem.carbs;
        existingMeal.fat += foodItem.fat;
      } else {
        mealsMap.set(log.mealType, {
          id: mealId,
          nutritionEntryId: `entry-${date}`,
          name: log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1),
          time: new Date(log.timestamp),
          foods: [foodItem],
          calories: foodItem.calories,
          protein: foodItem.protein,
          carbs: foodItem.carbs,
          fat: foodItem.fat,
        });
      }
    });

    const meals = Array.from(mealsMap.values());
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

    return {
      id: `entry-${date}`,
      userId: 'local-user',
      date: new Date(date),
      meals,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    };
  };

  const handleLogMeal = async (food: ParsedFoodItem) => {
    try {
      const log: Omit<NutritionLog, 'id'> = {
        date: selectedDate,
        mealType: 'snack', // Default, could be enhanced with meal type selection
        naturalLanguageInput: food.name,
        parsedMacros: {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        },
        timestamp: new Date().toISOString(),
      };

      await addNutrition(log);
      await queueSync({
        type: 'nutrition',
        payload: {
          userId: kvSyncService.getUserId(),
          protein: food.protein,
          proteinTarget: 150,
          calories: food.calories,
          workoutStatus: 'not_started',
          timestamp: new Date().toISOString(),
        },
      });

      // Reload nutrition data
      const logs = await getNutritionForDay(selectedDate);
      setNutritionEntry(transformLogsToEntry(logs, selectedDate));

      if (!isOnline) {
        warning('Logged Offline', 'Meal saved locally. Will sync when online.');
      } else {
        success('Meal Logged', 'Added successfully');
      }
    } catch (error) {
      console.error('Failed to log meal:', error);
    }
  };

  // Memoize goals from settings or use defaults
  const goals = useMemo(() => ({
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 250,
    fatGoal: 70,
  }), []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-system-grouped-background">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-system-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-system-grouped-background">
      <div className="safe-area-top" />

      <header className="sticky top-16 z-10 bg-system-grouped-background/95 backdrop-blur border-b border-system-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-system-foreground">Nutrition</h1>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-system-background border border-system-border rounded-lg text-sm text-system-foreground focus:outline-none focus:ring-2 focus:ring-system-blue"
            />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-24">
        <NutritionDashboard
          nutrition={nutritionEntry}
          calorieGoal={goals.calorieGoal}
          proteinGoal={goals.proteinGoal}
          carbsGoal={goals.carbsGoal}
          fatGoal={goals.fatGoal}
          onLogFood={handleLogMeal}
        />
        <QuickAddBar onAddFood={handleLogMeal} />
      </div>

      {!isOnline && (
        <div className="fixed bottom-20 left-4 right-4 z-30">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                Offline mode – meals saved locally. Sync happens automatically when online.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}