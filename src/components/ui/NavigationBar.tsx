/**
 * Apple HIG Compliant Navigation Bar Component
 * Large collapsing title with search bar integration
 */

import React, { forwardRef, useState, useRef, HTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fontSize, fontWeight, spacing, colors, borderRadius, blur } from '../../design/tokens';

export interface NavigationBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onScroll' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop'> {
  /** Large title text */
  title: string;
  /** Subtitle text */
  subtitle?: string;
  /** Leading (left) content - typically back button */
  leading?: React.ReactNode;
  /** Trailing (right) content - typically actions */
  trailing?: React.ReactNode;
  /** Search bar integration */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Search value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Search focus handler */
  onSearchFocus?: () => void;
  /** Search blur handler */
  onSearchBlur?: () => void;
  /** Large title scroll behavior */
  largeTitle?: boolean;
  /** Hide bottom border */
  hideBorder?: boolean;
  /** Custom background */
  background?: 'default' | 'transparent' | 'glass';
  /** Scroll Y position for collapsing (controlled) */
  scrollY?: number;
  /** On scroll handler */
  onScroll?: (y: number) => void;
}

const NavigationBar = forwardRef<HTMLDivElement, NavigationBarProps>(
  (
    {
      title,
      subtitle,
      leading,
      trailing,
      searchable = false,
      searchPlaceholder = 'Search',
      searchValue = '',
      onSearchChange,
      onSearchFocus,
      onSearchBlur,
      largeTitle = true,
      hideBorder = false,
      background = 'default',
      scrollY: controlledScrollY,
      onScroll,
      className = '',
      style,
      children,
      ...props
    },
    _ref
  ) => {
    const [searchFocused, setSearchFocused] = useState(false);
    const [internalScrollY] = useState(0);
    const navRef = useRef<HTMLDivElement>(null);

    const scrollY = controlledScrollY ?? internalScrollY;
    const isScrolled = scrollY > 60;
    const isLargeTitleVisible = largeTitle && !isScrolled && !searchFocused;

    // Calculate scroll progress for large title collapse (0 to 1)
    const collapseThreshold = 60; // pixels before starting to collapse
    const collapseProgress = Math.min(Math.max((scrollY - collapseThreshold) / 80, 0), 1);

    const backgroundStyles: Record<string, React.CSSProperties> = {
      default: {
        backgroundColor: 'var(--system-background, #FFFFFF)',
      },
      transparent: {
        backgroundColor: 'transparent',
      },
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: blur.regular,
        WebkitBackdropFilter: blur.regular,
      },
    };

    const borderStyle = hideBorder ? 'none' : `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`;

    return (
      <motion.div
        ref={navRef}
        className={className}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          ...backgroundStyles[background],
          borderBottom: borderStyle,
          ...style,
        }}
        {...props}
      >
        {/* Search Bar (when focused or not large title) */}
        <AnimatePresence mode="wait">
          {(searchable && (searchFocused || !isLargeTitleVisible)) && (
            <motion.div
              key="search-bar"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                padding: `${spacing[2]}px ${spacing[4]}px ${spacing[3]}px`, // 8px 16px 12px
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--secondary-system-background, #F2F2F7)',
                  borderRadius: borderRadius.full,
                  height: '36px',
                  padding: '0 12px',
                  transition: 'background-color 150ms ease',
                }}
                onClick={() => {
                  const input = document.querySelector('input[data-nav-search]') as HTMLInputElement;
                  input?.focus();
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    color: 'var(--label-tertiary, #3C3C4399)',
                    flexShrink: 0,
                    marginRight: spacing[2],
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={(el) => { if (el) el.setAttribute('data-nav-search', 'true'); }}
                  type="search"
                  value={searchValue}
                  onChange={(event) => onSearchChange?.(event.target.value)}
                  onFocus={() => {
                    setSearchFocused(true);
                    onSearchFocus?.();
                  }}
                  onBlur={() => {
                    setSearchFocused(false);
                    onSearchBlur?.();
                  }}
                  placeholder={searchPlaceholder}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: fontSize.body.size,
                    lineHeight: fontSize.body.lineHeight,
                    fontFamily: 'inherit',
                    color: 'var(--label-primary, #000000)',
                    width: '100%',
                    height: '100%',
                  }}
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSearchChange?.('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'var(--label-tertiary, #3C3C4399)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Clear search"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Navigation Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: isLargeTitleVisible ? '96px' : '44px', // Large title height vs compact
            padding: `0 ${spacing[4]}px`, // 16px horizontal
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* Leading */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              minWidth: '44px',
              height: '44px',
            }}
          >
            {leading}
          </div>

          {/* Title Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
            <AnimatePresence mode="wait">
              {isLargeTitleVisible && (
                <motion.div
                  key="large-title"
                  initial={{ opacity: 0, y: 20, scale: 1.1 }}
                  animate={{ opacity: 1 - collapseProgress, y: collapseProgress * -20, scale: 1 - collapseProgress * 0.1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  style={{
                    transformOrigin: 'center bottom',
                    pointerEvents: 'none',
                  }}
                >
                  <h1
                    style={{
                      margin: 0,
                      fontSize: fontSize.largeTitle.size,
                      lineHeight: fontSize.largeTitle.lineHeight,
                      letterSpacing: fontSize.largeTitle.letterSpacing,
                      fontWeight: fontWeight.bold,
                      color: 'var(--label-primary, #000000)',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {title}
                  </h1>
                  {subtitle && (
                    <p
                      style={{
                        margin: '2px 0 0 0',
                        fontSize: fontSize.footnote.size,
                        lineHeight: fontSize.footnote.lineHeight,
                        letterSpacing: fontSize.footnote.letterSpacing,
                        fontWeight: fontWeight.regular,
                        color: 'var(--label-secondary, #3C3C43)',
                        fontFamily: 'inherit',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {subtitle}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inline Title (compact) */}
            <AnimatePresence mode="wait">
              {!isLargeTitleVisible && (
                <motion.div
                  key="inline-title"
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: collapseProgress, y: (1 - collapseProgress) * 10, scale: 0.9 + collapseProgress * 0.1 }}
                  exit={{ opacity: 0, y: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: fontSize.title1.size,
                      lineHeight: fontSize.title1.lineHeight,
                      letterSpacing: fontSize.title1.letterSpacing,
                      fontWeight: fontWeight.semibold,
                      color: 'var(--label-primary, #000000)',
                      fontFamily: 'inherit',
                    }}
                  >
                    {title}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trailing */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              minWidth: '44px',
              height: '44px',
              justifyContent: 'flex-end',
            }}
          >
            {trailing}
          </div>
        </div>

        {/* Custom children (for additional content like segmented controls) */}
        {children && (
          <div style={{ padding: `0 ${spacing[4]}px ${spacing[3]}px` }}>
            {children}
          </div>
        )}
      </motion.div>
    );
  }
);

NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;

/**
 * Back Button Component for Navigation Bar
 */
export interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ label = 'Back', onClick, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: `${spacing[1]}px ${spacing[2]}px`,
        border: 'none',
        background: 'transparent',
        color: 'var(--system-blue, #007AFF)',
        fontSize: fontSize.body.size,
        lineHeight: fontSize.body.lineHeight,
        letterSpacing: fontSize.body.letterSpacing,
        fontWeight: fontWeight.regular,
        fontFamily: 'inherit',
        cursor: 'pointer',
        borderRadius: borderRadius.full,
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--fill-tertiary, #00000033)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      {...props}
    >
      {children || (
        <>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ flexShrink: 0 }}
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
        </>
      )}
    </button>
  )
);

BackButton.displayName = 'BackButton';

/**
 * Navigation Bar Title Component (for programmatic control)
 */
export interface NavTitleProps {
  title: string;
  subtitle?: string;
  large?: boolean;
}

export const NavTitle = ({ title, subtitle, large = true }: NavTitleProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    <h1
      style={{
        margin: 0,
        fontSize: large ? fontSize.largeTitle.size : fontSize.title1.size,
        lineHeight: large ? fontSize.largeTitle.lineHeight : fontSize.title1.lineHeight,
        letterSpacing: large ? fontSize.largeTitle.letterSpacing : fontSize.title1.letterSpacing,
        fontWeight: large ? fontWeight.bold : fontWeight.semibold,
        color: 'var(--label-primary, #000000)',
        fontFamily: 'inherit',
      }}
    >
      {title}
    </h1>
    {subtitle && (
      <p
        style={{
          margin: '2px 0 0 0',
          fontSize: large ? fontSize.footnote.size : fontSize.caption1.size,
          lineHeight: large ? fontSize.footnote.lineHeight : fontSize.caption1.lineHeight,
          letterSpacing: large ? fontSize.footnote.letterSpacing : fontSize.caption1.letterSpacing,
          fontWeight: fontWeight.regular,
          color: 'var(--label-secondary, #3C3C43)',
          fontFamily: 'inherit',
        }}
      >
        {subtitle}
      </p>
    )}
  </div>
);

NavTitle.displayName = 'NavTitle';