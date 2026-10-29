/**
 * Apple Fluid Gesture Hooks
 * Implements direct manipulation with velocity inheritance and momentum projection
 * Based on WWDC "Designing Fluid Interfaces" principles
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useMotionValue, useSpring, useTransform, useVelocity, useDragControls } from 'framer-motion';
import { springConfigs } from './useAppleSpring';

// ============================================================================
// DRAG TO DISMISS / SWIPE GESTURES
// ============================================================================

export interface DragToDismissOptions {
  /** Axis to track ('x' or 'y') */
  axis?: 'x' | 'y';
  /** Threshold to trigger dismiss (pixels) */
  threshold?: number;
  /** Velocity threshold for flick dismiss (pixels/sec) */
  velocityThreshold?: number;
  /** Spring config for return animation */
  returnSpring?: keyof typeof springConfigs;
  /** Spring config for dismiss animation */
  dismissSpring?: keyof typeof springConfigs;
  /** Called when dismiss is triggered */
  onDismiss?: () => void;
  /** Called when drag starts */
  onDragStart?: () => void;
  /** Called when drag ends (with final position) */
  onDragEnd?: (position: number) => void;
  /** Minimum position (for resistance) */
  min?: number;
  /** Maximum position (for resistance) */
  max?: number;
  /** Elastic resistance at bounds */
  elastic?: number;
}

export interface DragToDismissReturn {
  /** Motion value for the drag position */
  position: ReturnType<typeof useMotionValue>;
  /** Spring value for smooth animation */
  spring: ReturnType<typeof useSpring>;
  /** Current velocity */
  velocity: ReturnType<typeof useVelocity>;
  /** Whether currently dragging */
  isDragging: boolean;
  /** Drag controls for Framer Motion */
  dragControls: ReturnType<typeof useDragControls>;
  /** Manually trigger dismiss */
  dismiss: () => void;
  /** Reset to initial position */
  reset: () => void;
  /** Set position programmatically */
  setPosition: (x: number) => void;
}

/**
 * Creates a drag-to-dismiss gesture with Apple-style momentum projection
 * - Tracks drag position with 1:1 pointer mapping
 * - Inherits release velocity for momentum
 * - Projects resting position using exponential decay
 * - Snaps to bounds or dismisses based on velocity/position
 */
export function useDragToDismiss(
  initialPosition: number = 0,
  options: DragToDismissOptions = {}
): DragToDismissReturn {
  const {
    axis = 'y',
    threshold = 100,
    velocityThreshold = 1000,
    returnSpring = 'iosDismiss',
    dismissSpring = 'snappy',
    onDismiss,
    onDragStart,
    onDragEnd,
    min = -Infinity,
    max = Infinity,
    elastic = 0.2,
  } = options;

  const position = useMotionValue(initialPosition);
  const velocity = useVelocity(position);
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();

  // Spring for return animation
  const spring = useSpring(position, springConfigs[returnSpring]);

  // Momentum projection (Apple's exponential decay: d ≈ 0.998)
  const projectMomentum = useCallback((currentPos: number, currentVel: number): number => {
    const decay = 0.998;
    const projectedDistance = currentVel / (1 - decay);
    return currentPos + projectedDistance;
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    onDragStart?.();
  }, [onDragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const currentPos = position.get();
    const currentVel = velocity.get();

    // Check if we should dismiss
    const shouldDismiss =
      (axis === 'y' && currentPos > threshold && currentVel > velocityThreshold) ||
      (axis === 'y' && currentPos < -threshold && currentVel < -velocityThreshold) ||
      (axis === 'x' && currentPos > threshold && currentVel > velocityThreshold) ||
      (axis === 'x' && currentPos < -threshold && currentVel < -velocityThreshold);

    if (shouldDismiss) {
      // Animate to dismiss with velocity
      position.set(currentPos + currentVel * 0.5, { type: 'spring', ...springConfigs[dismissSpring] });
      onDismiss?.();
    } else {
      // Spring back to origin with inherited velocity
      position.set(0, { type: 'spring', ...springConfigs[returnSpring] });
    }

    onDragEnd?.(currentPos);
  }, [position, velocity, axis, threshold, velocityThreshold, returnSpring, dismissSpring, onDismiss, onDragEnd]);

  const dismiss = useCallback(() => {
    position.set(max, { type: 'spring', ...springConfigs[dismissSpring] });
    onDismiss?.();
  }, [position, max, dismissSpring, onDismiss]);

  const reset = useCallback(() => {
    position.set(initialPosition, { type: 'spring', ...springConfigs[returnSpring] });
  }, [position, initialPosition, returnSpring]);

  const setPosition = useCallback((x: number) => {
    position.set(x);
  }, [position]);

  return {
    position,
    spring,
    velocity,
    isDragging,
    dragControls,
    dismiss,
    reset,
    setPosition,
  };
}

