/**
 * Apple HIG Compliant Bottom Sheet Component
 * Draggable with snap points, backdrop blur, and spring animations
 */

import React, { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import { componentTokens, spacing, colors, borderRadius, blur, shadow, fontSize, fontWeight } from '../../design/tokens';

export interface BottomSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Snap points (as fractions of screen height or pixels) */
  snapPoints?: Array<number | string>;
  /** Default snap point index */
  defaultSnapIndex?: number;
  /** Enable drag to dismiss */
  dismissible?: boolean;
  /** Show drag handle */
  showHandle?: boolean;
  /** Custom handle content */
  handleContent?: React.ReactNode;
  /** Backdrop click to close */
  closeOnBackdropClick?: boolean;
  /** Prevent closing on escape key */
  preventCloseOnEscape?: boolean;
  /** Max height (fraction of screen or pixels) */
  maxHeight?: number | string;
  /** Min height */
  minHeight?: number | string;
  /** Sheet variant */
  variant?: 'standard' | 'glass' | 'card';
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Content className */
  contentClassName?: string;
  /** Content style */
  contentStyle?: React.CSSProperties;
  /** Callback when snap point changes */
  onSnapChange?: (index: number, height: number) => void;
  /** Accessibility label */
  'aria-label'?: string;
  /** Accessibility describedby */
  'aria-describedby'?: string;
}

const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(
  (
    {
      isOpen,
      onClose,
      children,
      snapPoints = ['25%', '50%', '90%'],
      defaultSnapIndex = 1,
      dismissible = true,
      showHandle = true,
      handleContent,
      closeOnBackdropClick = true,
      preventCloseOnEscape = false,
      maxHeight = '90%',
      minHeight = '25%',
      variant = 'standard',
      className = '',
      style,
      contentClassName = '',
      contentStyle,
      onSnapChange,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const contentRef = useRef<HTMLDivElement>(null);

    // Motion values for drag
    const dragY = useMotionValue(0);

    // Parse snap points to pixel values
    const resolvedSnapPoints = useMemo(() => {
      return snapPoints.map((point) => {
        if (typeof point === 'string' && point.endsWith('%')) {
          const percent = parseFloat(point) / 100;
          return window.innerHeight * percent;
        }
        return typeof point === 'string' ? parseFloat(point) : point;
      });
    }, [snapPoints]);

    // Clamp drag Y to valid range
    const maxHeightPx = typeof maxHeight === 'string' && maxHeight.endsWith('%')
      ? window.innerHeight * (parseFloat(maxHeight) / 100)
      : typeof maxHeight === 'string'
        ? parseFloat(maxHeight)
        : maxHeight;

    const minHeightPx = typeof minHeight === 'string' && minHeight.endsWith('%')
      ? window.innerHeight * (parseFloat(minHeight) / 100)
      : typeof minHeight === 'string'
        ? parseFloat(minHeight)
        : minHeight;

    // Find nearest snap point
    const findNearestSnapPoint = useCallback((y: number) => {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      resolvedSnapPoints.forEach((point, index) => {
        const distance = Math.abs(y - point);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return { index: nearestIndex, point: resolvedSnapPoints[nearestIndex] };
    }, [resolvedSnapPoints]);

    // Handle drag end
    const handleDragEnd = useCallback((_event: any, info: { velocity: { y: number } }) => {
      const velocity = info.velocity.y;
      const currentY = dragY.get();
      const { index, point } = findNearestSnapPoint(currentY);

      // If dragging down with high velocity and at bottom snap, dismiss
      if (dismissible && velocity > 1000 && index === resolvedSnapPoints.length - 1) {
        onClose();
        return;
      }

      // Snap to nearest point
      dragY.set(point);
      onSnapChange?.(index, point);
    }, [dragY, dismissible, findNearestSnapPoint, onClose, onSnapChange, resolvedSnapPoints]);

    // Drag constraints
    const dragConstraints = useMemo(() => ({
      top: minHeightPx,
      bottom: maxHeightPx,
    }), [minHeightPx, maxHeightPx]);

    // Keyboard handling
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && !preventCloseOnEscape) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }, [isOpen, onClose, preventCloseOnEscape]);

    // Sync initial snap point
    useEffect(() => {
      if (isOpen) {
        const initialPoint = resolvedSnapPoints[defaultSnapIndex];
        dragY.set(initialPoint);
      }
    }, [isOpen, defaultSnapIndex, resolvedSnapPoints, dragY]);

    if (!isOpen) return null;

    const variantStyles: Record<string, React.CSSProperties> = {
      standard: {
        backgroundColor: 'var(--system-background, #FFFFFF)',
      },
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: blur.thick,
        WebkitBackdropFilter: blur.thick,
      },
      card: {
        backgroundColor: 'var(--system-background, #FFFFFF)',
        boxShadow: shadow.level4,
      },
    };

    const handleStyle: React.CSSProperties = {
      width: componentTokens.bottomSheet.handleSize.split(' x ')[0],
      height: componentTokens.bottomSheet.handleSize.split(' x ')[1],
      borderRadius: componentTokens.bottomSheet.handleBorderRadius,
      backgroundColor: 'var(--label-tertiary, #3C3C4399)',
      margin: `${spacing[3]}px auto ${spacing[2]}px`,
      cursor: 'grab',
      transition: 'background-color 150ms ease',
    };

    const contentStyles: React.CSSProperties = {
      position: 'relative',
      borderRadius: `${borderRadius.continuous2xl} ${borderRadius.continuous2xl} 0 0`,
      overflow: 'hidden',
      minHeight: minHeightPx,
      maxHeight: maxHeightPx,
      ...variantStyles[variant],
      ...contentStyle,
    };

    const backdropStyles: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: componentTokens.bottomSheet.backdropBlur,
      WebkitBackdropFilter: componentTokens.bottomSheet.backdropBlur,
      zIndex: 400,
      opacity: 0,
    };

    return (
      <AnimatePresence>
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, easing: 'easeOut' }}
          style={backdropStyles}
          onClick={closeOnBackdropClick ? onClose : undefined}
          aria-hidden="true"
        />

        <motion.div
          ref={ref}
          key="sheet"
          initial={{ y: window.innerHeight }}
          animate={{ y: 0 }}
          exit={{ y: window.innerHeight }}
          transition={{ type: 'spring', stiffness: 250, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 500,
            ...style,
          }}
          className={className}
          {...props}
        >
          <motion.div
            ref={contentRef}
            style={contentStyles}
            className={contentClassName}
            drag="y"
            dragConstraints={dragConstraints}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            {showHandle && (
              <motion.div
                style={handleStyle}
                whileHover={{ backgroundColor: 'var(--label-secondary, #3C3C43)' }}
                whileTap={{ backgroundColor: 'var(--label-primary, #000000)', scale: 0.95 }}
                aria-hidden="true"
              >
                {handleContent}
              </motion.div>
            )}

            <div
              style={{
                padding: `${spacing[4]}px ${spacing[4]}px ${spacing[6]}px`,
                maxHeight: `calc(${maxHeightPx}px - ${componentTokens.bottomSheet.handleSize.split(' x ')[1]} - ${spacing[3]}px - ${spacing[2]}px - ${spacing[4]}px - ${spacing[6]}px)`,
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;

/**
 * Bottom Sheet Hook for programmatic control
 */
export interface UseBottomSheetReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  snapTo: (index: number) => void;
  currentSnapIndex: number;
}

export const useBottomSheet = (initialOpen = false): UseBottomSheetReturn => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const snapTo = useCallback((index: number) => setCurrentSnapIndex(index), []);

  return { isOpen, open, close, toggle, snapTo, currentSnapIndex };
};

