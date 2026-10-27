/**
 * RestTimer - Auto-starting rest timer with countdown
 * Haptic feedback at 5s and 0s, visual pulse animation
 */

import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Button from '../../ui/Button';
import ProgressRing from '../../ui/ProgressRing';
import { spacing, fontSize, fontWeight, borderRadius, touchTarget } from '../../../design/tokens';

export interface RestTimerProps {
  /** Rest duration in seconds */
  duration: number;
  /** Callback when timer completes */
  onComplete: () => void;
  /** Callback when timer is skipped */
  onSkip: () => void;
  /** Current exercise name */
  exerciseName?: string;
  /** Next exercise name */
  nextExerciseName?: string;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

const RestTimer = forwardRef<HTMLDivElement, RestTimerProps>(
  (
    {
      duration,
      onComplete,
      onSkip,
      exerciseName,
      nextExerciseName,
      className = '',
      style,
    },
    ref
  ) => {
    const [timeRemaining, setTimeRemaining] = useState(duration);
    const [isRunning, setIsRunning] = useState(true);
    const intervalRef = useRef<number | null>(null);
    const hasHapticFired = useRef(false);

    // Vibrate on haptic feedback (if supported)
    const vibrate = useCallback((pattern: number | number[]) => {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    }, []);

    // Timer logic
    useEffect(() => {
      setTimeRemaining(duration);
      setIsRunning(true);
      hasHapticFired.current = false;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          const next = prev - 1;

          // Haptic at 5 seconds remaining
          if (next === 5 && !hasHapticFired.current) {
            vibrate([100, 50, 100]);
            hasHapticFired.current = true;
          }

          // Haptic at 0 seconds (completion)
          if (next <= 0) {
            vibrate([200, 100, 200]);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setIsRunning(false);
            onComplete();
            return 0;
          }

          return next;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [duration, onComplete, vibrate]);

    const handleSkip = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsRunning(false);
      onSkip();
    };

    const handlePauseResume = () => {
      if (isRunning) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        intervalRef.current = window.setInterval(() => {
          setTimeRemaining(prev => {
            const next = prev - 1;

            if (next === 5 && !hasHapticFired.current) {
              vibrate([100, 50, 100]);
              hasHapticFired.current = true;
            }

            if (next <= 0) {
              vibrate([200, 100, 200]);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
              setIsRunning(false);
              onComplete();
              return 0;
            }

            return next;
          });
        }, 1000);
      }
      setIsRunning(prev => !prev);
    };

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    };

    const progress = duration > 0 ? 1 - timeRemaining / duration : 1;

    return (
      <motion.div
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing[4],
          width: '100%',
          maxWidth: '400px',
          padding: spacing[6],
          ...style,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Current Exercise Label */}
        {exerciseName && (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.medium, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: spacing[1] }}>
              Resting after
            </div>
            <div style={{ fontSize: fontSize.title2.size, fontWeight: fontWeight.semibold, lineHeight: fontSize.title2.lineHeight, letterSpacing: fontSize.title2.letterSpacing, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
              {exerciseName}
            </div>
          </div>
        )}

        {/* Timer Ring */}
        <div style={{ position: 'relative', width: '240px', height: '240px' }}>
          <ProgressRing
            progress={progress}
            size={240}
            strokeWidth={12}
            color={timeRemaining <= 10 ? 'red' : 'blue'}
            showLabel={false}
            style={{
              filter: timeRemaining <= 10 ? 'drop-shadow(0 0 12px #FF3B3080)' : 'none',
              transition: 'filter 300ms ease',
            }}
          />

          {/* Center Time Display */}
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
            animate={{ scale: timeRemaining <= 5 ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeRemaining <= 5 ? Infinity : 0 }}
          >
            <div
              style={{
                fontSize: '64px',
                fontWeight: fontWeight.bold,
                lineHeight: 1,
                color: timeRemaining <= 10 ? '#FF3B30' : 'var(--label-primary, #000000)',
                fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTime(timeRemaining)}
            </div>
            <div style={{ marginTop: spacing[1], fontSize: fontSize.caption1.size, fontWeight: fontWeight.medium, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isRunning ? 'Rest Time' : 'Paused'}
            </div>
          </motion.div>
        </div>

        {/* Next Exercise Preview */}
        {nextExerciseName && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]}px ${spacing[4]}`,
              backgroundColor: 'var(--system-blue, #007AFF)10',
              borderRadius: borderRadius.full,
              border: '1px solid var(--system-blue, #007AFF)30',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--system-blue, #007AFF)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span style={{ fontSize: fontSize.callout.size, fontWeight: fontWeight.medium, color: 'var(--system-blue, #007AFF)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
              Next: {nextExerciseName}
            </span>
          </motion.div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: spacing[3], width: '100%', marginTop: spacing[2] }}>
          <Button
            variant="tertiary"
            size="lg"
            fullWidth
            onClick={handlePauseResume}
            style={{ minHeight: touchTarget.comfortable }}
            aria-label={isRunning ? 'Pause rest timer' : 'Resume rest timer'}
          >
            {isRunning ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: spacing[1] }}>
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: spacing[1] }}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Resume
              </>
            )}
          </Button>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSkip}
            style={{ minHeight: touchTarget.comfortable }}
            aria-label="Skip rest timer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: spacing[1] }}>
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
              <line x1="22" y1="5" x2="22" y2="19" />
            </svg>
            Skip
          </Button>
        </div>

        {/* Progress Indicator */}
        <div style={{ width: '100%', textAlign: 'center', marginTop: spacing[2] }}>
          <motion.div
            style={{
              height: '4px',
              backgroundColor: 'var(--separator-opaque, #C6C6C8)',
              borderRadius: borderRadius.full,
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
              style={{
                height: '100%',
                backgroundColor: timeRemaining <= 10 ? '#FF3B30' : 'var(--system-blue, #007AFF)',
                borderRadius: borderRadius.full,
                transformOrigin: 'left center',
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

RestTimer.displayName = 'RestTimer';

export default RestTimer;