// ============================================================================
// SWIPE ACTION (Like iOS Mail swipe actions)
// ============================================================================

export interface SwipeActionOptions {
  /** Threshold to reveal action (pixels) */
  threshold?: number;
  /** Maximum swipe distance */
  maxDistance?: number;
  /** Action buttons */
  actions?: Array<{
    label: string;
    color: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;
  /** Spring config */
  spring?: keyof typeof springConfigs;
}

export interface SwipeActionReturn {
  /** Drag position */
  position: ReturnType<typeof useMotionValue>;
  /** Spring value */
  spring: ReturnType<typeof useSpring>;
  /** Whether actions are revealed */
  isOpen: boolean;
  /** Toggle actions */
  toggle: () => void;
  /** Close actions */
  close: () => void;
  /** Open actions */
  open: () => void;
}

/**
 * iOS-style swipe actions with spring reveal
 * - Velocity-aware open/close
 * - Snap to action threshold
 * - Elastic resistance at bounds
 */
export function useSwipeAction(options: SwipeActionOptions = {}): SwipeActionReturn {
  const {
    threshold = 80,
    maxDistance = 240,
    spring = 'iosDefault',
  } = options;

  const position = useMotionValue(0);
  const springValue = useSpring(position, springConfigs[spring]);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    position.set(maxDistance);
    setIsOpen(true);
  }, [position, maxDistance]);

  const close = useCallback(() => {
    position.set(0);
    setIsOpen(false);
  }, [position]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // Auto-snap on drag end
  const handleDragEnd = useCallback((_: any, info: { velocity: { x: number; y: number } }) => {
    const currentPos = position.get();
    const currentVel = info.velocity.x; // Horizontal swipe

    // Project momentum
    const decay = 0.998;
    const projectedDistance = currentVel / (1 - decay);
    const projectedPos = currentPos + projectedDistance;

    if (isOpen) {
      // Closing: if swiped back past threshold or high velocity back
      if (projectedPos < threshold / 2 || currentVel > 500) {
        close();
      } else {
        open();
      }
    } else {
      // Opening: if swiped past threshold or high velocity forward
      if (projectedPos > threshold || currentVel < -500) {
        open();
      } else {
        close();
      }
    }
  }, [position, isOpen, threshold, open, close]);

  return {
    position,
    spring: springValue,
    isOpen,
    toggle,
    close,
    open,
  };
}

// ============================================================================
// PULL TO REFRESH
// ============================================================================

export interface PullToRefreshOptions {
  /** Distance to trigger refresh */
  threshold?: number;
  /** Maximum pull distance */
  maxDistance?: number;
  /** Spring config for resistance */
  resistanceSpring?: keyof typeof springConfigs;
  /** Called when refresh is triggered */
  onRefresh: () => Promise<void> | void;
  /** Called when pull progress changes */
  onProgress?: (progress: number) => void;
}

export interface PullToRefreshReturn {
  /** Pull position */
  position: ReturnType<typeof useMotionValue>;
  /** Spring value */
  spring: ReturnType<typeof useSpring>;
  /** Whether currently pulling */
  isPulling: boolean;
  /** Whether refreshing */
  isRefreshing: boolean;
  /** Pull progress (0-1) */
  progress: number;
  /** Trigger refresh manually */
  triggerRefresh: () => void;
}

/**
 * iOS-style pull to refresh with elastic resistance
 * - Progressive resistance as you pull further
 * - Spring release with momentum
 * - Automatic refresh trigger at threshold
 */
