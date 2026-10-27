/**
 * Apple HIG Compliant Card Component
 * Translucent background with blur, continuous corners
 */

import React, { forwardRef, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { componentTokens, shadow, blur, spacing, colors } from '../../design/tokens';

export interface CardProps extends HTMLMotionProps<'div'> {
  /** Card variant */
  variant?: 'default' | 'elevated' | 'glass' | 'outlined' | 'filled';
  /** Card padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Hover/tap elevation */
  interactive?: boolean;
  /** Child content */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      children,
      className = '',
      style,
      onClick,
      ...props
    },
    ref
  ) => {
    const token = componentTokens.card;

    const paddingMap = {
      none: '0',
      sm: spacing[2],  // 8px
      md: token.padding, // 16px
      lg: spacing[6],  // 24px
    };

    const baseStyles: React.CSSProperties = {
      borderRadius: token.borderRadius,
      padding: paddingMap[padding],
      display: 'flex',
      flexDirection: 'column',
      gap: token.gap,
      position: 'relative',
      overflow: 'hidden',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        backgroundColor: 'var(--system-background, #FFFFFF)',
        boxShadow: shadow.level1,
        border: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
      },
      elevated: {
        backgroundColor: 'var(--system-background, #FFFFFF)',
        boxShadow: shadow.level2,
        border: 'none',
      },
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: blur.regular,
        WebkitBackdropFilter: blur.regular,
        boxShadow: shadow.level1,
        border: '1px solid rgba(255, 255, 255, 0.2)',
      },
      outlined: {
        backgroundColor: 'var(--system-background, #FFFFFF)',
        boxShadow: 'none',
        border: `1px solid var(--separator-opaque, ${colors.separator.opaque})`,
      },
      filled: {
        backgroundColor: 'var(--secondary-system-background, #F2F2F7)',
        boxShadow: 'none',
        border: 'none',
      },
    };

    // Interactive hover/tap elevation
    const interactiveVariants = {
      initial: { y: 0, boxShadow: variantStyles[variant].boxShadow },
      hover: { y: -2, boxShadow: shadow.level3 },
      tap: { y: 0, boxShadow: shadow.level1 },
    };

    const combinedStyle = {
      ...baseStyles,
      ...variantStyles[variant],
      ...style,
      cursor: interactive && onClick ? 'pointer' : 'default',
      transition: 'transform 150ms cubic-bezier(0.17, 0.67, 0.5, 1), box-shadow 150ms cubic-bezier(0.42, 0, 0.58, 1)',
    };

    return (
      <motion.div
        ref={ref}
        className={className}
        style={combinedStyle}
        onClick={onClick}
        whileHover={interactive && onClick ? 'hover' : undefined}
        whileTap={interactive && onClick ? 'tap' : undefined}
        variants={interactiveVariants}
        initial="initial"
        animate="initial"
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;

/**
 * Card Header sub-component
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = '', style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing[3],
        ...style,
      }}
      {...props}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: 600,
            lineHeight: '22px',
            letterSpacing: '-0.43px',
            color: 'var(--label-primary, #000000)',
            fontFamily: 'inherit',
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: '20px',
              letterSpacing: '-0.24px',
              color: 'var(--label-secondary, #3C3C43)',
              fontFamily: 'inherit',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Content sub-component
 */
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        flex: 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

/**
 * Card Footer sub-component
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[3],
        paddingTop: spacing[2],
        marginTop: 'auto',
        borderTop: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';