/**
 * WorkoutGeneratorForm - Input form for energy level (1-5 segmented), time (picker), notes
 */

import { forwardRef, useState } from 'react';
import Button from '../../ui/Button';
import SegmentedControl from '../../ui/SegmentedControl';
import { spacing, fontSize, fontWeight, borderRadius } from '../../../design/tokens';

export interface WorkoutGeneratorFormData {
  energyLevel: number; // 1-5
  timeAvailable: number; // minutes
  notes: string;
  focusAreas: string[];
  equipment: string[];
}

export interface WorkoutGeneratorFormProps {
  /** Callback when form is submitted */
  onGenerate: (data: WorkoutGeneratorFormData) => void;
  /** Initial form data */
  initialData?: Partial<WorkoutGeneratorFormData>;
  /** Is generating */
  isGenerating?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

const energyLevelOptions = [
  { id: '1', label: '1', description: 'Exhausted' },
  { id: '2', label: '2', description: 'Low' },
  { id: '3', label: '3', description: 'Moderate' },
  { id: '4', label: '4', description: 'High' },
  { id: '5', label: '5', description: 'Peak' },
];

const timeOptions = [
  { value: 15, label: '15 min', description: 'Quick session' },
  { value: 20, label: '20 min', description: 'Express' },
  { value: 30, label: '30 min', description: 'Standard' },
  { value: 45, label: '45 min', description: 'Full workout' },
  { value: 60, label: '60 min', description: 'Extended' },
  { value: 90, label: '90 min', description: 'Marathon' },
];

const focusAreaOptions = [
  { id: 'upper', label: 'Upper Body', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg> },
  { id: 'lower', label: 'Lower Body', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 2v7"/><path d="M7 9h10"/><path d="M9 9v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9"/></svg> },
  { id: 'push', label: 'Push', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg> },
  { id: 'pull', label: 'Pull', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M3 21h18"/></svg> },
  { id: 'core', label: 'Core', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> },
  { id: 'cardio', label: 'Cardio', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  { id: 'full', label: 'Full Body', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg> },
];

const equipmentOptions = [
  { id: 'bodyweight', label: 'Bodyweight', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: 'dumbbell', label: 'Dumbbells', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="12" x2="17" y2="12"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg> },
  { id: 'barbell', label: 'Barbell', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/></svg> },
  { id: 'machine', label: 'Machines', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg> },
  { id: 'cable', label: 'Cables', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M5 12h14"/></svg> },
  { id: 'kettlebell', label: 'Kettlebells', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 6v6l4 2"/></svg> },
  { id: 'bands', label: 'Resistance Bands', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg> },
];

const WorkoutGeneratorForm = forwardRef<HTMLFormElement, WorkoutGeneratorFormProps>(
  (
    {
      onGenerate,
      initialData = {},
      isGenerating = false,
      className = '',
      style,
    },
    ref
  ) => {
    const [energyLevel, setEnergyLevel] = useState(initialData.energyLevel || 3);
    const [timeAvailable, setTimeAvailable] = useState(initialData.timeAvailable || 30);
    const [notes, setNotes] = useState(initialData.notes || '');
    const [focusAreas, setFocusAreas] = useState<string[]>(initialData.focusAreas || ['full']);
    const [equipment, setEquipment] = useState<string[]>(initialData.equipment || ['bodyweight', 'dumbbell']);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onGenerate({
        energyLevel,
        timeAvailable,
        notes,
        focusAreas,
        equipment,
      });
    };

    const toggleFocusArea = (area: string) => {
      setFocusAreas(prev => prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
      );
    };

    const toggleEquipment = (eq: string) => {
      setEquipment(prev => prev.includes(eq)
        ? prev.filter(e => e !== eq)
        : [...prev, eq]
      );
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[4],
          ...style,
        }}
      >
        {/* Energy Level */}
        <div>
          <label style={{ display: 'block', marginBottom: spacing[2], fontSize: fontSize.subhead.size, fontWeight: fontWeight.semibold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
            Energy Level
          </label>
          <p style={{ margin: `0 0 ${spacing[2]}px 0`, fontSize: fontSize.caption1.size, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
            How do you feel right now?
          </p>
          <SegmentedControl
            options={energyLevelOptions.map((opt) => ({
              id: opt.id,
              label: opt.label,
              'aria-label': `${opt.label} - ${opt.description}`,
            }))}
            selectedId={String(energyLevel)}
            onChange={(id) => setEnergyLevel(parseInt(id))}
            fullWidth
            variant="standard"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing[2], fontSize: fontSize.caption2.size, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
            <span>Exhausted</span>
            <span>Peak</span>
          </div>
        </div>

        {/* Time Available */}
        <div>
          <label style={{ display: 'block', marginBottom: spacing[2], fontSize: fontSize.subhead.size, fontWeight: fontWeight.semibold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
            Time Available
          </label>
          <p style={{ margin: `0 0 ${spacing[2]}px 0`, fontSize: fontSize.caption1.size, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
            How much time can you spend?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
            {timeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeAvailable(opt.value)}
                style={{
                  flex: '1 1 calc(50% - 6px)',
                  minWidth: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacing[1],
                  padding: `${spacing[3]}px ${spacing[2]}px`,
                  borderRadius: borderRadius.md,
                  border: `2px solid ${timeAvailable === opt.value ? 'var(--system-blue, #007AFF)' : 'var(--separator-opaque, #C6C6C8)'}`,
                  backgroundColor: timeAvailable === opt.value ? 'var(--system-blue, #007AFF)10' : 'var(--system-background, #FFFFFF)',
                  cursor: 'pointer',
                  transition: 'all 150ms cubic-bezier(0.42, 0, 0.58, 1)',
                }}
              >
                <span style={{ fontSize: fontSize.headline.size, fontWeight: fontWeight.semibold, color: timeAvailable === opt.value ? 'var(--system-blue, #007AFF)' : 'var(--label-primary, #000000)', fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)' }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: fontSize.caption2.size, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <label style={{ display: 'block', marginBottom: spacing[2], fontSize: fontSize.subhead.size, fontWeight: fontWeight.semibold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
            Focus Areas
          </label>
          <p style={{ margin: `0 0 ${spacing[2]}px 0`, fontSize: fontSize.caption1.size, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
            What do you want to target? (Select multiple)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
            {focusAreaOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleFocusArea(opt.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[2]}px ${spacing[3]}px`,
                  borderRadius: borderRadius.full,
                  border: `2px solid ${focusAreas.includes(opt.id) ? 'var(--system-blue, #007AFF)' : 'var(--separator-opaque, #C6C6C8)'}`,
                  backgroundColor: focusAreas.includes(opt.id) ? 'var(--system-blue, #007AFF)10' : 'var(--system-background, #FFFFFF)',
                  cursor: 'pointer',
                  transition: 'all 150ms cubic-bezier(0.42, 0, 0.58, 1)',
                }}
              >
                <span style={{ color: focusAreas.includes(opt.id) ? 'var(--system-blue, #007AFF)' : 'var(--label-secondary, #3C3C43)' }}>
                  {opt.icon}
                </span>
                <span style={{ fontSize: fontSize.callout.size, fontWeight: fontWeight.medium, color: focusAreas.includes(opt.id) ? 'var(--system-blue, #007AFF)' : 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <label style={{ display: 'block', marginBottom: spacing[2], fontSize: fontSize.subhead.size, fontWeight: fontWeight.semibold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
            Available Equipment
          </label>
          <p style={{ margin: `0 0 ${spacing[2]}px 0`, fontSize: fontSize.caption1.size, color: 'var(--label-tertiary, #3C3C4399)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
            What equipment do you have access to? (Select multiple)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
            {equipmentOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleEquipment(opt.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[2]}px ${spacing[3]}px`,
                  borderRadius: borderRadius.full,
                  border: `2px solid ${equipment.includes(opt.id) ? 'var(--system-green, #34C759)' : 'var(--separator-opaque, #C6C6C8)'}`,
                  backgroundColor: equipment.includes(opt.id) ? 'var(--system-green, #34C759)10' : 'var(--system-background, #FFFFFF)',
                  cursor: 'pointer',
                  transition: 'all 150ms cubic-bezier(0.42, 0, 0.58, 1)',
                }}
              >
                <span style={{ color: equipment.includes(opt.id) ? 'var(--system-green, #34C759)' : 'var(--label-secondary, #3C3C43)' }}>
                  {opt.icon}
                </span>
                <span style={{ fontSize: fontSize.callout.size, fontWeight: fontWeight.medium, color: equipment.includes(opt.id) ? 'var(--system-green, #34C759)' : 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: 'block', marginBottom: spacing[2], fontSize: fontSize.subhead.size, fontWeight: fontWeight.semibold, color: 'var(--label-primary, #000000)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any injuries, preferences, or specific goals?"
            rows={3}
            style={{
              width: '100%',
              padding: spacing[3],
              borderRadius: borderRadius.md,
              border: `1px solid var(--separator-opaque, #C6C6C8)`,
              backgroundColor: 'var(--system-background, #FFFFFF)',
              fontSize: fontSize.body.size,
              fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
              color: 'var(--label-primary, #000000)',
              lineHeight: fontSize.body.lineHeight,
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 150ms cubic-bezier(0.42, 0, 0.58, 1), box-shadow 150ms cubic-bezier(0.42, 0, 0.58, 1)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', gap: spacing[2], marginTop: spacing[2] }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isGenerating}
            disabled={isGenerating || focusAreas.length === 0 || equipment.length === 0}
          >
            {isGenerating ? 'Generating...' : 'Generate Workout'}
            {!isGenerating && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: spacing[1] }}>
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6v6l4 2" />
              </svg>
            )}
          </Button>
        </div>

        {/* Validation hints */}
        {(focusAreas.length === 0 || equipment.length === 0) && (
          <p style={{ margin: 0, fontSize: fontSize.caption1.size, color: 'var(--system-red, #FF3B30)', fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)' }}>
            {focusAreas.length === 0 && 'Please select at least one focus area. '}
            {equipment.length === 0 && 'Please select at least one equipment option.'}
          </p>
        )}
      </form>
    );
  }
);

WorkoutGeneratorForm.displayName = 'WorkoutGeneratorForm';

export default WorkoutGeneratorForm;