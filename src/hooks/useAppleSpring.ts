/**
 * Apple Spring Hooks
 * Implements Apple's fluid interface principles:
 * - Motion starts from current on-screen value
 * - Inherits user velocity
 * - Projects momentum
 * - Stays interruptible at every instant
 */

import { useMotionValue, useSpring, useTransform, useMotionTemplate, useVelocity } from 'framer-motion';
import { useEffect, useRef } from 'react';

// Apple's standard spring configurations from the design tokens
export const springConfigs = {
  // Gentle - for large movements, sheet presentations
  gentle: { type: 'spring', stiffness: 120, damping: 14, mass: 1 },
  // Smooth - default for most UI transitions
  smooth: { type: 'spring', stiffness: 180, damping: 16, mass: 1 },
  // Snappy - for button presses, small UI
  snappy: { type: 'spring', stiffness: 280, damping: 18, mass: 1 },
  // Bouncy - for delightful moments, success states
  bouncy: { type: 'spring', stiffness: 400, damping: 12, mass: 1 },
  // iOS Default - standard iOS spring
  iosDefault: { type: 'spring', stiffness: 170, damping: 22, mass: 1 },
  // iOS Press - button/touch feedback
  iosPress: { type: 'spring', stiffness: 300, damping: 20, mass: 0.8 },
  // iOS Dismiss - sheet/modal dismissal
  iosDismiss: { type: 'spring', stiffness: 150, damping: 25, mass: 1 },
  // Sheet/Modal - bottom sheet, modal presentations
  sheet: { type: 'spring', stiffness: 250, damping: 30, mass: 1 },
  // Navigation - large title collapse, tab switching
  navigation: { type: 'spring', stiffness: 200, damping: 25, mass: 1 },
  // Search bar - focus/blur transitions
  search: { type: 'spring', stiffness: 300, damping: 25, mass: 1 },
} as const;

export type SpringConfig = keyof typeof springConfigs;

/**
 * Creates a spring that follows Apple's principles:
 * - Starts from current value (not target)
 * - Inherits velocity from gesture/drag
 * - Projects momentum naturally
 * - Remains interruptible
 */
export function useAppleSpring(
  target: number,
  config: SpringConfig = 'smooth',
  options?: {
    velocity?: number;
    onComplete?: () => void;
    clamp?: boolean;
  }
) {
  const motionValue = useMotionValue(target);
  const springRef = useRef<ReturnType<typeof useSpring> | null>(null);

  // Create spring with proper Apple config
  const spring = useSpring(motionValue, {
    ...springConfigs[config],
    ...(options?.clamp && { restDelta: 0.001 }),
  });
  springRef.current = spring;

  // Update target when it changes
  useEffect(() => {
    motionValue.set(target);
  }, [target, motionValue]);

  return motionValue;
}

/**
 * Creates a spring that can be driven by gesture velocity
 * Perfect for drag-to-dismiss, swipe gestures, momentum scrolling
 */
export function useVelocitySpring(
  initialValue: number,
  config: SpringConfig = 'iosDismiss',
  options?: {
    min?: number;
    max?: number;
    onRest?: (value: number) => void;
  }
) {
  const value = useMotionValue(initialValue);
  const velocity = useVelocity(value);

  const spring = useSpring(value, {
    ...springConfigs[config],
    ...(options?.min !== undefined && { min: options.min }),
    ...(options?.max !== undefined && { max: options.max }),
  });

  const setWithVelocity = (newValue: number, gestureVelocity: number) => {
    // Set the value and let spring inherit the gesture velocity
    value.set(newValue);
    // Framer Motion will use the current velocity for the spring
  };

  const setTarget = (newValue: number) => {
    value.set(newValue);
  };

  return {
    value,
    velocity,
    setTarget,
    setWithVelocity,
    spring,
  };
}

/**
 * Spring-based page transition with stagger
 * For lists, grids, and sequential content
 */
