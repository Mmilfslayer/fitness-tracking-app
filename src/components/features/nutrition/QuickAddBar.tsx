/**
 * QuickAddBar - Common Egyptian foods as chips for quick logging
 */

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';
import { spacing, fontSize, fontWeight, borderRadius } from '../../../design/tokens';
import type { ParsedFoodItem } from './FoodLogEntry';

interface QuickAddFood {
  id: string;
  name: string;
  nameAr?: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
  defaultQuantity: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
}

export interface QuickAddBarProps {
  /** Callback when food is selected */
  onAddFood: (food: ParsedFoodItem) => void;
  /** Selected category filter */
  category?: 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

// Egyptian foods database
const EGYPTIAN_FOODS: QuickAddFood[] = [
  // Breakfast
  { id: 'foul', name: 'Foul Medames', nameAr: 'فول مدمس', emoji: '🫘', calories: 182, protein: 13, carbs: 24, fat: 5, unit: 'cup', defaultQuantity: 1, category: 'breakfast' },
  { id: 'taameya', name: 'Taameya (Falafel)', nameAr: 'طعمية', emoji: '🥙', calories: 75, protein: 3, carbs: 8, fat: 4, unit: 'piece', defaultQuantity: 2, category: 'breakfast' },
  { id: 'eggs_boiled', name: 'Boiled Eggs', nameAr: 'بيض مسلوق', emoji: '🥚', calories: 78, protein: 6, carbs: 0.6, fat: 5, unit: 'piece', defaultQuantity: 2, category: 'breakfast' },
  { id: 'eggs_fried', name: 'Fried Eggs', nameAr: 'بيض مقلي', emoji: '🍳', calories: 90, protein: 6, carbs: 0.6, fat: 7, unit: 'piece', defaultQuantity: 2, category: 'breakfast' },
  { id: 'cheese', name: 'White Cheese', nameAr: 'جبنة بيضا', emoji: '🧀', calories: 113, protein: 7, carbs: 1, fat: 9, unit: 'slice', defaultQuantity: 2, category: 'breakfast' },
  { id: 'baladi_bread', name: 'Baladi Bread', nameAr: 'عيش بلدي', emoji: '🍞', calories: 170, protein: 6, carbs: 35, fat: 1.5, unit: 'piece', defaultQuantity: 1, category: 'breakfast' },
  { id: 'honey', name: 'Honey', nameAr: 'عسل', emoji: '🍯', calories: 64, protein: 0.1, carbs: 17, fat: 0, unit: 'tbsp', defaultQuantity: 1, category: 'breakfast' },
  { id: 'yogurt', name: 'Yogurt', nameAr: 'زبادي', emoji: '🥛', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: 'cup', defaultQuantity: 1, category: 'breakfast' },

  // Lunch/Dinner Mains
  { id: 'koshari', name: 'Koshari', nameAr: 'كشري', emoji: '🍚', calories: 350, protein: 12, carbs: 55, fat: 10, unit: 'plate', defaultQuantity: 1, category: 'lunch' },
  { id: 'mahshi', name: 'Mahshi (Stuffed Veg)', nameAr: 'محشي', emoji: '🍅', calories: 120, protein: 4, carbs: 15, fat: 6, unit: 'piece', defaultQuantity: 3, category: 'lunch' },
  { id: 'molokhia', name: 'Molokhia', nameAr: 'ملوخية', emoji: '🥬', calories: 80, protein: 4, carbs: 8, fat: 4, unit: 'cup', defaultQuantity: 1, category: 'lunch' },
  { id: 'rice', name: 'White Rice', nameAr: 'أرز أبيض', emoji: '🍚', calories: 205, protein: 4, carbs: 45, fat: 0.5, unit: 'cup', defaultQuantity: 1, category: 'lunch' },
  { id: 'pasta', name: 'Pasta with Tomato Sauce', nameAr: 'مكرونة', emoji: '🍝', calories: 200, protein: 7, carbs: 40, fat: 2, unit: 'cup', defaultQuantity: 1, category: 'lunch' },
  { id: 'chicken_grilled', name: 'Grilled Chicken Breast', nameAr: 'فراخ مشوية', emoji: '🍗', calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: '100g', defaultQuantity: 150, category: 'lunch' },
  { id: 'chicken_pan', name: 'Pan-Fried Chicken', nameAr: 'فراخ مقلية', emoji: '🍗', calories: 230, protein: 27, carbs: 0, fat: 14, unit: '100g', defaultQuantity: 150, category: 'lunch' },
  { id: 'beef_stew', name: 'Beef Stew', nameAr: 'لحمة ستيك', emoji: '🥩', calories: 250, protein: 26, carbs: 0, fat: 17, unit: '100g', defaultQuantity: 150, category: 'lunch' },
  { id: 'fish_grilled', name: 'Grilled Fish', nameAr: 'سمك مشوي', emoji: '🐟', calories: 206, protein: 22, carbs: 0, fat: 12, unit: '100g', defaultQuantity: 150, category: 'lunch' },
  { id: 'kofta', name: 'Kofta', nameAr: 'كفتة', emoji: '🍢', calories: 280, protein: 20, carbs: 5, fat: 22, unit: 'piece', defaultQuantity: 2, category: 'lunch' },

  // Sides/Salads
  { id: 'salad', name: 'Green Salad', nameAr: 'سلطة خضراء', emoji: '🥗', calories: 25, protein: 1, carbs: 5, fat: 0.3, unit: 'cup', defaultQuantity: 1, category: 'lunch' },
  { id: 'tahini', name: 'Tahini Sauce', nameAr: 'طحينة', emoji: '🥣', calories: 89, protein: 3, carbs: 3, fat: 8, unit: 'tbsp', defaultQuantity: 2, category: 'lunch' },
  { id: 'pickles', name: 'Pickles', nameAr: 'مخللات', emoji: '🥒', calories: 12, protein: 0.3, carbs: 2.5, fat: 0.1, unit: 'piece', defaultQuantity: 3, category: 'lunch' },

  // Snacks
  { id: 'dates', name: 'Dates', nameAr: 'تمر', emoji: '🌴', calories: 66, protein: 0.5, carbs: 18, fat: 0, unit: 'piece', defaultQuantity: 3, category: 'snack' },
  { id: 'nuts_mixed', name: 'Mixed Nuts', nameAr: 'مكسرات مشكلة', emoji: '🥜', calories: 170, protein: 4, carbs: 6, fat: 15, unit: 'handful', defaultQuantity: 1, category: 'snack' },
  { id: 'halawa', name: 'Halawa', nameAr: 'حلاوة طحينية', emoji: '🍯', calories: 180, protein: 4, carbs: 12, fat: 14, unit: 'tbsp', defaultQuantity: 1, category: 'snack' },
  { id: 'basbousa', name: 'Basbousa', nameAr: 'بسبوسة', emoji: '🍰', calories: 180, protein: 2, carbs: 25, fat: 8, unit: 'piece', defaultQuantity: 1, category: 'snack' },
  { id: 'konafa', name: 'Konafa', nameAr: 'كنافة', emoji: '🍰', calories: 300, protein: 5, carbs: 35, fat: 18, unit: 'piece', defaultQuantity: 1, category: 'snack' },
  { id: 'fruit_mixed', name: 'Mixed Fruit', nameAr: 'فاكهة مشكلة', emoji: '🍎', calories: 60, protein: 0.8, carbs: 15, fat: 0.2, unit: 'cup', defaultQuantity: 1, category: 'snack' },

  // Drinks
  { id: 'tea', name: 'Egyptian Tea', nameAr: 'شاي', emoji: '☕', calories: 0, protein: 0, carbs: 0, fat: 0, unit: 'cup', defaultQuantity: 1, category: 'drink' },
  { id: 'coffee', name: 'Turkish Coffee', nameAr: 'قهوة تركية', emoji: '☕', calories: 2, protein: 0.1, carbs: 0, fat: 0, unit: 'cup', defaultQuantity: 1, category: 'drink' },
  { id: 'juice_mango', name: 'Mango Juice', nameAr: 'عصير مانجو', emoji: '🥭', calories: 130, protein: 0.8, carbs: 32, fat: 0.3, unit: 'glass', defaultQuantity: 1, category: 'drink' },
  { id: 'juice_orange', name: 'Orange Juice', nameAr: 'عصير برتقال', emoji: '🍊', calories: 110, protein: 1.7, carbs: 26, fat: 0.5, unit: 'glass', defaultQuantity: 1, category: 'drink' },
  { id: 'sahlab', name: 'Sahlab', nameAr: 'سحلب', emoji: '🍶', calories: 180, protein: 4, carbs: 25, fat: 7, unit: 'cup', defaultQuantity: 1, category: 'drink' },
  { id: 'karkade', name: 'Karkade (Hibiscus)', nameAr: 'كركديه', emoji: '🌺', calories: 0, protein: 0, carbs: 0, fat: 0, unit: 'cup', defaultQuantity: 1, category: 'drink' },
];

const categoryOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'drink'];
const categoryLabels: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
  drink: 'Drinks',
};
const categoryIcons: Record<string, React.ReactNode> = {
  breakfast: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 2v7"/><path d="M7 9h10"/><path d="M9 9v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9"/></svg>,
  lunch: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  dinner: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v6"/><path d="M12 15v6"/><path d="M4 12h16"/><path d="M4 12a8 8 0 0 1 16 0"/></svg>,
  snack: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 6v6l4 2"/></svg>,
  drink: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18"/><path d="M5 3v18"/><path d="M19 3v18"/><path d="M3 21h18"/></svg>,
};

