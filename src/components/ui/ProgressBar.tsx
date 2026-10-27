/**
 * Apple HIG Compliant Progress Bar Component
 * Horizontal progress with rounded caps and animated fill
 */

import React, { forwardRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import { spacing, borderRadius, fontSize, fontWeight } from '../../design/tokens';

export interface ProgressBarProps {
  /** Progress value (0-1) */
  progress: number;
  /** Bar height */
  height?: number | 'thin' | 'default' | 'thick';
  /** Progress color */
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'pink' | 'teal' | 'indigo' | string;
  /** Track color */
  trackColor?: string;
  /** Show percentage label */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: 'inside' | 'outside' | 'above' | 'below';
  /** Label formatter */
  labelFormatter?: (progress: number) => string;
  /** Animation duration (ms) */
  animationDuration?: number;
  /** Animation easing */
  animationEasing?: string;
  /** Indeterminate (loading) state */
  indeterminate?: boolean;
  /** Buffer progress (for streaming) */
  bufferProgress?: number;
  /** Buffer color */
  bufferColor?: string;
  /** Rounded caps */
  rounded?: boolean;
  /** Striped animation */
  striped?: boolean;
  /** Animated stripes */
  animatedStripes?: boolean;
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

const heightMap = {
  thin: 2,
  default: 4,
  thick: 8,
};

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      progress,
      height = 'default',
      color = 'blue',
      trackColor,
      showLabel = false,
      labelPosition = 'inside',
      labelFormatter,
      animationDuration = 500,
      animationEasing = 'cubic-bezier(0.17, 0.67, 0.5, 1)',
      indeterminate = false,
      bufferProgress,
      bufferColor,
      rounded = true,
      striped = false,
      animatedStripes = false,
      className = '',
      style,
      'aria-label': ariaLabel,
      'aria-valuetext': ariaValueText,
      ...props
    },
    ref
  ) => {
    // Resolve height
    const heightValue = typeof height === 'number' ? height : heightMap[height];

    // Clamp progress
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // Colors
    const progressColor = colorMap[color] || color;
    const trackColorValue = trackColor || 'var(--separator-opaque, #C6C6C8)';
    const bufferColorValue = bufferColor || `${progressColor}4D`; // 30% opacity

    // Animated progress using Framer Motion
    const progressMotion = useMotionValue(0);
    const springProgress = useSpring(progressMotion, {
      stiffness: 200,
      damping: 20,
      mass: 0.8,
    });

    // Animate on mount and progress change
    useEffect(() => {
      if (!indeterminate) {
        // @ts-expect-error - Framer Motion animate accepts MotionValue
        animate(progressMotion, clampedProgress, {
          duration: animationDuration / 1000,
          easing: animationEasing as any,
        });
      }
    }, [clampedProgress, animationDuration, animationEasing, progressMotion, indeterminate]);

    // Indeterminate animation
    const indeterminateX = useMotionValue(0);
    useEffect(() => {
      if (indeterminate) {
        // @ts-expect-error - Framer Motion animate accepts MotionValue
        const controls = animate(indeterminateX, [-0.5, 1.5], {
          duration: 1.5,
          repeat: Infinity,
          easing: 'easeInOut',
        });
        return () => controls.stop();
      }
    }, [indeterminate, indeterminateX]);

    const labelText = labelFormatter
      ? labelFormatter(clampedProgress)
      : `${Math.round(clampedProgress * 100)}%`;

    const borderRadiusValue = rounded ? borderRadius.full : '0';

    const containerStyle: React.CSSProperties = {
      width: '100%',
      display: 'flex',
      flexDirection: labelPosition === 'above' || labelPosition === 'below' ? 'column' : 'row',
      alignItems: 'center',
      gap: spacing[2],
      ...style,
    };

    const trackStyle: React.CSSProperties = {
      position: 'relative',
      width: '100%',
      height: heightValue,
      backgroundColor: trackColorValue,
      borderRadius: borderRadiusValue,
      overflow: 'hidden',
      flex: 1,
    };

    const labelStyles: Record<string, React.CSSProperties> = {
      inside: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      },
      outside: {
        position: 'absolute',
        top: '50%',
        right: `-${spacing[4]}px`,
        transform: 'translateY(-50%)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      },
      above: {
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: spacing[1],
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      },
      below: {
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: spacing[1],
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      },
    };

    return (
      <div
        ref={ref}
        className={className}
        style={containerStyle}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuenow={indeterminate ? undefined : Math.round(clampedProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={ariaValueText || labelText}
        {...props}
      >
        <div style={trackStyle}>
          {/* Buffer Progress */}
          {bufferProgress !== undefined && bufferProgress > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${Math.max(0, Math.min(1, bufferProgress)) * 100}%`,
                backgroundColor: bufferColorValue,
                borderRadius: borderRadiusValue,
                transition: 'width 200ms ease-out',
              }}
            />
          )}

          {/* Progress Fill */}
          {!indeterminate ? (
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                backgroundColor: progressColor,
                borderRadius: borderRadiusValue,
                transformOrigin: 'left center',
                scaleX: springProgress,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
          ) : (
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '40%',
                backgroundColor: progressColor,
                borderRadius: borderRadiusValue,
                transformOrigin: 'left center',
                x: indeterminateX,
              }}
            />
          )}

          {/* Striped Overlay */}
          {(striped || animatedStripes) && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `
                  repeating-linear-gradient(
                    45deg,
                    rgba(255,255,255,0.15),
                    rgba(255,255,255,0.15) 10px,
                    transparent 10px,
                    transparent 20px
                  )
                `,
                backgroundSize: '28px 28px',
                borderRadius: borderRadiusValue,
                opacity: 0.5,
                animation: animatedStripes ? 'stripe-move 1s linear infinite' : 'none',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Label inside */}
          {showLabel && labelPosition === 'inside' && (
            <span style={{
              ...labelStyles.inside,
              fontSize: `${heightValue * 1.5}px`,
              fontWeight: fontWeight.semibold,
              color: '#FFFFFF',
              fontFamily: 'inherit',
              lineHeight: 1,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}>
              {labelText}
            </span>
          )}
        </div>

        {/* Label outside/above/below */}
        {showLabel && labelPosition !== 'inside' && (
          <span style={{
            ...labelStyles[labelPosition],
            fontSize: fontSize.caption1.size,
            fontWeight: fontWeight.medium,
            color: 'var(--label-secondary, #3C3C43)',
            fontFamily: 'inherit',
          }}>
            {labelText}
          </span>
        )}

        {/* Keyframes for animated stripes */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes stripe-move {
              0% { background-position: 0 0; }
              100% { background-position: 28px 0; }
            }
          `
        }} />
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;

/**
 * Multi-segment Progress Bar (for multi-step processes)
 */
export interface MultiSegmentProgressBarProps {
  /** Segments configuration */
  segments: Array<{
    progress: number;
    color?: string;
    label?: string;
  }>;
  /** Height */
  height?: number | 'thin' | 'default' | 'thick';
  /** Gap between segments */
  gap?: number;
  /** Rounded caps */
  rounded?: boolean;
  /** Show labels */
  showLabels?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export const MultiSegmentProgressBar = ({
  segments,
  height = 'default',
  gap = 4,
  rounded = true,
  showLabels = false,
  className = '',
  style,
}: MultiSegmentProgressBarProps) => {
  const heightValue = typeof height === 'number' ? height : heightMap[height];
  const borderRadiusValue = rounded ? borderRadius.full : '0';

  const totalProgress = segments.reduce((sum, s) => sum + s.progress, 0);
  const clampedTotal = Math.max(0, Math.min(1, totalProgress));

  return (
    <div
      className={className}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[1],
        ...style,
      }}
      role="progressbar"
      aria-valuenow={Math.round(clampedTotal * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: heightValue,
          backgroundColor: 'var(--separator-opaque, #C6C6C8)',
          borderRadius: borderRadiusValue,
          overflow: 'hidden',
        }}
      >
        {segments.map((segment, index) => {
          const segmentColor = segment.color || colorMap.blue;
          const segmentProgress = Math.max(0, Math.min(1, segment.progress));

          return (
            <motion.div
              key={index}
              initial={{ width: 0 }}
              animate={{ width: `${segmentProgress * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: index * 0.1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: index === 0 ? 0 : 'auto',
                height: '100%',
                backgroundColor: segmentColor,
                borderRadius: index === 0 && rounded ? borderRadiusValue : 0,
              }}
            />
          );
        })}

        {/* Segment dividers */}
        {segments.length > 1 && Array.from({ length: segments.length - 1 }).map((_, i) => (
          <div
            key={`divider-${i}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${((i + 1) / segments.length) * 100}%`,
              width: gap,
              backgroundColor: 'var(--system-background, #FFFFFF)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>

      {showLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: spacing[2] }}>
          {segments.map((segment, index) => (
            <span
              key={index}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: fontSize.caption2.size,
                fontWeight: fontWeight.medium,
                color: segment.color || colorMap.blue,
                fontFamily: 'inherit',
              }}
            >
              {segment.label || `Step ${index + 1}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

MultiSegmentProgressBar.displayName = 'MultiSegmentProgressBar';

/**
 * Linear Progress Indicator (thin line at top of screen)
 */
export interface LinearProgressIndicatorProps extends Omit<ProgressBarProps, 'height' | 'rounded'> {
  /** Fixed position at top */
  fixed?: boolean;
  /** Z-index */
  zIndex?: number;
}

export const LinearProgressIndicator = ({
  fixed = true,
  zIndex = 1000,
  className = '',
  style,
  ...props
}: LinearProgressIndicatorProps) => (
  <ProgressBar
    className={className}
    style={{
      position: fixed ? 'fixed' : 'relative',
      top: 0,
      left: 0,
      right: 0,
      zIndex,
      height: 'auto',
      padding: 0,
      margin: 0,
      borderRadius: 0,
      ...style,
    }}
    height="thin"
    rounded={false}
    {...props}
  />
);

LinearProgressIndicator.displayName = 'LinearProgressIndicator';

/**
 * Circular Progress Bar (hybrid ring/bar for compact spaces)
 */
export interface CircularProgressBarProps {
  /** Progress value (0-1) */
  progress: number;
  /** Size in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Progress color */
  color?: string;
  /** Track color */
  trackColor?: string;
  /** Show label */
  showLabel?: boolean;
  /** Label formatter */
  labelFormatter?: (progress: number) => string;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export const CircularProgressBar = ({
  progress,
  size = 40,
  strokeWidth = 4,
  color = 'blue',
  trackColor,
  showLabel = true,
  labelFormatter,
  className = '',
  style,
}: CircularProgressBarProps) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const progressColor = colorMap[color] || color;
  const trackColorValue = trackColor || 'var(--separator-opaque, #C6C6C8)';
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedProgress);
  const center = size / 2;

  const labelText = labelFormatter
    ? labelFormatter(clampedProgress)
    : `${Math.round(clampedProgress * 100)}%`;

  return (
    <svg
      className={className}
      style={{
        width: size,
        height: size,
        transform: 'rotate(-90deg)',
        ...style,
      }}
      role="progressbar"
      aria-valuenow={Math.round(clampedProgress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColorValue}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Progress */}
      <motion.circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{
          transformOrigin: `${center}px ${center}px`,
        }}
      />

      {showLabel && (
        <text
          x={center}
          y={center}
          dominantBaseline="central"
          textAnchor="middle"
          style={{
            fontSize: `${size * 0.25}px`,
            fontWeight: 600,
            fontFamily: 'inherit',
            fill: 'var(--label-primary, #000000)',
            pointerEvents: 'none',
          }}
        >
          {labelText}
        </text>
      )}
    </svg>
  );
};

CircularProgressBar.displayName = 'CircularProgressBar';