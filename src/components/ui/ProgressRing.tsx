/**
 * Apple HIG Compliant Progress Ring Component
 * Circular progress with animated stroke using SVG and Framer Motion
 */

import React, { forwardRef, useEffect } from 'react';
import { motion, useSpring, useMotionValue, animate } from 'framer-motion';
import { componentTokens, spacing, borderRadius } from '../../design/tokens';

export interface ProgressRingProps {
  /** Progress value (0-1) */
  progress: number;
  /** Ring size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Stroke width */
  strokeWidth?: number;
  /** Progress color */
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'pink' | 'teal' | 'indigo' | string;
  /** Track color */
  trackColor?: string;
  /** Show percentage label */
  showLabel?: boolean;
  /** Label formatter */
  labelFormatter?: (progress: number) => string;
  /** Animation duration (ms) */
  animationDuration?: number;
  /** Animation easing */
  animationEasing?: string;
  /** Starting angle (degrees, -90 = top) */
  startAngle?: number;
  /** Clockwise direction */
  clockwise?: boolean;
  /** Gap between rings (for multi-ring) */
  gap?: number;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Accessibility label */
  'aria-label'?: string;
  /** Value label for screen readers */
  'aria-valuetext'?: string;
}

const colorMap: Record<string, string> = {
  blue: '#007AFF',
  green: '#34C759',
  orange: '#FF9F0A',
  red: '#FF3B30',
  purple: '#AF52DE',
  pink: '#FF2D55',
  teal: '#5AC8FA',
  indigo: '#5856D6',
};

const ProgressRing = forwardRef<SVGSVGElement, ProgressRingProps>(
  (
    {
      progress,
      size = 'md',
      strokeWidth,
      color = 'blue',
      trackColor,
      showLabel = false,
      labelFormatter,
      animationDuration = 800,
      animationEasing = 'cubic-bezier(0.17, 0.67, 0.5, 1)',
      startAngle = -90,
      clockwise = true,
      gap = 0,
      className = '',
      style,
      'aria-label': ariaLabel,
      'aria-valuetext': ariaValueText,
      ...props
    },
    ref
  ) => {
    const token = componentTokens.progress;

    // Resolve size
    const sizeValue: number = typeof size === 'number' ? size :
      size === 'sm' ? 32 :
      size === 'md' ? parseFloat(token.ringSize) :
      size === 'lg' ? parseFloat(token.ringSizeLarge) :
      size === 'xl' ? 88 :
      parseFloat(token.ringSize);

    // Resolve stroke width
    const strokeWidthValue: number = strokeWidth ?? parseFloat(token.ringStrokeWidth);

    // Clamp progress
    const clampedProgress: number = Math.max(0, Math.min(1, progress));

    // Colors
    const progressColor = colorMap[color] || color;
    const trackColorValue = trackColor || 'var(--separator-opaque, #C6C6C8)';

    // Calculate radius and circumference
    const radius: number = (sizeValue - strokeWidthValue) / 2;
    const circumference: number = 2 * Math.PI * radius;

    // Stroke dasharray
    const strokeDasharray: number = circumference;

    // Center point
    const center: number = sizeValue / 2;

    // Animated progress value using Framer Motion
    const progressMotion = useMotionValue(0);
    const springProgress = useSpring(progressMotion, {
      stiffness: 200,
      damping: 20,
      mass: 0.8,
    });

    // Animate on mount and progress change
    useEffect(() => {
      // @ts-expect-error - Framer Motion animate accepts MotionValue
      animate(progressMotion, clampedProgress, {
        duration: animationDuration / 1000,
        easing: animationEasing as any,
      });
    }, [clampedProgress, animationDuration, animationEasing, progressMotion]);

    const labelText = labelFormatter
      ? labelFormatter(clampedProgress)
      : `${Math.round(clampedProgress * 100)}%`;

    const labelStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: `${sizeValue * 0.22}px`,
      fontWeight: 600,
      fontFamily: 'inherit',
      color: 'var(--label-primary, #000000)',
      lineHeight: 1,
      pointerEvents: 'none',
    };

    return (
      <svg
        ref={ref}
        className={className}
        style={{
          width: sizeValue,
          height: sizeValue,
          transform: `rotate(${startAngle}deg)`,
          ...style,
        }}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuenow={Math.round(clampedProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={ariaValueText || labelText}
        {...props}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColorValue}
          strokeWidth={strokeWidthValue}
          strokeLinecap="round"
        />

        {/* Progress Ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidthValue}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          style={{
            strokeDashoffset: springProgress,
            transformOrigin: `${center}px ${center}px`,
          }}
        />

        {/* Label */}
        {showLabel && (
          <text
            x={center}
            y={center}
            dominantBaseline="central"
            textAnchor="middle"
            style={labelStyle}
          >
            {labelText}
          </text>
        )}
      </svg>
    );
  }
);

