/**
 * WorkoutDashboard - Today's workout card with "Start Workout" primary button
 */

import React, { forwardRef, useState } from 'react';
import Card, { CardHeader, CardContent, CardFooter } from '../../ui/Card';
import Button from '../../ui/Button';
import ProgressRing from '../../ui/ProgressRing';
import { spacing, fontSize, fontWeight, colors, borderRadius } from '../../../design/tokens';
import { Workout } from '../../../types';

interface WorkoutDashboardProps {
  /** Today's workout */
  workout: Workout | null;
  /** Callback to start workout */
  onStartWorkout: (workout: Workout) => void;
  /** Callback to generate new workout */
  onGenerateWorkout: () => void;
  /** Callback to view workout history */
  onViewHistory: () => void;
  /** Callback to edit workout */
  onEditWorkout?: (workout: Workout) => void;
  /** Whether workout is in progress */
  isActive?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

const muscleGroupIcons: Record<string, React.ReactNode> = {
  chest: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>,
  back: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M3 21h18"/></svg>,
  shoulders: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13"/><line x1="8" y1="13" x2="16" y2="13"/></svg>,
  biceps: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>,
  triceps: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>,
  legs: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 2v7"/><path d="M7 9h10"/><path d="M9 9v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9"/></svg>,
  abs: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  cardio: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  full_body: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>,
};

const equipmentIcons: Record<string, React.ReactNode> = {
  barbell: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/></svg>,
  dumbbell: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="12" x2="17" y2="12"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>,
  machine: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>,
  cable: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M5 12h14"/></svg>,
  bodyweight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  kettlebell: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 6v6l4 2"/></svg>,
  resistance_band: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>,
};

const WorkoutDashboard = forwardRef<HTMLDivElement, WorkoutDashboardProps>(
  (
    {
      workout,
      onStartWorkout,
      onGenerateWorkout,
      onViewHistory,
      onEditWorkout,
      isActive = false,
      className = '',
      style,
    },
    ref
  ) => {
    const [showGenerateForm, setShowGenerateForm] = useState(false);

    if (!workout) {
      return (
        <Card
          ref={ref}
          variant="elevated"
          padding="lg"
          className={className}
          style={{
            ...style,
            borderRadius: borderRadius.continuousLg,
            textAlign: 'center',
          }}
        >
          <div style={{ padding: spacing[6] }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: spacing[4], color: 'var(--label-tertiary, #3C3C4399)' }}>
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0-4 2 2 0 0 1 0-4 2 2 0 0 0 0-4 2 2 0 0 1 0-4" />
            </svg>
            <h2 style={{ margin: `0 0 ${spacing[2]}px 0`, fontSize: fontSize.title2.size, fontWeight: fontWeight.semibold, lineHeight: fontSize.title2.lineHeight, letterSpacing: fontSize.title2.letterSpacing, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
              No Workout Scheduled
            </h2>
            <p style={{ margin: `0 0 ${spacing[4]}px 0`, fontSize: fontSize.body.size, color: 'var(--label-secondary, #3C3C43)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
              Generate a personalized workout based on your energy level, available time, and goals.
            </p>
            <Button variant="primary" size="lg" fullWidth onClick={() => setShowGenerateForm(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: spacing[2] }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Generate Workout
            </Button>
            <Button variant="tertiary" size="md" fullWidth onClick={onViewHistory} style={{ marginTop: spacing[2] }}>
              View History
            </Button>
          </div>
        </Card>
      );
    }

    const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
    const progress = totalSets > 0 ? completedSets / totalSets : 0;

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
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
        {/* Main Workout Card */}
        <Card variant="elevated" padding="lg" style={{ borderRadius: borderRadius.continuousLg }}>
          <CardHeader
            title={workout.name}
            subtitle={workout.description}
            action={
              <div style={{ display: 'flex', gap: spacing[2] }}>
                {onEditWorkout && (
                  <Button variant="tertiary" size="sm" onClick={() => onEditWorkout?.(workout)}>
                    Edit
                  </Button>
                )}
                {!isActive && (
                  <Button variant="primary" size="sm" onClick={() => onStartWorkout(workout)}>
                    {isActive ? 'Resume' : 'Start Workout'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: spacing[1] }}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </Button>
                )}
              </div>
            }
          />

          <CardContent style={{ gap: spacing[4] }}>
            {/* Progress Overview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4], padding: spacing[3], backgroundColor: 'var(--secondary-system-background, #F2F2F7)', borderRadius: borderRadius.continuousMd }}>
              <ProgressRing
                progress={progress}
                size={64}
                strokeWidth={6}
                color="blue"
                showLabel={true}
                labelFormatter={() => `${Math.round(progress * 100)}%`}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[1] }}>
                  <span style={{ fontSize: fontSize.headline.size, fontWeight: fontWeight.semibold, lineHeight: fontSize.headline.lineHeight, letterSpacing: fontSize.headline.letterSpacing, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                    {completedSets} / {totalSets} sets
                  </span>
                  {isActive && (
                    <span style={{ fontSize: fontSize.caption1.size, fontWeight: fontWeight.medium, color: '#34C759', backgroundColor: '#34C75915', padding: `${spacing[1]}px ${spacing[2]}px`, borderRadius: borderRadius.full, fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                      In Progress
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: spacing[4], fontSize: fontSize.caption1.size, color: 'var(--label-secondary, #3C3C43)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                  <span>{workout.exercises.length} exercises</span>
                  <span>~{formatDuration(workout.duration || workout.exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.restTime || 90), 0), 0))}</span>
                  {workout.caloriesBurned && <span>{workout.caloriesBurned} kcal est.</span>}
                </div>
              </div>
            </div>

            {/* Exercise List Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {workout.exercises.slice(0, 3).map((exercise, index) => (
                <div
                  key={exercise.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[3],
                    padding: spacing[3],
                    backgroundColor: 'var(--secondary-system-background, #F2F2F7)',
                    borderRadius: borderRadius.md,
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: borderRadius.full, backgroundColor: 'var(--system-blue, #007AFF)15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--system-blue, #007AFF)', flexShrink: 0 }}>
                    <span style={{ fontSize: fontSize.headline.size, fontWeight: fontWeight.bold, fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)' }}>
                      {index + 1}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                      <span style={{ fontSize: fontSize.body.size, fontWeight: fontWeight.medium, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                        {exercise.name}
                      </span>
                      {muscleGroupIcons[exercise.muscleGroup]}
                      <span style={{ fontSize: fontSize.caption1.size, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)', textTransform: 'capitalize' }}>
                        {exercise.muscleGroup.replace('_', ' ')}
                      </span>
                      {equipmentIcons[exercise.equipment]}
                    </div>
                    <div style={{ display: 'flex', gap: spacing[3], fontSize: fontSize.caption1.size, color: 'var(--label-secondary, #3C3C43)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                      <span>{exercise.sets.length} sets</span>
                      <span>{exercise.sets[0]?.reps || 0}-{exercise.sets[exercise.sets.length - 1]?.reps || 0} reps</span>
                      {exercise.sets[0]?.weight && <span>{exercise.sets[0].weight}{exercise.sets[0].unit}</span>}
                    </div>
                  </div>
                </div>
              ))}
              {workout.exercises.length > 3 && (
                <button
                  onClick={() => onStartWorkout(workout)}
                  style={{
                    padding: spacing[3],
                    backgroundColor: 'transparent',
                    border: `1px dashed var(--separator-opaque, ${colors.separator.opaque})`,
                    borderRadius: borderRadius.md,
                    color: 'var(--system-blue, #007AFF)',
                    fontSize: fontSize.callout.size,
                    fontWeight: fontWeight.medium,
                    fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  + {workout.exercises.length - 3} more exercises
                </button>
              )}
            </div>
          </CardContent>

          <CardFooter style={{ paddingTop: spacing[3], borderTop: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})` }}>
            <div style={{ display: 'flex', gap: spacing[2] }}>
              <Button variant="secondary" size="md" fullWidth onClick={onGenerateWorkout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: spacing[1] }}>
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Regenerate
              </Button>
              <Button variant="tertiary" size="md" fullWidth onClick={onViewHistory}>
                History
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Generate Form Placeholder */}
        {showGenerateForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: spacing[4] }}>
            <div style={{ backgroundColor: 'var(--system-background, #FFFFFF)', borderRadius: borderRadius.continuousLg, padding: spacing[6], width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
              <h2 style={{ margin: `0 0 ${spacing[4]}px 0`, fontSize: fontSize.title2.size, fontWeight: fontWeight.semibold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)', textAlign: 'center' }}>
                Generate Workout
              </h2>
              <p style={{ margin: `0 0 ${spacing[4]}px 0`, fontSize: fontSize.body.size, color: 'var(--label-secondary, #3C3C43)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)', textAlign: 'center' }}>
                WorkoutGeneratorForm component would go here
              </p>
              <div style={{ display: 'flex', gap: spacing[2] }}>
                <Button variant="primary" fullWidth onClick={() => setShowGenerateForm(false)}>Generate</Button>
                <Button variant="secondary" fullWidth onClick={() => setShowGenerateForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

WorkoutDashboard.displayName = 'WorkoutDashboard';

export default WorkoutDashboard;