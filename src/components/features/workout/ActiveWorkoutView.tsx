/**
 * ActiveWorkoutView - FULL SCREEN distraction-free mode with:
 * - Large exercise name, set/rep counter (large tap targets)
 * - Auto-starting rest timer (countdown with haptic at 5s, 0s)
 * - Swipe gestures: next/prev exercise, complete set
 * - Progress bar at top showing overall completion
 * - "Finish Workout" confirmation
 */

import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';
import ProgressBar from '../../ui/ProgressBar';
import RestTimer from './RestTimer';
import ExerciseCard from './ExerciseCard';
import { spacing, fontSize, fontWeight, colors, borderRadius, touchTarget } from '../../../design/tokens';
import { Workout } from '../../../types';

interface ActiveWorkoutViewProps {
  /** Current workout */
  workout: Workout;
  /** Callback when workout is completed */
  onComplete: (workout: Workout) => void;
  /** Callback when workout is cancelled */
  onCancel: () => void;
  /** Callback when exercise is changed */
  onExerciseChange?: (exerciseIndex: number) => void;
  /** Callback when set is completed */
  onSetComplete?: (exerciseIndex: number, setIndex: number) => void;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

const ActiveWorkoutView = forwardRef<HTMLDivElement, ActiveWorkoutViewProps>(
  (
    {
      workout,
      onComplete,
      onCancel,
      onExerciseChange,
      onSetComplete,
      className = '',
      style,
    },
    ref
  ) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [showRestTimer, setShowRestTimer] = useState(false);
    const [restTimeRemaining, setRestTimeRemaining] = useState(0);
    const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchStartY, setTouchStartY] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);

    const currentExercise = workout.exercises[currentExerciseIndex];
    const currentSet = currentExercise?.sets[currentSetIndex];
    const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
    const overallProgress = totalSets > 0 ? completedSets / totalSets : 0;

    // Calculate rest time for current set
    const defaultRestTime = currentSet?.restTime || 90;

    // Handle swipe gestures
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
      setIsSwiping(false);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!touchStartX) return;
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        setIsSwiping(true);
      }
    }, [touchStartX]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
      if (!touchStartX || !isSwiping) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const threshold = 50;

      if (deltaX > threshold) {
        // Swipe right - previous exercise
        if (currentExerciseIndex > 0) {
          setCurrentExerciseIndex(prev => prev - 1);
          setCurrentSetIndex(0);
          onExerciseChange?.(currentExerciseIndex - 1);
        }
      } else if (deltaX < -threshold) {
        // Swipe left - next exercise
        if (currentExerciseIndex < workout.exercises.length - 1) {
          setCurrentExerciseIndex(prev => prev + 1);
          setCurrentSetIndex(0);
          onExerciseChange?.(currentExerciseIndex + 1);
        }
      }
      setTouchStartX(0);
      setIsSwiping(false);
    }, [touchStartX, isSwiping, currentExerciseIndex, workout.exercises.length, onExerciseChange]);

    // Complete current set
    const handleCompleteSet = useCallback(() => {
      if (!currentSet || currentSet.completed) return;

      onSetComplete?.(currentExerciseIndex, currentSetIndex);

      // Move to next set or exercise
      if (currentSetIndex < currentExercise.sets.length - 1) {
        setCurrentSetIndex(prev => prev + 1);
      } else if (currentExerciseIndex < workout.exercises.length - 1) {
        // Start rest timer before moving to next exercise
        setRestTimeRemaining(defaultRestTime);
        setShowRestTimer(true);
      } else {
        // Workout complete
        setShowFinishConfirmation(true);
      }
    }, [currentSet, currentSetIndex, currentExercise, currentExerciseIndex, workout.exercises.length, defaultRestTime, onSetComplete]);

    // Handle rest timer completion
    const handleRestComplete = useCallback(() => {
      setShowRestTimer(false);
      if (currentSetIndex < currentExercise.sets.length - 1) {
        setCurrentSetIndex(prev => prev + 1);
      } else if (currentExerciseIndex < workout.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
        onExerciseChange?.(currentExerciseIndex + 1);
      } else {
        setShowFinishConfirmation(true);
      }
    }, [currentSetIndex, currentExercise.sets.length, currentExerciseIndex, workout.exercises.length, onExerciseChange]);

    // Skip rest timer
    const handleSkipRest = useCallback(() => {
      setShowRestTimer(false);
      handleRestComplete();
    }, [handleRestComplete]);

    // Handle finish workout
    const handleFinishWorkout = useCallback(() => {
      const updatedWorkout = {
        ...workout,
        completedAt: new Date(),
        duration: Math.floor((new Date().getTime() - new Date(workout.startedAt).getTime()) / 1000),
      };
      onComplete(updatedWorkout);
    }, [workout, onComplete]);

    // Prevent pull-to-refresh and overscroll on iOS
    useEffect(() => {
      const preventDefault = (e: TouchEvent) => {
        if (e.touches.length > 1 || (e.target as HTMLElement).closest('.scrollable')) return;
        e.preventDefault();
      };
      document.addEventListener('touchmove', preventDefault, { passive: false });
      return () => document.removeEventListener('touchmove', preventDefault);
    }, []);

    return (
      <motion.div
        ref={ref}
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          backgroundColor: 'var(--system-background, #FFFFFF)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          touchAction: 'pan-y',
          ...style,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress Bar at Top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            zIndex: 10,
            backgroundColor: 'transparent',
          }}
        >
          <ProgressBar
            progress={overallProgress}
            height="thin"
            color="blue"
            rounded={false}
            animationDuration={300}
            style={{ height: '4px', borderRadius: 0 }}
          />
        </div>

        {/* Header with workout info */}
        <div
          style={{
            padding: `${spacing[4]}px ${spacing[4]}px ${spacing[2]}px ${spacing[4]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
            backgroundColor: 'var(--system-background, #FFFFFF)',
            zIndex: 5,
          }}
        >
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setShowExitConfirmation(true)}
            aria-label="Exit workout"
            style={{ minWidth: touchTarget.minimum, minHeight: touchTarget.minimum }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.medium, color: 'var(--label-secondary, #3C3C43)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
            </div>
            <div style={{ fontSize: fontSize.body.size, fontWeight: fontWeight.semibold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
              {currentExercise?.name || ''}
            </div>
          </div>

          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setShowFinishConfirmation(true)}
            aria-label="Finish workout"
            style={{ minWidth: touchTarget.minimum, minHeight: touchTarget.minimum, color: 'var(--system-red, #FF3B30)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </div>

        {/* Main Content Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing[4],
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait">
            {/* Exercise View */}
            {!showRestTimer && !showFinishConfirmation && currentExercise && (
              <motion.div
                key="exercise-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ width: '100%', maxWidth: '600px' }}
              >
                <ExerciseCard
                  exercise={currentExercise}
                  currentSetIndex={currentSetIndex}
                  onSetComplete={handleCompleteSet}
                  onSetSkip={() => {
                    if (currentSetIndex < currentExercise.sets.length - 1) {
                      setCurrentSetIndex(prev => prev + 1);
                    } else if (currentExerciseIndex < workout.exercises.length - 1) {
                      setRestTimeRemaining(defaultRestTime);
                      setShowRestTimer(true);
                    } else {
                      setShowFinishConfirmation(true);
                    }
                  }}
                  onPreviousSet={() => {
                    if (currentSetIndex > 0) {
                      setCurrentSetIndex(prev => prev - 1);
                    }
                  }}
                  onNextExercise={() => {
                    if (currentExerciseIndex < workout.exercises.length - 1) {
                      setCurrentExerciseIndex(prev => prev + 1);
                      setCurrentSetIndex(0);
                      onExerciseChange?.(currentExerciseIndex + 1);
                    }
                  }}
                  onPreviousExercise={() => {
                    if (currentExerciseIndex > 0) {
                      setCurrentExerciseIndex(prev => prev - 1);
                      setCurrentSetIndex(0);
                      onExerciseChange?.(currentExerciseIndex - 1);
                    }
                  }}
                />
              </motion.div>
            )}

            {/* Rest Timer View */}
            {showRestTimer && (
              <motion.div
                key="rest-timer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <RestTimer
                  duration={restTimeRemaining}
                  onComplete={handleRestComplete}
                  onSkip={handleSkipRest}
                  exerciseName={currentExercise?.name}
                  nextExerciseName={workout.exercises[currentExerciseIndex + 1]?.name}
                />
              </motion.div>
            )}

            {/* Finish Confirmation */}
            {showFinishConfirmation && (
              <motion.div
                key="finish-confirmation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: spacing[6] }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: borderRadius.full,
                    backgroundColor: '#34C75915',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing[4],
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </motion.div>
                <h2 style={{ margin: `0 0 ${spacing[2]}px 0`, fontSize: fontSize.title2.size, fontWeight: fontWeight.semibold, lineHeight: fontSize.title2.lineHeight, letterSpacing: fontSize.title2.letterSpacing, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                  Workout Complete!
                </h2>
                <p style={{ margin: `0 0 ${spacing[4]}px 0`, fontSize: fontSize.body.size, color: 'var(--label-secondary, #3C3C43)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                  Great job! You completed all {workout.exercises.length} exercises with {totalSets} total sets.
                </p>
                <div style={{ display: 'flex', gap: spacing[3], width: '100%' }}>
                  <Button variant="secondary" size="lg" fullWidth onClick={() => setShowFinishConfirmation(false)}>
                    Continue
                  </Button>
                  <Button variant="primary" size="lg" fullWidth onClick={handleFinishWorkout}>
                    Finish Workout
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: spacing[1] }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Exit Confirmation */}
            {showExitConfirmation && (
              <motion.div
                key="exit-confirmation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: spacing[6] }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: borderRadius.full,
                    backgroundColor: '#FF3B3015',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing[4],
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </motion.div>
                <h2 style={{ margin: `0 0 ${spacing[2]}px 0`, fontSize: fontSize.title2.size, fontWeight: fontWeight.semibold, lineHeight: fontSize.title2.lineHeight, letterSpacing: fontSize.title2.letterSpacing, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                  End Workout?
                </h2>
                <p style={{ margin: `0 0 ${spacing[4]}px 0`, fontSize: fontSize.body.size, color: 'var(--label-secondary, #3C3C43)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                  Your progress will be saved. You can resume this workout later.
                </p>
                <div style={{ display: 'flex', gap: spacing[3], width: '100%' }}>
                  <Button variant="primary" size="lg" fullWidth onClick={() => setShowExitConfirmation(false)}>
                    Continue Workout
                  </Button>
                  <Button variant="destructive" size="lg" fullWidth onClick={onCancel}>
                    End Workout
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Exercise Navigation Dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: spacing[2],
            padding: spacing[3],
            borderTop: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
            backgroundColor: 'var(--system-background, #FFFFFF)',
          }}
        >
          {workout.exercises.map((_, index) => (
            <motion.button
              key={index}
              type="button"
              onClick={() => {
                setCurrentExerciseIndex(index);
                setCurrentSetIndex(0);
                onExerciseChange?.(index);
              }}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: borderRadius.full,
                border: 'none',
                backgroundColor: index === currentExerciseIndex
                  ? 'var(--system-blue, #007AFF)'
                  : 'var(--separator-opaque, #C6C6C8)',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 200ms cubic-bezier(0.42, 0, 0.58, 1)',
              }}
              whileTap={{ scale: 0.8 }}
              aria-label={`Go to exercise ${index + 1}`}
              aria-current={index === currentExerciseIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      </motion.div>
    );
  }
);

ActiveWorkoutView.displayName = 'ActiveWorkoutView';

export default ActiveWorkoutView;