ProgressRing.displayName = 'ProgressRing';

export default ProgressRing;

/**
 * Multi-ring Progress Component (for activity rings style)
 */
export interface MultiProgressRingProps {
  /** Array of ring configurations */
  rings: Array<{
    progress: number;
    color?: string;
    strokeWidth?: number;
    size?: number;
  }>;
  /** Base size */
  size?: number;
  /** Gap between rings */
  gap?: number;
  /** Show center label */
  centerLabel?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export const MultiProgressRing = ({
  rings,
  size = 120,
  gap = 4,
  centerLabel,
  className = '',
  style,
}: MultiProgressRingProps) => {
  const maxSize = size;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: maxSize,
        height: maxSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {rings.map((ring, index) => {
        const ringSize = maxSize - index * (ring.strokeWidth || 8) * 2 - index * gap * 2;
        return (
          <ProgressRing
            key={index}
            progress={ring.progress}
            size={ringSize}
            strokeWidth={ring.strokeWidth || 8}
            color={ring.color || 'blue'}
            showLabel={false}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-90deg)',
            }}
          />
        );
      })}

      {centerLabel && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {centerLabel}
        </div>
      )}
    </div>
  );
};

MultiProgressRing.displayName = 'MultiProgressRing';

/**
 * Activity Rings (Apple Watch style)
 */
export interface ActivityRingsProps {
  /** Move ring progress (0-1) */
  move: number;
  /** Exercise ring progress (0-1) */
  exercise: number;
  /** Stand ring progress (0-1) */
  stand: number;
  /** Size */
  size?: number;
  /** Gap between rings */
  gap?: number;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export const ActivityRings = ({
  move,
  exercise,
  stand,
  size = 140,
  gap = 6,
  className = '',
  style,
}: ActivityRingsProps) => (
  <MultiProgressRing
    className={className}
    style={style}
    size={size}
    gap={gap}
    rings={[
      { progress: move, color: '#FF2D55', strokeWidth: 12 },     // Move - Red/Pink
      { progress: exercise, color: '#34C759', strokeWidth: 12 },  // Exercise - Green
      { progress: stand, color: '#5AC8FA', strokeWidth: 12 },     // Stand - Teal/Blue
    ]}
    centerLabel={
      <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--label-secondary, #3C3C43)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Activity
        </div>
      </div>
    }
  />
);

ActivityRings.displayName = 'ActivityRings';

/**
 * Progress Ring with Step Indicator
 */
export interface SteppedProgressRingProps extends Omit<ProgressRingProps, 'progress'> {
  /** Current step (0-based) */
  currentStep: number;
  /** Total steps */
  totalSteps: number;
  /** Step labels */
  stepLabels?: string[];
  /** Show step indicators around ring */
  showStepIndicators?: boolean;
}

export const SteppedProgressRing = ({
  currentStep,
  totalSteps,
  stepLabels,
  showStepIndicators = true,
  size = 'lg',
  strokeWidth,
  color = 'blue',
  trackColor,
  className = '',
  style,
  ...props
}: SteppedProgressRingProps) => {
  const progress = totalSteps > 0 ? currentStep / totalSteps : 0;
  const sizeValue = typeof size === 'number' ? size :
    size === 'sm' ? 32 :
    size === 'md' ? 44 :
    size === 'lg' ? 64 :
    size === 'xl' ? 88 : 64;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style,
      }}
    >
      <ProgressRing
        progress={progress}
        size={sizeValue}
        strokeWidth={strokeWidth}
        color={color}
        trackColor={trackColor}
        showLabel={true}
        labelFormatter={() => `${currentStep}/${totalSteps}`}
        {...props}
      />

      {showStepIndicators && stepLabels && (
        <div
          style={{
            marginTop: spacing[3],
            display: 'flex',
            gap: spacing[2],
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {stepLabels.map((label, index) => (
            <span
              key={index}
              style={{
                fontSize: '11px',
                fontWeight: index <= currentStep ? 600 : 400,
                color: index <= currentStep
                  ? colorMap[color] || color
                  : 'var(--label-tertiary, #3C3C4399)',
                fontFamily: 'inherit',
                padding: `${spacing[1]}px ${spacing[2]}px`,
                borderRadius: borderRadius.full,
                backgroundColor: index <= currentStep
                  ? `${colorMap[color] || color}1A`
                  : 'transparent',
                transition: 'all 200ms ease',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

SteppedProgressRing.displayName = 'SteppedProgressRing';