/**
 * Apple HIG Compliant Switch Component
 * iOS-style toggle switch with spring animations
 */

import React, { forwardRef, useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { spacing, fontSize, fontWeight } from '../../design/tokens';

export interface SwitchProps {
  /** Whether the switch is checked */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Switch size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Accessibility label */
  'aria-label'?: string;
  /** Additional props forwarded to the button element */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}

const sizeConfig = {
  sm: { width: 40, height: 24, thumbSize: 18, thumbOffset: 3 },
  md: { width: 51, height: 31, thumbSize: 25, thumbOffset: 3 },
  lg: { width: 64, height: 36, thumbSize: 30, thumbOffset: 3 },
};

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      disabled = false,
      label,
      labelPosition = 'right',
      size = 'md',
      className = '',
      style,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const isControlled = controlledChecked !== undefined;
    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
    const checked = isControlled ? controlledChecked : uncontrolledChecked;

    const config = sizeConfig[size];
    const x = useMotionValue(checked ? config.width - config.thumbSize - config.thumbOffset : config.thumbOffset);
    const springX = useSpring(x, { stiffness: 400, damping: 25, mass: 0.5 });

    // Sync motion value with checked state
    useEffect(() => {
      x.set(checked ? config.width - config.thumbSize - config.thumbOffset : config.thumbOffset);
    }, [checked, config.width, config.thumbSize, config.thumbOffset, x]);

    const handleToggle = () => {
      if (disabled) return;
      const nextChecked = !checked;
      if (!isControlled) {
        setUncontrolledChecked(nextChecked);
      }
      onChange?.(nextChecked);
      x.set(nextChecked ? config.width - config.thumbSize - config.thumbOffset : config.thumbOffset);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleToggle();
      }
    };

    const trackColor = checked ? 'var(--system-green, #34C759)' : 'var(--separator-opaque, #C6C6C8)';
    const thumbColor = disabled ? 'var(--label-tertiary, #3C3C4399)' : '#FFFFFF';

    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: spacing[3],
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          ...style,
        }}
      >
        {label && labelPosition === 'left' && (
          <span
            style={{
              fontSize: fontSize.body.size,
              fontWeight: fontWeight.regular,
              lineHeight: fontSize.body.lineHeight,
              letterSpacing: fontSize.body.letterSpacing,
              color: 'var(--label-primary, #000000)',
              fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
              userSelect: 'none',
            }}
          >
            {label}
          </span>
        )}

        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled}
          aria-label={ariaLabel}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          style={{
            position: 'relative',
            width: config.width,
            height: config.height,
            borderRadius: config.height / 2,
            backgroundColor: trackColor,
            border: 'none',
            padding: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background-color 200ms cubic-bezier(0.42, 0, 0.58, 1)',
          }}
          disabled={disabled}
        >
          <motion.span
            style={{
              position: 'absolute',
              top: config.thumbOffset,
              left: config.thumbOffset,
              width: config.thumbSize,
              height: config.thumbSize,
              borderRadius: config.thumbSize / 2,
              backgroundColor: thumbColor,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
              willChange: 'transform',
              pointerEvents: 'none',
              x: springX,
            }}
          />
        </button>

        {label && labelPosition === 'right' && (
          <span
            style={{
              fontSize: fontSize.body.size,
              fontWeight: fontWeight.regular,
              lineHeight: fontSize.body.lineHeight,
              letterSpacing: fontSize.body.letterSpacing,
              color: 'var(--label-primary, #000000)',
              fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
              userSelect: 'none',
            }}
          >
            {label}
          </span>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;

/**
 * Switch with Description (for settings)
 */
export interface SwitchWithDescriptionProps extends SwitchProps {
  description?: string;
}

export const SwitchWithDescription = forwardRef<HTMLButtonElement, SwitchWithDescriptionProps>(
  ({ description, label, className = '', style, ...props }, ref) => (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: spacing[1], ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {label && (
            <span
              style={{
                fontSize: fontSize.body.size,
                fontWeight: fontWeight.regular,
                lineHeight: fontSize.body.lineHeight,
                letterSpacing: fontSize.body.letterSpacing,
                color: 'var(--label-primary, #000000)',
                fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
              }}
            >
              {label}
            </span>
          )}
          {description && (
            <span
              style={{
                display: 'block',
                marginTop: spacing[1],
                fontSize: fontSize.caption1.size,
                lineHeight: fontSize.caption1.lineHeight,
                letterSpacing: fontSize.caption1.letterSpacing,
                fontWeight: fontWeight.regular,
                color: 'var(--label-secondary, #3C3C43)',
                fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif)',
              }}
            >
              {description}
            </span>
          )}
        </div>
        <Switch ref={ref} {...props} label={undefined} />
      </div>
    </div>
  )
);

SwitchWithDescription.displayName = 'SwitchWithDescription';