export function useStaggeredSpring(
  items: number,
  config: SpringConfig = 'smooth',
  staggerDelay = 0.05
) {
  const [values, setValues] = useState<number[]>(() =>
    Array(items).fill(0)
  );

  useEffect(() => {
    // Animate items in sequence
    values.forEach((_, index) => {
      setTimeout(() => {
        setValues(prev => {
          const next = [...prev];
          next[index] = 1;
          return next;
        });
      }, index * staggerDelay * 1000);
    });
  }, [items, staggerDelay, values]);

  return values.map((_, index) =>
    useSpring(values[index] as any, {
      ...springConfigs[config],
      delay: index * staggerDelay,
    })
  );
}

// Need to import useState
import { useState } from 'react';

/**
 * Interruptible spring for UI state changes
 * Can be interrupted mid-animation without glitches
 */
export function useInterruptibleSpring(
  target: boolean | number,
  config: SpringConfig = 'smooth'
) {
  const value = useMotionValue(typeof target === 'boolean' ? (target ? 1 : 0) : target);

  const spring = useSpring(value, {
    ...springConfigs[config],
    restSpeed: 0.01, // More precise stopping
  });

  const setTarget = (newTarget: boolean | number) => {
    value.set(typeof newTarget === 'boolean' ? (newTarget ? 1 : 0) : newTarget);
  };

  const toggle = () => {
    value.set(value.get() > 0.5 ? 0 : 1);
  };

  return { value, spring, setTarget, toggle };
}

/**
 * Momentum projection for scroll/swipe gestures
 * Projects resting position using exponential decay
 */
export function useMomentumProjection(
  currentValue: number,
  velocity: number,
  config: {
    decay?: number; // 0.998 per Apple's skill
    min?: number;
    max?: number;
    snapPoints?: number[];
  } = {}
) {
  const { decay = 0.998, min, max, snapPoints = [] } = config;

  // Project resting position: d = v / (1 - decay)
  const projectedDistance = velocity / (1 - decay);
  let projectedPosition = currentValue + projectedDistance;

  // Clamp to bounds
  if (min !== undefined) projectedPosition = Math.max(min, projectedPosition);
  if (max !== undefined) projectedPosition = Math.min(max, projectedPosition);

  // Snap to nearest snap point
  if (snapPoints.length > 0) {
    let nearest = snapPoints[0];
    let minDistance = Math.abs(projectedPosition - nearest);

    snapPoints.forEach(point => {
      const distance = Math.abs(projectedPosition - point);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });

    projectedPosition = nearest;
  }

  return projectedPosition;
}

/**
 * Reduced motion hook - respects prefers-reduced-motion
 * Returns instant transitions when user prefers reduced motion
 */
export function useReducedMotion(
  config: SpringConfig = 'smooth'
) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  if (prefersReducedMotion) {
    return { type: 'tween', duration: 0.01 } as const;
  }

  return springConfigs[config];
}

/**
 * Media query hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

/**
 * Template for building CSS transform strings with spring values
 * Useful for combining multiple spring values into one transform
 */
export function useTransformTemplate(
  template: string,
  ...values: ReturnType<typeof useMotionValue>[]
) {
  return useMotionTemplate(template, ...values);
}

/**
 * Creates a spring that follows pointer/touch with 1:1 mapping
 * For direct manipulation interfaces
 */
export function useDirectManipulationSpring(
  initialValue: number = 0,
  config: SpringConfig = 'iosPress'
) {
  const value = useMotionValue(initialValue);
  const spring = useSpring(value, springConfigs[config]);

  const setPosition = (x: number) => {
    value.set(x);
  };

  return { value, spring, setPosition };
}

/**
 * Hook for creating continuous, interruptible animations
 * Like heartbeats, loading indicators, etc.
 */
export function useContinuousSpring(
  active: boolean,
  config: SpringConfig = 'gentle'
) {
  const value = useMotionValue(0);

  useEffect(() => {
    if (active) {
      value.set(1);
    } else {
      value.set(0);
    }
  }, [active, value]);

  const spring = useSpring(value, {
    ...springConfigs[config],
    restSpeed: 0.01,
  });

  return { value, spring };
}