export function usePullToRefresh(options: PullToRefreshOptions): PullToRefreshReturn {
  const {
    threshold = 80,
    maxDistance = 120,
    resistanceSpring = 'gentle',
    onRefresh,
    onProgress,
  } = options;

  const position = useMotionValue(0);
  const spring = useSpring(position, springConfigs[resistanceSpring]);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  // Progress 0-1
  const progress = useTransform(position, [0, maxDistance], [0, 1]);

  useEffect(() => {
    onProgress?.(progress.get());
  }, [progress, onProgress]);

  const handleDragStart = useCallback(() => {
    if (!isRefreshing) {
      setIsPulling(true);
    }
  }, [isRefreshing]);

  const handleDragEnd = useCallback(async () => {
    setIsPulling(false);

    if (isRefreshing || refreshingRef.current) return;

    const currentPos = position.get();

    if (currentPos >= threshold) {
      // Trigger refresh
      refreshingRef.current = true;
      setIsRefreshing(true);

      // Animate to threshold position while refreshing
      position.set(threshold, { type: 'spring', ...springConfigs.iosDefault });

      try {
        await onRefresh();
      } finally {
        // Animate back to 0 after refresh
        position.set(0, { type: 'spring', ...springConfigs.snappy });
        setIsRefreshing(false);
        refreshingRef.current = false;
      }
    } else {
      // Spring back
      position.set(0, { type: 'spring', ...springConfigs.snappy });
    }
  }, [position, threshold, maxDistance, isRefreshing, onRefresh]);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshing || refreshingRef.current) return;
    refreshingRef.current = true;
    setIsRefreshing(true);
    position.set(threshold, { type: 'spring', ...springConfigs.iosDefault });

    try {
      await onRefresh();
    } finally {
      position.set(0, { type: 'spring', ...springConfigs.snappy });
      setIsRefreshing(false);
      refreshingRef.current = false;
    }
  }, [position, threshold, isRefreshing, onRefresh]);

  return {
    position,
    spring,
    isPulling,
    isRefreshing,
    progress: progress.get(),
    triggerRefresh,
  };
}

// ============================================================================
// MOMENTUM SCROLL / FLING
// ============================================================================

export interface MomentumScrollOptions {
  /** Decay factor (0.998 = Apple default) */
  decay?: number;
  /** Minimum position */
  min?: number;
  /** Maximum position */
  max?: number;
  /** Snap points */
  snapPoints?: number[];
  /** Called when settle */
  onSettle?: (finalPosition: number) => void;
}

export interface MomentumScrollReturn {
  /** Scroll position */
  position: ReturnType<typeof useMotionValue>;
  /** Velocity */
  velocity: ReturnType<typeof useVelocity>;
  /** Spring for deceleration */
  spring: ReturnType<typeof useSpring>;
  /** Animate to position with momentum */
  animateTo: (target: number, initialVelocity?: number) => void;
  /** Stop animation */
  stop: () => void;
}

/**
 * Momentum-based scrolling with snap points
 * - Exponential decay (d ≈ 0.998)
 * - Snap points with magnetic attraction
 * - Velocity inheritance from gestures
 */
export function useMomentumScroll(options: MomentumScrollOptions = {}): MomentumScrollReturn {
  const {
    decay = 0.998,
    min = -Infinity,
    max = Infinity,
    snapPoints = [],
    onSettle,
  } = options;

  const position = useMotionValue(0);
  const velocity = useVelocity(position);

  // Use a very gentle spring for momentum decay
  const spring = useSpring(position, {
    type: 'spring',
    stiffness: 100,
    damping: 10,
    mass: 1,
    restSpeed: 0.1,
    restDelta: 0.1,
  });

  const animateTo = useCallback(
    (target: number, initialVelocity = 0) => {
      // Set with initial velocity for momentum
      position.set(target, {
        type: 'spring',
        stiffness: 100,
        damping: 10,
        mass: 1,
        velocity: initialVelocity,
      });
    },
    [position]
  );

  const stop = useCallback(() => {
    position.stop();
  }, [position]);

  // Handle snap points on settle
  useEffect(() => {
    let settled = false;
    const checkSettle = () => {
      const v = velocity.get();
      const pos = position.get();

      if (Math.abs(v) < 10 && !settled) {
        settled = true;

        // Find nearest snap point
        if (snapPoints.length > 0) {
          let nearest = snapPoints[0];
          let minDist = Math.abs(pos - nearest);

          snapPoints.forEach(point => {
            const dist = Math.abs(pos - point);
            if (dist < minDist) {
              minDist = dist;
              nearest = point;
            }
          });

          if (minDist < 50) {
            // Close enough to snap
            position.set(nearest, { type: 'spring', stiffness: 200, damping: 25 });
            onSettle?.(nearest);
          } else {
            onSettle?.(pos);
          }
        } else {
          onSettle?.(pos);
        }
      }
    };

    // Check on each frame
    const unsubscribe = position.on('change', checkSettle);
    return () => {
      unsubscribe();
    };
  }, [position, velocity, snapPoints, onSettle]);

  return {
    position,
    velocity,
    spring,
    animateTo,
    stop,
  };
}

