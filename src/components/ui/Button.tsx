/**
 * Apple HIG Compliant Button Component
 * Pill-shaped with haptic press animation using Framer Motion
 */

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { componentTokens, spacing } from '../../design/tokens';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'onClick'> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'glass';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button content */
  children: React.ReactNode;
  /** Accessibility label */
  'aria-label'?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      onClick,
      className = '',
      style,
      disabled,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const token = componentTokens.button;
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2], // 8px
      height: token.height[size],
      padding: token.padding[size],
      borderRadius: token.borderRadius,
      fontSize: token.fontSize[size],
      fontWeight: token.fontWeight,
      fontFamily: 'inherit',
      lineHeight: 1,
      border: 'none',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
      transition: 'background-color 100ms cubic-bezier(0.42, 0, 0.58, 1), color 100ms cubic-bezier(0.42, 0, 0.58, 1)',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--system-blue, #007AFF)',
        color: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(0, 122, 255, 0.3)',
      },
      secondary: {
        backgroundColor: 'var(--system-gray5, #E5E5EA)',
        color: 'var(--label-primary, #000000)',
        boxShadow: 'none',
      },
      tertiary: {
        backgroundColor: 'transparent',
        color: 'var(--system-blue, #007AFF)',
        boxShadow: 'none',
      },
      destructive: {
        backgroundColor: 'var(--system-red, #FF3B30)',
        color: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(255, 59, 48, 0.3)',
      },
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: 'var(--label-primary, #000000)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      },
    };

    const combinedStyle = {
      ...baseStyles,
      ...variantStyles[variant],
      ...style,
    };

    // Press animation variants
    const pressVariants = {
      initial: { scale: 1 },
      hover: { scale: 0.98 },
      tap: { scale: 0.96 },
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading && onClick) {
        onClick(event);
      }
    };

    return (
      <motion.button
        ref={ref}
        className={className}
        style={combinedStyle}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        whileHover={!disabled && !loading ? 'hover' : undefined}
        whileTap={!disabled && !loading ? 'tap' : undefined}
        variants={pressVariants}
        initial="initial"
        animate="initial"
        {...props}
      >
        {loading ? (
          <motion.span
            className="button-spinner"
            style={{
              width: size === 'sm' ? '14px' : size === 'md' ? '18px' : '22px',
              height: size === 'sm' ? '14px' : size === 'md' ? '18px' : '22px',
              border: '2px solid currentColor',
              borderRightColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
            aria-hidden="true"
          />
        ) : (
          <>
            {leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;