/**
 * Apple HIG Compliant Segmented Control Component
 * Native iOS segmented control with smooth animations
 */

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { componentTokens, fontSize, fontWeight, spacing, colors, borderRadius } from '../../design/tokens';

export interface SegmentedControlOption {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Accessibility label */
  'aria-label'?: string;
}

export interface SegmentedControlProps {
  /** Array of options */
  options: SegmentedControlOption[];
  /** Currently selected option ID */
  selectedId: string;
  /** Selection change handler */
  onChange: (id: string) => void;
  /** Control variant */
  variant?: 'standard' | 'glass' | 'bordered';
  /** Full width */
  fullWidth?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Accessibility label */
  'aria-label'?: string;
}

const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      options,
      selectedId,
      onChange,
      variant = 'standard',
      fullWidth = false,
      className = '',
      style,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const token = componentTokens.segmentedControl;

    const selectedIndex = options.findIndex((opt) => opt.id === selectedId);

    const variantStyles: Record<string, React.CSSProperties> = {
      standard: {
        backgroundColor: 'var(--secondary-system-background, #F2F2F7)',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
      },
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: 'none',
      },
      bordered: {
        backgroundColor: 'transparent',
        border: `1px solid var(--separator-opaque, ${colors.separator.opaque})`,
        boxShadow: 'none',
      },
    };

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: token.borderRadius,
      padding: '3px', // Inner padding for the background
      width: fullWidth ? '100%' : 'auto',
      position: 'relative',
      userSelect: 'none',
      ...variantStyles[variant],
      ...style,
    };

    // Calculate selected segment position for sliding indicator
    const segmentWidth = 100 / options.length;
    const indicatorTranslateX = `${selectedIndex * segmentWidth}%`;

    const handleOptionClick = (option: SegmentedControlOption) => {
      if (!option.disabled) {
        onChange(option.id);
      }
    };

    return (
      <div
        ref={ref}
        className={className}
        style={baseStyles}
        role="radiogroup"
        aria-label={ariaLabel}
        {...props}
      >
        {/* Sliding Selected Indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId}
            initial={{ x: indicatorTranslateX, opacity: 0 }}
            animate={{ x: indicatorTranslateX, opacity: 1 }}
            exit={{ x: indicatorTranslateX, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
            style={{
              position: 'absolute',
              top: '3px',
              bottom: '3px',
              left: 0,
              width: `${segmentWidth}%`,
              borderRadius: `calc(${borderRadius.continuous2xl} - 3px)`,
              backgroundColor: variant === 'bordered'
                ? 'var(--system-blue, #007AFF)'
                : 'var(--system-background, #FFFFFF)',
              boxShadow: variant === 'bordered'
                ? 'none'
                : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        </AnimatePresence>

        {/* Options */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={option.id === selectedId}
              aria-disabled={option.disabled}
              aria-label={option['aria-label'] || option.label}
              onClick={() => handleOptionClick(option)}
              disabled={option.disabled}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2], // 8px
                padding: `${spacing[1]}px ${token.itemPadding.split(' ')[1]}`, // 4px 16px
                border: 'none',
                background: 'transparent',
                color: option.id === selectedId
                  ? variant === 'bordered'
                    ? '#FFFFFF'
                    : 'var(--label-primary, #000000)'
                  : 'var(--label-secondary, #3C3C43)',
                fontSize: token.fontSize,
                lineHeight: '21px',
                letterSpacing: fontSize.callout.letterSpacing,
                fontWeight: fontWeight.semibold,
                fontFamily: 'inherit',
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                opacity: option.disabled ? 0.4 : 1,
                whiteSpace: 'nowrap',
                minWidth: 0,
                transition: 'color 150ms cubic-bezier(0.42, 0, 0.58, 1)',
                borderRadius: `calc(${borderRadius.continuous2xl} - 3px)`,
                height: token.height,
              }}
            >
              {option.icon && (
                <span style={{ display: 'flex', flexShrink: 0 }}>
                  {option.icon}
                </span>
              )}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }
);

SegmentedControl.displayName = 'SegmentedControl';

export default SegmentedControl;

/**
 * Segmented Control with Icons (commonly used for view switchers)
 */
export interface SegmentedControlWithIconsProps extends Omit<SegmentedControlProps, 'options'> {
  /** Options with required icons */
  options: Array<SegmentedControlOption & { icon: React.ReactNode }>;
}

export const SegmentedControlWithIcons = forwardRef<HTMLDivElement, SegmentedControlWithIconsProps>(
  ({ options, ...props }, ref) => (
    <SegmentedControl ref={ref} options={options} {...props} />
  )
);

SegmentedControlWithIcons.displayName = 'SegmentedControlWithIcons';

/**
 * Pre-built segmented controls for common use cases
 */
export const ViewSwitcher = ({
  selectedId,
  onChange,
  ...props
}: Omit<SegmentedControlProps, 'options'>) => (
  <SegmentedControl
    options={[
      { id: 'list', label: 'List', icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3" y2="18" />
        </svg>
      )},
      { id: 'grid', label: 'Grid', icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      )},
    ]}
    selectedId={selectedId}
    onChange={onChange}
    {...props}
  />
);

ViewSwitcher.displayName = 'ViewSwitcher';

export const FilterSegmentedControl = ({
  selectedId,
  onChange,
  ...props
}: Omit<SegmentedControlProps, 'options'>) => (
  <SegmentedControl
    options={[
      { id: 'all', label: 'All' },
      { id: 'active', label: 'Active' },
      { id: 'completed', label: 'Completed' },
    ]}
    selectedId={selectedId}
    onChange={onChange}
    {...props}
  />
);

FilterSegmentedControl.displayName = 'FilterSegmentedControl';

export const SortSegmentedControl = ({
  selectedId,
  onChange,
  ...props
}: Omit<SegmentedControlProps, 'options'>) => (
  <SegmentedControl
    options={[
      { id: 'recent', label: 'Recent' },
      { id: 'oldest', label: 'Oldest' },
      { id: 'alphabetical', label: 'A–Z' },
      { id: 'priority', label: 'Priority' },
    ]}
    selectedId={selectedId}
    onChange={onChange}
    {...props}
  />
);

SortSegmentedControl.displayName = 'SortSegmentedControl';