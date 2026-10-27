/**
 * ExerciseCard - Individual exercise display with sets/reps
 * Large tap targets for active workout mode
 */

import React, { forwardRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';
import ProgressRing from '../../ui/ProgressRing';
import { spacing, fontSize, fontWeight, colors, borderRadius, touchTarget } from '../../../design/tokens';
import { Exercise } from '../../../types';

interface ExerciseCardProps {
  /** Exercise to display */
  exercise: Exercise;
  /** Current set index */
  currentSetIndex: number;
  /** Callback when set is completed */
  onSetComplete: () => void;
  /** Callback when set is skipped */
  onSetSkip?: () => void;
  /** Callback for previous set */
  onPreviousSet?: () => void;
  /** Callback for next exercise */
  onNextExercise?: () => void;
  /** Callback for previous exercise */
  onPreviousExercise?: () => void;
  /** Show navigation buttons */
  showNavigation?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

const muscleGroupIcons: Record<string, React.ReactNode> = {
  chest: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>,
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M3 21h18"/></svg>,
  shoulders: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13"/><line x1="8" y1="13" x2="16" y2="13"/></svg>,
  biceps: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>,
  triceps: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>,
  legs: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 2v7"/><path d="M7 9h10"/><path d="M9 9v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9"/></svg>,
  abs: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  cardio: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  full_body: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>,
};

const equipmentIcons: Record<string, React.ReactNode> = {
  barbell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/></svg>,
  dumbbell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="12" x2="17" y2="12"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>,
  machine: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>,
  cable: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M5 12h14"/></svg>,
  bodyweight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  kettlebell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 6v6l4 2"/></svg>,
  resistance_band: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>,
};

const ExerciseCard = forwardRef<HTMLDivElement, ExerciseCardProps>(
  (
    {
      exercise,
      currentSetIndex,
      onSetComplete,
      onNextExercise,
      onPreviousExercise,
      showNavigation = true,
      className = '',
      style,
    },
    ref
  ) => {
    const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());

    // Update completed sets from exercise data
    useEffect(() => {
      const completed = new Set<number>();
      exercise.sets.forEach((set, index) => {
        if (set.completed) completed.add(index);
      });
      setCompletedSets(completed);
    }, [exercise.sets]);

    const handleSetComplete = (setIndex: number) => {
      setCompletedSets(prev => {
        const next = new Set(prev);
        next.add(setIndex);
        return next;
      });
      onSetComplete();
    };

    const getSetColor = (index: number) => {
      if (completedSets.has(index)) return '#34C759'; // Green - completed
      if (index === currentSetIndex) return '#007AFF'; // Blue - current
      if (index < currentSetIndex) return '#FF9F0A'; // Orange - skipped/missed
      return 'var(--separator-opaque, #C6C6C8)'; // Gray - upcoming
    };

    const formatWeight = (weight: number, unit: string) => {
      return `${weight} ${unit}`;
    };

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
        {/* Exercise Header */}
        <div style={{ textAlign: 'center', padding: `${spacing[2]}px 0` }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2], padding: `${spacing[2]}px ${spacing[3]}px`, borderRadius: borderRadius.full, backgroundColor: 'var(--system-blue, #007AFF)10' }}>
            {muscleGroupIcons[exercise.muscleGroup]}
            <span style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.semibold, color: 'var(--system-blue, #007AFF)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {exercise.muscleGroup.replace('_', ' ')}
            </span>
            {equipmentIcons[exercise.equipment]}
          </div>

          <h1 style={{ margin: `0 0 ${spacing[2]}px 0`, fontSize: '32px', fontWeight: fontWeight.bold, lineHeight: '38px', letterSpacing: '-0.5px', color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)' }}>
            {exercise.name}
          </h1>

          {exercise.notes && (
            <p style={{ margin: 0, fontSize: fontSize.callout.size, color: 'var(--label-secondary, #3C3C43)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)', fontStyle: 'italic' }}>
              {exercise.notes}
            </p>
          )}
        </div>

        {/* Set Progress Ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: spacing[2] }}>
          <ProgressRing
            progress={exercise.sets.length > 0 ? completedSets.size / exercise.sets.length : 0}
            size={80}
            strokeWidth={8}
            color="blue"
            showLabel={true}
            labelFormatter={() => `${completedSets.size}/${exercise.sets.length}`}
          />
        </div>

        {/* Set Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: spacing[2], marginBottom: spacing[4], flexWrap: 'wrap' }}>
          {exercise.sets.map((set, index) => (
            <motion.button
              key={set.id}
              type="button"
              onClick={() => {
                if (index === currentSetIndex) {
                  handleSetComplete(index);
                }
              }}
              disabled={completedSets.has(index)}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: borderRadius.full,
                border: `2px solid ${getSetColor(index)}`,
                backgroundColor: completedSets.has(index) ? getSetColor(index) : 'transparent',
                cursor: completedSets.has(index) ? 'not-allowed' : 'pointer',
                padding: 0,
                minWidth: '12px',
                minHeight: '12px',
              }}
              aria-label={`Set ${index + 1} ${completedSets.has(index) ? 'completed' : index === currentSetIndex ? 'current' : 'upcoming'}`}
              aria-current={index === currentSetIndex ? 'true' : 'false'}
            />
          ))}
        </div>

        {/* Current Set Details - Large Tap Targets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {exercise.sets.map((set, index) => {
            const isCurrent = index === currentSetIndex;
            const isCompleted = completedSets.has(index);

            // Only show current, next, and completed sets
            if (index > currentSetIndex + 1 && !isCompleted) return null;

            return (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[4],
                  padding: spacing[4],
                  borderRadius: borderRadius.continuousMd,
                  backgroundColor: isCurrent
                    ? 'var(--system-blue, #007AFF)10'
                    : isCompleted
                      ? '#34C75910'
                      : 'var(--secondary-system-background, #F2F2F7)',
                  border: `2px solid ${isCurrent ? 'var(--system-blue, #007AFF)' : isCompleted ? '#34C759' : 'transparent'}`,
                  boxShadow: isCurrent ? '0 0 0 4px var(--system-blue, #007AFF)20' : 'none',
                  minHeight: touchTarget.comfortable,
                }}
              >
                {/* Set Number */}
                <div style={{ flexShrink: 0, width: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.medium, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    SET {index + 1}
                  </div>
                  <AnimatePresence mode="wait">
                    {isCompleted && (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        style={{
                          marginTop: spacing[1],
                          display: 'flex',
                          justifyContent: 'center',
                          color: '#34C759',
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                    )}
                    {isCurrent && !isCompleted && (
                      <motion.div
                        key="current"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{
                          marginTop: spacing[1],
                          fontSize: fontSize.caption1.size,
                          fontWeight: fontWeight.semibold,
                          color: 'var(--system-blue, #007AFF)',
                          fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                        }}
                      >
                        CURRENT
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Reps & Weight - Large Tap Targets */}
                <div style={{ flex: 1, display: 'flex', gap: spacing[4], alignItems: 'center' }}>
                  {/* Reps */}
                  <Button
                    variant={isCompleted ? 'secondary' : isCurrent ? 'primary' : 'tertiary'}
                    size="lg"
                    onClick={() => !isCompleted && isCurrent && handleSetComplete(index)}
                    disabled={isCompleted}
                    style={{
                      flex: 1,
                      minHeight: touchTarget.spacious,
                      fontSize: fontSize.title2.size,
                      fontWeight: fontWeight.bold,
                    }}
                    aria-label={isCompleted ? `Set ${index + 1} completed, ${set.reps} reps` : `Set ${index + 1}, ${set.reps} reps`}
                  >
                    <span style={{ fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)' }}>
                      {set.reps}
                    </span>
                    <span style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.regular, opacity: 0.7, marginLeft: spacing[1] }}>
                      reps
                    </span>
                  </Button>

                  {/* Weight */}
                  <Button
                    variant={isCompleted ? 'secondary' : isCurrent ? 'primary' : 'tertiary'}
                    size="lg"
                    onClick={() => {}}
                    disabled
                    style={{
                      flex: 1,
                      minHeight: touchTarget.spacious,
                      fontSize: fontSize.title2.size,
                      fontWeight: fontWeight.bold,
                    }}
                    aria-label={set.weight ? `Weight: ${formatWeight(set.weight, set.unit)}` : 'Bodyweight'}
                  >
                    <span style={{ fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)' }}>
                      {set.weight ? formatWeight(set.weight, set.unit) : 'BW'}
                    </span>
                  </Button>
                </div>

                {/* Rest Time (if applicable) */}
                {set.restTime && set.restTime > 0 && (
                  <div style={{ flexShrink: 0, width: '70px', textAlign: 'center', color: 'var(--label-tertiary, #3C3C4399)' }}>
                    <div style={{ fontSize: fontSize.caption2.size, fontWeight: fontWeight.medium, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: spacing[1], fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                      Rest
                    </div>
                    <div style={{ fontSize: fontSize.callout.size, fontWeight: fontWeight.semibold, fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)' }}>
                      {set.restTime}s
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        {showNavigation && (
          <div style={{ display: 'flex', gap: spacing[3], marginTop: spacing[2], paddingTop: spacing[3], borderTop: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})` }}>
            <Button
              variant="tertiary"
              size="lg"
              fullWidth
              onClick={onPreviousExercise}
              disabled={!onPreviousExercise}
              style={{ minHeight: touchTarget.comfortable }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: spacing[1] }}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Previous
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onNextExercise}
              disabled={!onNextExercise}
              style={{ minHeight: touchTarget.comfortable }}
            >
              Next
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: spacing[1] }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    );
  }
);

ExerciseCard.displayName = 'ExerciseCard';

export default ExerciseCard;