// ============================================================================
// POINTER TRACKING (1:1 Direct Manipulation)
// ============================================================================

export interface PointerTrackingOptions {
  /** Element to track */
  elementRef: React.RefObject<HTMLElement>;
  /** Called on pointer move */
  onMove?: (x: number, y: number) => void;
  /** Called on pointer down */
  onDown?: (x: number, y: number) => void;
  /** Called on pointer up */
  onUp?: (x: number, y: number) => void;
}

export interface PointerTrackingReturn {
  /** Pointer X position */
  x: ReturnType<typeof useMotionValue>;
  /** Pointer Y position */
  y: ReturnType<typeof useMotionValue>;
  /** Whether pointer is down */
  isDown: boolean;
  /** Velocity */
  velocity: { x: ReturnType<typeof useVelocity>; y: ReturnType<typeof useVelocity> };
}

/**
 * Direct pointer tracking for 1:1 manipulation
 * - Tracks pointer with zero latency
 * - Provides velocity for momentum
 * - Works with setPointerCapture
 */
export function usePointerTracking(options: PointerTrackingOptions): PointerTrackingReturn {
  const { elementRef, onMove, onDown, onUp } = options;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const velocityX = useVelocity(x);
  const velocityY = useVelocity(y);
  const [isDown, setIsDown] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handlePointerDown = (e: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      x.set(e.clientX - rect.left);
      y.set(e.clientY - rect.top);
      setIsDown(true);
      onDown?.(e.clientX - rect.left, e.clientY - rect.top);

      // Set pointer capture for smooth tracking
      element.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const rect = element.getBoundingClientRect();
      x.set(e.clientX - rect.left);
      y.set(e.clientY - rect.top);
      onMove?.(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handlePointerUp = (e: PointerEvent) => {
      setIsDown(false);
      onUp?.(e.clientX, e.clientY);
      element.releasePointerCapture(e.pointerId);
    };

    const handlePointerLeave = (e: PointerEvent) => {
      if (isDown) {
        setIsDown(false);
        element.releasePointerCapture(e.pointerId);
      }
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointerleave', handlePointerLeave);
    element.addEventListener('pointercancel', handlePointerLeave);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointerleave', handlePointerLeave);
      element.removeEventListener('pointercancel', handlePointerLeave);
    };
  }, [elementRef, x, y, isDown, onMove, onDown, onUp]);

  return {
    x,
    y,
    isDown,
    velocity: { x: velocityX, y: velocityY },
  };
}

// ============================================================================
// INTERRUPTIBLE ANIMATION HELPERS
// ============================================================================

/**
 * Creates an interruptible animation that can be safely interrupted
 * without visual glitches
 */
export function createInterruptibleAnimation(
  from: number,
  to: number,
  config: keyof typeof springConfigs = 'smooth'
) {
  return {
    from,
    to,
    config: springConfigs[config],
    // Allow interruption by not using keyframes
    type: 'spring' as const,
  };
}

/**
 * Staggered animation for lists/grids
 * Each item animates with a slight delay for organic feel
 */
export function createStaggeredAnimation(
  itemCount: number,
  baseConfig: keyof typeof springConfigs = 'smooth',
  staggerDelay = 0.05
) {
  return Array.from({ length: itemCount }, (_, index) => ({
    ...springConfigs[baseConfig],
    delay: index * staggerDelay,
  }));
}

// ============================================================================
// REDUCED MOTION SUPPORT
// ============================================================================

import { useMediaQuery } from './useAppleSpring';

/**
 * Returns animation config respecting prefers-reduced-motion
 */
export function useRespectReducedMotion(
  normalConfig: keyof typeof springConfigs = 'smooth'
) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  if (prefersReducedMotion) {
    return { duration: 0.01 } as const;
  }

  return springConfigs[normalConfig];
}

/**
 * Wrapper for motion components that respects reduced motion
 */
export function withReducedMotion<T extends object>(
  Component: React.ComponentType<T>,
  normalConfig: keyof typeof springConfigs = 'smooth'
) {
  const WithReducedMotion = (props: T) => {
    const config = useRespectReducedMotion(normalConfig);
    return React.createElement(Component, { ...props, transition: config } as T);
  };
  WithReducedMotion.displayName = `withReducedMotion(${Component.displayName || Component.name || 'Component'})`;
  return WithReducedMotion;
}