/**
 * Action Sheet (iOS-style action menu)
 */
export interface ActionSheetProps extends Omit<BottomSheetProps, 'snapPoints' | 'defaultSnapIndex' | 'showHandle'> {
  /** Action buttons */
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'cancel';
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  /** Title */
  title?: string;
  /** Subtitle/message */
  message?: string;
}

export const ActionSheet = ({
  isOpen,
  onClose,
  actions,
  title,
  message,
  variant = 'standard',
  className = '',
  style,
  contentClassName = '',
  contentStyle,
  ...props
}: ActionSheetProps) => {
  const handleActionClick = (action: ActionSheetProps['actions'][0]) => {
    if (!action.disabled) {
      action.onClick();
      onClose();
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={['auto']}
      showHandle={true}
      variant={variant}
      className={className}
      style={style}
      contentClassName={contentClassName}
      contentStyle={contentStyle}
      {...props}
    >
      {(title || message) && (
        <div
          style={{
            textAlign: 'center',
            paddingBottom: spacing[4],
            borderBottom: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
            marginBottom: spacing[4],
          }}
        >
          {title && (
            <h2
              style={{
                margin: 0,
                fontSize: fontSize.title3.size,
                lineHeight: fontSize.title3.lineHeight,
                letterSpacing: fontSize.title3.letterSpacing,
                fontWeight: fontWeight.semibold,
                color: 'var(--label-primary, #000000)',
                fontFamily: 'inherit',
              }}
            >
              {title}
            </h2>
          )}
          {message && (
            <p
              style={{
                margin: `${spacing[2]}px 0 0 0`,
                fontSize: fontSize.body.size,
                lineHeight: fontSize.body.lineHeight,
                letterSpacing: fontSize.body.letterSpacing,
                fontWeight: fontWeight.regular,
                color: 'var(--label-secondary, #3C3C43)',
                fontFamily: 'inherit',
              }}
            >
              {message}
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
        {actions.map((action, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[3],
              padding: `${spacing[3]}px ${spacing[4]}px`,
              border: 'none',
              borderRadius: borderRadius.lg,
              backgroundColor: action.variant === 'destructive'
                ? 'var(--system-red, #FF3B30)'
                : action.variant === 'cancel'
                  ? 'var(--secondary-system-background, #F2F2F7)'
                  : 'transparent',
              color: action.variant === 'destructive'
                ? '#FFFFFF'
                : action.variant === 'cancel'
                  ? 'var(--label-primary, #000000)'
                  : 'var(--system-blue, #007AFF)',
              fontSize: fontSize.body.size,
              lineHeight: fontSize.body.lineHeight,
              letterSpacing: fontSize.body.letterSpacing,
              fontWeight: action.variant === 'cancel' ? fontWeight.semibold : fontWeight.regular,
              fontFamily: 'inherit',
              cursor: action.disabled ? 'not-allowed' : 'pointer',
              opacity: action.disabled ? 0.4 : 1,
              transition: 'background-color 150ms ease, color 150ms ease',
              width: '100%',
            }}
          >
            {action.icon && <span style={{ display: 'flex' }}>{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
};

ActionSheet.displayName = 'ActionSheet';

/**
 * Share Sheet (iOS-style share menu)
 */
export interface ShareSheetProps extends Omit<BottomSheetProps, 'snapPoints' | 'defaultSnapIndex' | 'showHandle'> {
  /** Share items */
  items: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }>;
  /** Title */
  title?: string;
  /** Cancel button label */
  cancelLabel?: string;
}

export const ShareSheet = ({
  isOpen,
  onClose,
  items,
  title,
  cancelLabel = 'Cancel',
  variant = 'standard',
  className = '',
  style,
  contentClassName = '',
  contentStyle,
  ...props
}: ShareSheetProps) => {
  const handleItemClick = (item: ShareSheetProps['items'][0]) => {
    item.onClick();
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={['50%', '90%']}
      defaultSnapIndex={0}
      showHandle={true}
      variant={variant}
      className={className}
      style={style}
      contentClassName={contentClassName}
      contentStyle={contentStyle}
      {...props}
    >
      {title && (
        <div
          style={{
            textAlign: 'center',
            paddingBottom: spacing[4],
            borderBottom: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
            marginBottom: spacing[4],
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: fontSize.title3.size,
              lineHeight: fontSize.title3.lineHeight,
              letterSpacing: fontSize.title3.letterSpacing,
              fontWeight: fontWeight.semibold,
              color: 'var(--label-primary, #000000)',
              fontFamily: 'inherit',
            }}
          >
            {title}
          </h2>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: spacing[3],
          paddingBottom: spacing[2],
        }}
      >
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleItemClick(item)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[3]}px ${spacing[2]}px`,
              border: 'none',
              borderRadius: borderRadius.lg,
              backgroundColor: 'transparent',
              color: 'var(--label-primary, #000000)',
              fontSize: fontSize.caption1.size,
              lineHeight: fontSize.caption1.lineHeight,
              letterSpacing: fontSize.caption1.letterSpacing,
              fontWeight: fontWeight.regular,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--fill-tertiary, #00000033)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: borderRadius.md,
                backgroundColor: 'var(--secondary-system-background, #F2F2F7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--label-primary, #000000)',
              }}
            >
              {item.icon}
            </div>
            <span style={{ textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: spacing[2],
          padding: `${spacing[3]}px ${spacing[4]}px`,
          border: 'none',
          borderRadius: borderRadius.lg,
          backgroundColor: 'var(--secondary-system-background, #F2F2F7)',
          color: 'var(--label-primary, #000000)',
          fontSize: fontSize.body.size,
          lineHeight: fontSize.body.lineHeight,
          letterSpacing: fontSize.body.letterSpacing,
          fontWeight: fontWeight.semibold,
          fontFamily: 'inherit',
          cursor: 'pointer',
          width: '100%',
          transition: 'background-color 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--fill-tertiary, #00000033)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--secondary-system-background, #F2F2F7)';
        }}
      >
        {cancelLabel}
      </button>
    </BottomSheet>
  );
};

ShareSheet.displayName = 'ShareSheet';