const QuickAddBar = forwardRef<HTMLDivElement, QuickAddBarProps>(
  (
    {
      onAddFood,
      category = 'all',
      className = '',
      style,
    },
    ref
  ) => {
    const [selectedCategory, setSelectedCategory] = useState(category);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['breakfast', 'lunch']));

    const filteredFoods = EGYPTIAN_FOODS.filter(food =>
      selectedCategory === 'all' || food.category === selectedCategory
    );

    const groupedFoods = filteredFoods.reduce((acc, food) => {
      if (!acc[food.category]) {
        acc[food.category] = [];
      }
      acc[food.category].push(food);
      return acc;
    }, {} as Record<string, QuickAddFood[]>);

    const handleFoodClick = (food: QuickAddFood) => {
      const parsedFood: ParsedFoodItem = {
        name: food.name,
        quantity: food.defaultQuantity,
        unit: food.unit,
        calories: Math.round(food.calories * food.defaultQuantity),
        protein: Math.round(food.protein * food.defaultQuantity * 10) / 10,
        carbs: Math.round(food.carbs * food.defaultQuantity * 10) / 10,
        fat: Math.round(food.fat * food.defaultQuantity * 10) / 10,
      };
      onAddFood(parsedFood);
    };

    const toggleCategory = (cat: string) => {
      setExpandedCategories(prev => {
        const next = new Set(prev);
        if (next.has(cat)) {
          next.delete(cat);
        } else {
          next.add(cat);
        }
        return next;
      });
    };

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
        {/* Category Filter */}
        <div style={{ display: 'flex', gap: spacing[2], overflowX: 'auto', paddingBottom: spacing[1], scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          {['all', ...categoryOrder].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory(cat as 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink')}
              style={{
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {categoryIcons[cat]}
              <span style={{ marginLeft: spacing[1] }}>{cat === 'all' ? 'All' : categoryLabels[cat]}</span>
            </Button>
          ))}
        </div>

        {/* Food Chips */}
        <AnimatePresence mode="popLayout">
          {categoryOrder.map((cat) => {
            const foods = groupedFoods[cat] || [];
            const isExpanded = expandedCategories.has(cat);

            if (foods.length === 0) return null;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: isExpanded ? 'auto' : 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  {/* Category Header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${spacing[2]}px 0`,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--label-secondary, #3C3C43)',
                      fontSize: fontSize.subhead.size,
                      fontWeight: fontWeight.semibold,
                      fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                    aria-expanded={isExpanded}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                      {categoryIcons[cat]}
                      {categoryLabels[cat]}
                      <span style={{
                        fontSize: fontSize.caption2.size,
                        fontWeight: fontWeight.medium,
                        color: 'var(--system-blue, #007AFF)',
                        backgroundColor: 'var(--system-blue, #007AFF)15',
                        padding: `${spacing[1]}px ${spacing[2]}px`,
                        borderRadius: borderRadius.full,
                        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                      }}>
                        {foods.length}
                      </span>
                    </span>
                    <motion.svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </motion.svg>
                  </button>

                  {/* Food Chips Grid */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: spacing[2],
                        }}
                      >
                        {foods.map((food, index) => (
                          <motion.button
                            key={food.id}
                            type="button"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={() => handleFoodClick(food)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: spacing[2],
                              padding: `${spacing[2]}px ${spacing[3]}px`,
                              borderRadius: borderRadius.full,
                              border: '1px solid var(--separator-opaque, #C6C6C8)',
                              backgroundColor: 'var(--system-background, #FFFFFF)',
                              cursor: 'pointer',
                              transition: 'all 150ms cubic-bezier(0.42, 0, 0.58, 1)',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--system-blue, #007AFF)';
                              e.currentTarget.style.backgroundColor = 'var(--system-blue, #007AFF)10';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--separator-opaque, #C6C6C8)';
                              e.currentTarget.style.backgroundColor = 'var(--system-background, #FFFFFF)';
                            }}
                          >
                            <span style={{ fontSize: '18px' }}>{food.emoji}</span>
                            <span style={{
                              fontSize: fontSize.callout.size,
                              fontWeight: fontWeight.medium,
                              color: 'var(--label-primary, #000000)',
                              fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                            }}>
                              {food.nameAr || food.name}
                            </span>
                            <span style={{
                              fontSize: fontSize.caption1.size,
                              fontWeight: fontWeight.regular,
                              color: 'var(--label-tertiary, #3C3C4399)',
                              fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                            }}>
                              {food.calories} kcal
                            </span>
                            <span style={{
                              fontSize: fontSize.caption2.size,
                              color: 'var(--label-quaternary, #3C3C434D)',
                              fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                            }}>
                              P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Show more hint when filtered */}
        {selectedCategory !== 'all' && filteredFoods.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: spacing[6],
            color: 'var(--label-tertiary, #3C3C4399)',
            fontSize: fontSize.body.size,
            fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
          }}>
            No foods in this category. Select "All" to see all options.
          </div>
        )}
      </div>
    );
  }
);

QuickAddBar.displayName = 'QuickAddBar';

export default QuickAddBar;
export { EGYPTIAN_FOODS };
export type { QuickAddFood };