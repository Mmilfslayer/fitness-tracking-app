/**
 * MacroRing - Animated circular progress with percentage and remaining
 * Used for Calories, Protein, Carbs, Fat progress rings
 */

import React, { forwardRef } from 'react';
import ProgressRing, { ProgressRingProps } from '../../ui/ProgressRing';
import { spacing, fontSize, fontWeight } from '../../../design/tokens';

export interface MacroRingProps extends Omit<ProgressRingProps, 'progress' | 'showLabel' | 'labelFormatter' | 'size' | 'color'> {
  /** Progress value (0-1) */
  progress: number;
  /** Macro label (e.g., "Calories", "Protein") */
  label: string;
  /** Current value */
  value: number;
  /** Target/goal value */
  target: number;
  /** Unit (e.g., "kcal", "g") */
  unit: string;
  /** Ring color theme */
  color?: 'calories' | 'protein' | 'carbs' | 'fat';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show remaining amount */
  showRemaining?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

const macroColorMap = {
  calories: '#FF3B30',   // Red
  protein: '#34C759',    // Green
  carbs: '#007AFF',      // Blue
  fat: '#FF9F0A',        // Orange
} as const;


const MacroRing = forwardRef<HTMLDivElement, MacroRingProps>(
  (
    {
      progress,
      label,
      value,
      target,
      unit,
      color = 'calories',
      size = 'md',
      showRemaining = true,
      onClick,
      className = '',
      style,
    },
    ref
  ) => {
    const sizeMap = {
      sm: 80,
      md: 100,
      lg: 120,
    };

    const ringSize = sizeMap[size];
    const remaining = Math.max(0, target - value);
    const progressPercent = Math.round(progress * 100);

    return (
      <div
        ref={ref}
        className={className}
        onClick={onClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing[2],
          cursor: onClick ? 'pointer' : 'default',
          ...style,
        }}
      >
        <ProgressRing
          progress={progress}
          size={ringSize}
          strokeWidth={6}
          color={macroColorMap[color]}
          showLabel={true}
          labelFormatter={() => `${progressPercent}%`}
          style={{
            transform: 'rotate(-90deg)',
          }}
        />

        <div style={{ textAlign: 'center', minWidth: ringSize }}>
          <div
            style={{
              fontSize: fontSize.headline.size,
              fontWeight: fontWeight.semibold,
              lineHeight: fontSize.headline.lineHeight,
              letterSpacing: fontSize.headline.letterSpacing,
              color: 'var(--label-primary, #000000)',
              fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
            }}
          >
            {Math.round(value)}
            <span
              style={{
                fontSize: fontSize.caption1.size,
                fontWeight: fontWeight.regular,
                color: 'var(--label-tertiary, #3C3C4399)',
                marginLeft: spacing[1],
              }}
            >
              {unit}
            </span>
          </div>

          <div
            style={{
              marginTop: spacing[1],
              fontSize: fontSize.caption1.size,
              fontWeight: fontWeight.medium,
              lineHeight: fontSize.caption1.lineHeight,
              letterSpacing: fontSize.caption1.letterSpacing,
              color: 'var(--label-secondary, #3C3C43)',
              fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
              textTransform: 'capitalize',
            }}
          >
            {label}
          </div>

          {showRemaining && (
            <div
              style={{
                marginTop: spacing[1],
                fontSize: fontSize.caption2.size,
                fontWeight: fontWeight.regular,
                lineHeight: fontSize.caption2.lineHeight,
                letterSpacing: fontSize.caption2.letterSpacing,
                color: 'var(--label-tertiary, #3C3C4399)',
                fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
              }}
            >
              {remaining > 0 ? `${Math.round(remaining)} ${unit} remaining` : 'Goal reached!'}
            </div>
          )}
        </div>
      </div>
    );
  }
);

MacroRing.displayName = 'MacroRing';

export default MacroRing;