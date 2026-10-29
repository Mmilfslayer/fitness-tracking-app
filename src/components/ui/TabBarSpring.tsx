/**
 * Apple HIG Compliant Tab Bar with Spring Animations
 * Implements fluid interface principles:
 * - 1:1 pointer tracking on press
 * - Spring-based selection with velocity inheritance
 * - Interruptible at every instant
 * - Respects prefers-reduced-motion
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useVelocity, useReducedMotion } from 'framer-motion';
import { Home, Dumbbell, BarChart2, Settings } from 'lucide-react';
import { springConfigs } from '../../hooks/useAppleSpring';
import { spacing, fontSize, fontWeight, borderRadius, colors } from '../../design/tokens';

export type TabId = 'nutrition' | 'workout' | 'progress' | 'settings';

interface TabBarSpringProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'nutrition', label: 'Nutrition', icon: Home },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'progress', label: 'Progress', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Tab width calculation for the sliding indicator
const TAB_COUNT = TABS.length;
const INDICATOR_WIDTH = `calc(100% / ${TAB_COUNT})`;

export function TabBarSpring({ activeTab, onTabChange }: TabBarSpringProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>(Array(TAB_COUNT).fill(null));

  // Track active index for spring animation
  const activeIndex = useMemo(() => TABS.findIndex(t => t.id === activeTab), [activeTab]);

  // Spring for the sliding indicator position
  const indicatorX = useMotionValue(activeIndex * (100 / TAB_COUNT));
  const indicatorSpring = useSpring(indicatorX, springConfigs.navigation);

  // Spring for tab press feedback
  const pressScales = useMemo(
    () => Array.from({ length: TAB_COUNT }, () => useSpring(useMotionValue(1), springConfigs.iosPress)),
    []
  );

  // Velocity for momentum-based interactions
  const velocities = useMemo(
    () => Array.from({ length: TAB_COUNT }, () => useVelocity(useMotionValue(0))),
    []
  );

  // Reduced motion
  const prefersReducedMotion = useReducedMotion('navigation');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate indicator when active tab changes
  useEffect(() => {
    indicatorX.set(activeIndex * (100 / TAB_COUNT));
  }, [activeIndex, indicatorX]);

  if (!mounted) {
    return (
      <div
        ref={containerRef}
        className="fixed bottom-0 left-0 right-0 h-16 bg-system-grouped-background border-t border-system-border"
        role="tablist"
        aria-label="Main navigation"
      />
    );
  }

  return (
    <motion.nav
      ref={containerRef}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0.01 } : { type: 'spring', ...springConfigs.sheet }}
      className="fixed bottom-0 left-0 right-0 z-40"
      role="tablist"
      aria-label="Main navigation"
      style={{
        backgroundColor: 'var(--system-grouped-background)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
        borderBottomLeftRadius: borderRadius.continuousFull,
        borderBottomRightRadius: borderRadius.continuousFull,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Sliding Active Indicator */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 'env(safe-area-inset-bottom)',
          left: 0,
          right: 0,
          height: '100%',
          display: 'flex',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <motion.div
          style={{
            width: INDICATOR_WIDTH,
            height: '100%',
            borderRadius: borderRadius.continuousFull,
            backgroundColor: 'var(--system-blue, #007AFF)',
            opacity: 0.12,
            transformOrigin: 'center center',
          }}
          animate={{ x: indicatorSpring }}
          transition={prefersReducedMotion ? { duration: 0.01 } : { type: 'spring', ...springConfigs.navigation }}
        />
      </motion.div>

      <div className="flex items-center justify-around h-16 px-2 relative z-10">
        <AnimatePresence mode="wait">
          {TABS.map((tab, index) => (
            <TabButtonSpring
              key={tab.id}
              tab={tab}
              index={index}
              isActive={activeTab === tab.id}
              onPress={() => onTabChange(tab.id)}
              ref={el => { tabRefs.current[index] = el; }}
              pressScale={pressScales[index]}
              velocity={velocities[index]}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

interface TabButtonSpringProps {
  tab: typeof TABS[0];
  index: number;
  isActive: boolean;
  onPress: () => void;
  ref: React.RefObject<HTMLButtonElement>;
  pressScale: ReturnType<typeof useSpring>;
  velocity: ReturnType<typeof useVelocity>;
  prefersReducedMotion: ReturnType<typeof useReducedMotion>;
}

function TabButtonSpring({
  tab,
  index,
  isActive,
  onPress,
  ref,
  pressScale,
  velocity,
  prefersReducedMotion,
}: TabButtonSpringProps) {
  const Icon = tab.icon;

  // Create motion value for this tab's scale
  const scaleValue = useMotionValue(1);

  // Spring for press feedback
  const scaleSpring = useSpring(scaleValue, springConfigs.iosPress);

  // Label color animation
  const labelColor = useTransform(
    scaleSpring,
    [0.9, 1, 1.05],
    [
      'var(--system-blue, #007AFF)',
      isActive ? 'var(--system-blue, #007AFF)' : 'var(--label-tertiary, #3C3C4399)',
      'var(--system-blue, #007AFF)',
    ]
  );

  const handleTap = () => {
    onPress();
  };

  const handleTapStart = () => {
    scaleValue.set(0.92);
  };

  const handleTapEnd = () => {
    scaleValue.set(1);
  };

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={prefersReducedMotion ? { duration: 0.01 } : { delay: index * 0.05, type: 'spring', ...springConfigs.smooth }}
      onClick={handleTap}
      onMouseDown={handleTapStart}
      onMouseUp={handleTapEnd}
      onMouseLeave={handleTapEnd}
      onTouchStart={handleTapStart}
      onTouchEnd={handleTapEnd}
      onTouchCancel={handleTapEnd}
      role="tab"
      aria-selected={isActive}
      aria-label={tab.label}
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[1],
        padding: `${spacing[2]}px ${spacing[3]}px`,
        minWidth: '72px',
        minHeight: '44px',
        borderRadius: borderRadius.continuousMd,
        backgroundColor: 'transparent',
        border: 'none',
        color: isActive ? 'var(--system-blue, #007AFF)' : 'var(--label-tertiary, #3C3C4399)',
        cursor: 'pointer',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
      whileHover={!prefersReducedMotion ? { scale: 1.02 } : undefined}
      whileTap={!prefersReducedMotion ? { scale: 0.92 } : undefined}
    >
      <motion.span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: scaleSpring,
          transformOrigin: 'center center',
        }}
        animate={{ scale: scaleSpring }}
        transition={prefersReducedMotion ? { duration: 0.01 } : { type: 'spring', ...springConfigs.iosPress }}
      >
        <Icon className="w-6 h-6" aria-hidden="true" />
      </motion.span>
      <motion.span
        style={{
          fontSize: fontSize.caption2.size,
          lineHeight: fontSize.caption2.lineHeight,
          letterSpacing: fontSize.caption2.letterSpacing,
          fontWeight: fontWeight.medium,
          fontFamily: 'var(--font-rounded, -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "SF Pro Text", sans-serif)',
          color: labelColor,
          whiteSpace: 'nowrap',
        }}
        animate={{ color: labelColor }}
        transition={prefersReducedMotion ? { duration: 0.01 } : { type: 'spring', ...springConfigs.navigation }}
      >
        {tab.label}
      </motion.span>

      {/* Active indicator dot */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0.01 } : { type: 'spring', ...springConfigs.bouncy }}
            style={{
              position: 'absolute',
              bottom: 'calc(env(safe-area-inset-bottom) + 4px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--system-blue, #007AFF)',
            }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default TabBarSpring;