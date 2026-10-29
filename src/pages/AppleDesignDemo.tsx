/**
 * Apple Fluid Interface Demo
 * Showcases the design principles from "Designing Fluid Interfaces" WWDC 2018
 * - Response: Feedback on pointer-down, not release
 * - Direct Manipulation: 1:1 pointer tracking
 * - Interruptibility: Animate from presentation value
 * - Springs: Damping ratio & response time
 * - Velocity Handoff: Pass release velocity to spring
 * - Momentum Projection: Exponential decay (d ≈ 0.998)
 * - Spatial Consistency: Symmetric enter/exit paths
 * - Materials: Translucent layers, vibrancy
 * - Reduced Motion: Cross-fades over slides
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useDrag, useVelocity } from 'framer-motion';
import { springConfigs } from '../hooks/useAppleSpring';
import { useDragToDismiss, useSwipeAction, usePullToRefresh, useMomentumScroll, usePointerTracking, useRespectReducedMotion } from '../hooks/useAppleGestures';
import { spacing, fontSize, fontWeight, colors, borderRadius, shadow, blur } from '../design/tokens';
import Card, { CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { TabBarSpring } from '../components/ui/TabBarSpring';

const principles = [
  {
    id: 'response',
    title: 'Response',
    subtitle: 'Feedback on pointer-down, not release',
    description: 'Eliminate latency on the input path. Buttons, toggles, and controls respond the instant the finger touches down.',
    icon: '⚡',
  },
  {
    id: 'direct-manipulation',
    title: 'Direct Manipulation',
    subtitle: '1:1 pointer tracking with setPointerCapture',
    description: 'Objects follow the finger exactly. Respect grab offset so the object doesn\'t jump to the finger\'s center.',
    icon: '👆',
  },
  {
    id: 'interruptibility',
    title: 'Interruptibility',
    subtitle: 'Animate from presentation value, not target',
    description: 'Animations can be interrupted mid-flight without glitches. The spring continues from the current visual state.',
    icon: '⏯️',
  },
  {
    id: 'springs',
    title: 'Springs',
    subtitle: 'Damping ratio (1.0 = critical) and response time',
    description: 'Think in damping ratio and response (seconds to target), not mass/stiffness/duration. Springs are inherently velocity-aware.',
    icon: '🌀',
  },
  {
    id: 'velocity-handoff',
    title: 'Velocity Handoff',
    subtitle: 'Pass release velocity to spring',
    description: 'When a gesture ends, the spring inherits the release velocity for natural momentum continuation.',
    icon: '🏎️',
  },
  {
    id: 'momentum-projection',
    title: 'Momentum Projection',
    subtitle: 'Exponential decay (d ≈ 0.998)',
    description: 'Project resting position: d = v / (1 - decay). Then snap to nearest target.',
    icon: '📐',
  },
  {
    id: 'spatial-consistency',
    title: 'Spatial Consistency',
    subtitle: 'Symmetric enter/exit paths',
    description: 'Enter and exit animations mirror each other. Anchor origins to trigger elements for spatial continuity.',
    icon: '🔄',
  },
  {
    id: 'materials',
    title: 'Materials',
    subtitle: 'Translucent layers, weight encodes hierarchy',
    description: 'Use backdrop-filter for blur. Vibrancy for legibility. Weight (thickness) encodes visual hierarchy.',
    icon: '🔍',
  },
  {
    id: 'reduced-motion',
    title: 'Reduced Motion',
    subtitle: 'Cross-fades over slides/springs',
    description: 'Respect prefers-reduced-motion. Use cross-fades instead of slides. Respect prefers-reduced-transparency and prefers-contrast.',
    icon: '♿',
  },
];

export function AppleDesignDemo() {
  const [activeTab, setActiveTab] = useState<'principles' | 'springs' | 'gestures' | 'materials'>('principles');

  return (
    <div className="page-enter min-h-screen bg-system-grouped-background safe-area-inset-bottom">
      <TabBarSpring
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div style={{ paddingBottom: '100px', paddingTop: spacing[4] }}>
        {activeTab === 'principles' && <PrinciplesTab />}
        {activeTab === 'springs' && <SpringsTab />}
        {activeTab === 'gestures' && <GesturesTab />}
        {activeTab === 'materials' && <MaterialsTab />}
      </div>
    </div>
  );
}

function PrinciplesTab() {
  return (
    <div className="stagger-children" style={{ padding: spacing[4] }}>
      <div style={{ marginBottom: spacing[6] }}>
        <h1 style={{
          fontSize: fontSize.largeTitle.size,
          lineHeight: fontSize.largeTitle.lineHeight,
          letterSpacing: fontSize.largeTitle.letterSpacing,
          fontWeight: fontWeight.bold,
          color: 'var(--label-primary)',
          fontFamily: 'var(--font-sans)',
          marginBottom: spacing[2],
        }}>
          Fluid Interface Principles
        </h1>
        <p style={{
          fontSize: fontSize.body.size,
          lineHeight: fontSize.body.lineHeight,
          letterSpacing: fontSize.body.letterSpacing,
          color: 'var(--label-secondary)',
          fontFamily: 'var(--font-sans)',
          maxWidth: '600px',
        }}>
          Based on Apple\'s "Designing Fluid Interfaces" (WWDC 2018). Interfaces feel alive when motion starts from the current on-screen value, inherits user velocity, projects momentum, and stays interruptible at every instant.
        </p>
      </div>

      <div style={{ display: 'grid', gap: spacing[4] }}>
        {principles.map((principle, index) => (
          <motion.div
            key={principle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: 'spring', ...springConfigs.smooth }}
            style={{
              backgroundColor: 'var(--system-background)',
              borderRadius: borderRadius.continuousLg,
              padding: spacing[5],
              boxShadow: shadow.level2,
              border: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
            }}
            whileHover={{ y: -2, boxShadow: shadow.level3 }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[4] }}>
              <div style={{
                fontSize: '32px',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--system-blue, #007AFF)15',
                borderRadius: borderRadius.continuousMd,
                flexShrink: 0,
              }}>
                {principle.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: `0 0 ${spacing[1]}px 0`,
                  fontSize: fontSize.headline.size,
                  lineHeight: fontSize.headline.lineHeight,
                  letterSpacing: fontSize.headline.letterSpacing,
                  fontWeight: fontWeight.semibold,
                  color: 'var(--label-primary)',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {principle.title}
                </h3>
                <p style={{
                  margin: `0 0 ${spacing[2]}px 0`,
                  fontSize: fontSize.subhead.size,
                  lineHeight: fontSize.subhead.lineHeight,
                  letterSpacing: fontSize.subhead.letterSpacing,
                  fontWeight: fontWeight.medium,
                  color: 'var(--system-blue, #007AFF)',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {principle.subtitle}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: fontSize.body.size,
                  lineHeight: fontSize.body.lineHeight,
                  letterSpacing: fontSize.body.letterSpacing,
                  color: 'var(--label-secondary)',
                  fontFamily: 'var(--font-sans)',
                }}>
                  {principle.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SpringsTab() {
  const [selectedSpring, setSelectedSpring] = useState<keyof typeof springConfigs>('smooth');

  const springs = Object.entries(springConfigs).map(([key, config]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    config,
  }));

  return (
    <div style={{ padding: spacing[4] }}>
      <div style={{ marginBottom: spacing[6] }}>
        <h1 style={{
          fontSize: fontSize.largeTitle.size,
          lineHeight: fontSize.largeTitle.lineHeight,
          letterSpacing: fontSize.largeTitle.letterSpacing,
          fontWeight: fontWeight.bold,
          color: 'var(--label-primary)',
          fontFamily: 'var(--font-sans)',
          marginBottom: spacing[2],
        }}>
          Spring Configurations
        </h1>
        <p style={{
          fontSize: fontSize.body.size,
          color: 'var(--label-secondary)',
          fontFamily: 'var(--font-sans)',
        }}>
          Apple uses damping ratio and response time. Each spring has a purpose.
        </p>
      </div>

      <div style={{ display: 'grid', gap: spacing[4] }}>
        {springs.map(({ id, name, config }, index) => (
          <SpringCard
            key={id}
            name={name}
            config={config as any}
            isSelected={selectedSpring === id}
            onClick={() => setSelectedSpring(id as keyof typeof springConfigs)}
            index={index}
          />
        ))}
      </div>

      <SpringPlayground selectedSpring={selectedSpring} />
    </div>
  );
}

function SpringCard({
  name,
  config,
  isSelected,
  onClick,
  index,
}: {
  name: string;
  config: any;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) {
  const springX = useMotionValue(0);
  const spring = useSpring(springX, config);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', ...springConfigs.smooth }}
      whileHover={{ y: -2, boxShadow: shadow.level3 }}
      whileTap={{ scale: 0.98 }}
      style={{
        cursor: 'pointer',
        backgroundColor: 'var(--system-background)',
        borderRadius: borderRadius.continuousLg,
        padding: spacing[5],
        boxShadow: isSelected ? shadow.level3 : shadow.level2,
        border: isSelected
          ? `2px solid var(--system-blue, #007AFF)`
          : `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] }}>
        <h3 style={{
          margin: 0,
          fontSize: fontSize.title3.size,
          lineHeight: fontSize.title3.lineHeight,
          letterSpacing: fontSize.title3.letterSpacing,
          fontWeight: fontWeight.semibold,
          color: 'var(--label-primary)',
          fontFamily: 'var(--font-sans)',
        }}>
          {name}
        </h3>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--system-blue, #007AFF)',
            }}
          />
        )}
      </div>

      <div style={{
        fontSize: fontSize.caption1.size,
        lineHeight: fontSize.caption1.lineHeight,
        letterSpacing: fontSize.caption1.letterSpacing,
        color: 'var(--label-tertiary)',
        fontFamily: 'var(--font-mono)',
      }}>
        {config.type === 'spring' ? (
          <>
            stiffness: {config.stiffness}, damping: {config.damping}, mass: {config.mass}
          </>
        ) : (
          <>
            duration: {config.duration}s, easing: {config.easing}
          </>
        )}
      </div>

      <SpringVisualization spring={spring} />
    </motion.div>
  );
}

function SpringVisualization({ spring }: { spring: ReturnType<typeof useSpring> }) {
  const progress = useMotionValue(0);
  const progressSpring = useSpring(progress, springConfigs.iosDefault);

  const [animating, setAnimating] = useState(false);

  const startAnimation = () => {
    setAnimating(true);
    progress.set(1);
    setTimeout(() => {
      progress.set(0);
      setAnimating(false);
    }, 800);
  };

  return (
    <div style={{ marginTop: spacing[4] }}>
      <div style={{
        height: '4px',
        backgroundColor: 'var(--secondary-system-background)',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '40%',
            backgroundColor: 'var(--system-blue, #007AFF)',
            borderRadius: '2px',
            transformOrigin: 'left center',
          }}
          animate={{ x: progressSpring }}
          transition={{ type: 'spring', ...spring }}
        />
      </div>
      <Button
        variant="tertiary"
        size="sm"
        onClick={startAnimation}
        disabled={animating}
        style={{ marginTop: spacing[3] }}
      >
        Test Spring
      </Button>
    </div>
  );
}

function SpringPlayground({ selectedSpring }: { selectedSpring: keyof typeof springConfigs }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springConfigs[selectedSpring]);
  const springY = useSpring(y, springConfigs[selectedSpring]);

  return (
    <Card variant="elevated" padding="lg" style={{ marginTop: spacing[6], borderRadius: borderRadius.continuousLg }}>
      <CardHeader title="Interactive Playground" subtitle="Drag the circle to test spring behavior" />
      <CardContent>
        <div
          ref={usePointerTracking({
            elementRef: { current: null } as any,
            onMove: (px, py) => {
              x.set(px);
              y.set(py);
            },
          })}
          style={{
            position: 'relative',
            height: '200px',
            backgroundColor: 'var(--secondary-system-background)',
            borderRadius: borderRadius.continuousMd,
            touchAction: 'none',
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--system-blue, #007AFF)',
              boxShadow: shadow.level3,
              touchAction: 'none',
            }}
            animate={{ x: springX, y: springY }}
            drag
            dragConstraints={{ left: 30, right: 30, top: 30, bottom: 30 }}
            dragElastic={0.3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function GesturesTab() {
  const [dragPosition, setDragPosition] = useState(0);
  const [swipeOpen, setSwipeOpen] = useState(false);
  const [refreshTriggered, setRefreshTriggered] = useState(false);

  const dragToDismiss = useDragToDismiss(0, {
    axis: 'y',
    threshold: 100,
    velocityThreshold: 1000,
    onDismiss: () => setDragPosition(0),
    onDragEnd: (pos) => setDragPosition(pos),
  });

  const swipeAction = useSwipeAction({
    threshold: 80,
    maxDistance: 240,
  });

  const pullToRefresh = usePullToRefresh({
    threshold: 80,
    maxDistance: 120,
    onRefresh: async () => {
      setRefreshTriggered(true);
      await new Promise(r => setTimeout(r, 1000));
      setRefreshTriggered(false);
    },
  });

  return (
    <div style={{ padding: spacing[4] }}>
      <h1 style={{
        fontSize: fontSize.largeTitle.size,
        lineHeight: fontSize.largeTitle.lineHeight,
        letterSpacing: fontSize.largeTitle.letterSpacing,
        fontWeight: fontWeight.bold,
        color: 'var(--label-primary)',
        fontFamily: 'var(--font-sans)',
        marginBottom: spacing[2],
      }}>
        Fluid Gestures
      </h1>
      <p style={{
        fontSize: fontSize.body.size,
        color: 'var(--label-secondary)',
        fontFamily: 'var(--font-sans)',
        marginBottom: spacing[6],
      }}>
        Velocity-aware, momentum-projecting, interruptible gestures.
      </p>

      <GestureCard title="Drag to Dismiss" subtitle="Pull down to dismiss with momentum">
        <div
          ref={dragToDismiss.dragControls}
          style={{
            position: 'relative',
            height: '200px',
            backgroundColor: 'var(--system-background)',
            borderRadius: borderRadius.continuousLg,
            boxShadow: shadow.level2,
            border: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
            overflow: 'hidden',
            touchAction: 'pan-y',
          }}
          drag="y"
          dragConstraints={{ top: -200, bottom: 200 }}
          dragElastic={0.2}
          dragMomentum={false}
          onDragEnd={dragToDismiss.handleDragEnd}
        >
          <motion.div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[4],
            }}
            animate={{ y: dragToDismiss.spring }}
            transition={{ type: 'spring', ...springConfigs.iosDismiss }}
          >
            <motion.div
              style={{
                width: '36px',
                height: '5px',
                borderRadius: '2.5px',
                backgroundColor: 'var(--label-tertiary)',
                marginTop: spacing[3],
              }}
              whileHover={{ backgroundColor: 'var(--label-secondary)' }}
              whileTap={{ backgroundColor: 'var(--label-primary)', scale: 0.95 }}
            />
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: fontSize.headline.size,
                fontWeight: fontWeight.semibold,
                color: 'var(--label-primary)',
                fontFamily: 'var(--font-sans)',
                marginBottom: spacing[1],
              }}>
                Drag Down to Dismiss
              </p>
              <p style={{
                fontSize: fontSize.caption1.size,
                color: 'var(--label-tertiary)',
                fontFamily: 'var(--font-sans)',
              }}>
                Position: {Math.round(dragToDismiss.position.get())}px
              </p>
              <p style={{
                fontSize: fontSize.caption1.size,
                color: 'var(--label-tertiary)',
                fontFamily: 'var(--font-sans)',
              }}>
                Velocity: {Math.round(dragToDismiss.velocity.get())}px/s
              </p>
            </div>
            <Button
              variant="primary"
              onClick={dragToDismiss.dismiss}
              style={{ marginTop: 'auto', marginBottom: spacing[6] }}
            >
              Dismiss
            </Button>
          </motion.div>
        </div>
      </GestureCard>

      <GestureCard title="Swipe Actions" subtitle="iOS Mail-style swipe with snap points">
        <motion.div
          style={{
            position: 'relative',
            height: '80px',
            backgroundColor: 'var(--system-background)',
            borderRadius: borderRadius.continuousMd,
            boxShadow: shadow.level1,
            border: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
            overflow: 'hidden',
          }}
          drag="x"
          dragConstraints={{ left: -240, right: 0 }}
          dragElastic={0.2}
          onDragEnd={swipeAction.handleDragEnd as any}
        >
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: spacing[2],
            paddingRight: spacing[4],
          }}>
            <Button variant="destructive" size="sm" onClick={() => { swipeAction.close(); alert('Delete!'); }}>
              🗑️ Delete
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { swipeAction.close(); alert('Archive!'); }}>
              📦 Archive
            </Button>
          </div>
          <motion.div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: spacing[4],
              backgroundColor: 'var(--system-background)',
            }}
            animate={{ x: swipeAction.spring }}
          >
            <p style={{
              fontSize: fontSize.body.size,
              fontWeight: fontWeight.medium,
              color: 'var(--label-primary)',
              fontFamily: 'var(--font-sans)',
            }}>
              Swipe left for actions →
            </p>
          </motion.div>
        </motion.div>
      </GestureCard>

      <GestureCard title="Pull to Refresh" subtitle="Elastic resistance with momentum release">
        <motion.div
          style={{
            height: '200px',
            backgroundColor: 'var(--system-background)',
            borderRadius: borderRadius.continuousLg,
            boxShadow: shadow.level2,
            border: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
            overflow: 'hidden',
            position: 'relative',
          }}
          drag="y"
          dragConstraints={{ top: -120, bottom: 0 }}
          dragElastic={0.3}
          onDragEnd={pullToRefresh.handleDragEnd}
        >
          <motion.div
            style={{
              position: 'absolute',
              top: -80,
              left: 0,
              right: 0,
              height: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: spacing[4],
            }}
            animate={{ y: pullToRefresh.spring }}
            transition={{ type: 'spring', ...springConfigs.gentle }}
          >
            <motion.div
              style={{
                width: '24px',
                height: '24px',
                border: '3px solid var(--system-blue, #007AFF)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
              animate={{ rotate: pullToRefresh.isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p style={{
              marginTop: spacing[2],
              fontSize: fontSize.caption1.size,
              color: 'var(--label-secondary)',
              fontFamily: 'var(--font-sans)',
            }}>
              {pullToRefresh.isRefreshing ? 'Refreshing...' : `Pull: ${Math.round(pullToRefresh.progress * 100)}%`}
            </p>
          </motion.div>
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: spacing[2],
          }}>
            <p style={{
              fontSize: fontSize.body.size,
              color: 'var(--label-secondary)',
              fontFamily: 'var(--font-sans)',
            }}>
              Pull down to refresh
            </p>
            <Button variant="tertiary" size="sm" onClick={pullToRefresh.triggerRefresh}>
              Trigger Refresh
            </Button>
          </div>
        </motion.div>
      </GestureCard>
    </div>
  );
}

function GestureCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card variant="elevated" padding="lg" style={{ marginBottom: spacing[6], borderRadius: borderRadius.continuousLg }}>
      <CardHeader title={title} subtitle={subtitle} />
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function MaterialsTab() {
  return (
    <div style={{ padding: spacing[4] }}>
      <h1 style={{
        fontSize: fontSize.largeTitle.size,
        lineHeight: fontSize.largeTitle.lineHeight,
        letterSpacing: fontSize.largeTitle.letterSpacing,
        fontWeight: fontWeight.bold,
        color: 'var(--label-primary)',
        fontFamily: 'var(--font-sans)',
        marginBottom: spacing[2],
      }}>
        Materials & Vibrancy
      </h1>
      <p style={{
        fontSize: fontSize.body.size,
        color: 'var(--label-secondary)',
        fontFamily: 'var(--font-sans)',
        marginBottom: spacing[6],
      }}>
        Translucent layers with backdrop-filter. Weight encodes hierarchy. Vibrancy for legibility.
      </p>

      <div style={{ display: 'grid', gap: spacing[4] }}>
        {[
          { name: 'Ultra Thin', className: 'material-ultra-thin', blur: 'blur(10px)' },
          { name: 'Thin', className: 'material-thin', blur: 'blur(20px)' },
          { name: 'Regular', className: 'material-regular', blur: 'blur(20px) saturate(180%)' },
          { name: 'Thick', className: 'material-thick', blur: 'blur(30px) saturate(180%)' },
          { name: 'Ultra Thick', className: 'material-ultra-thick', blur: 'blur(40px) saturate(180%)' },
        ].map(({ name, className, blur: blurValue }, index) => (
          <MaterialCard key={name} name={name} className={className} blur={blurValue} index={index} />
        ))}
      </div>

      <div style={{ marginTop: spacing[8] }}>
        <h2 style={{
          fontSize: fontSize.title2.size,
          lineHeight: fontSize.title2.lineHeight,
          letterSpacing: fontSize.title2.letterSpacing,
          fontWeight: fontWeight.semibold,
          color: 'var(--label-primary)',
          fontFamily: 'var(--font-sans)',
          marginBottom: spacing[4],
        }}>
          Accessibility Materials
        </h2>
        <p style={{
          fontSize: fontSize.body.size,
          color: 'var(--label-secondary)',
          fontFamily: 'var(--font-sans)',
          marginBottom: spacing[4],
        }}>
          Respects prefers-reduced-transparency and prefers-contrast
        </p>
        <div style={{ display: 'grid', gap: spacing[4], gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <AccessibilityCard title="Reduced Transparency" description="Backdrop blur disabled, solid backgrounds" />
          <AccessibilityCard title="High Contrast" description="Increased color contrast, solid separators" />
          <AccessibilityCard title="Reduced Motion" description="Cross-fades instead of springs/slides" />
        </div>
      </div>
    </div>
  );
}

function MaterialCard({ name, className, blur, index }: { name: string; className: string; blur: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', ...springConfigs.smooth }}
      whileHover={{ y: -2, boxShadow: shadow.level3 }}
    >
      <Card variant="glass" padding="lg" style={{ borderRadius: borderRadius.continuousLg, minHeight: '120px' }}>
        <CardContent style={{ gap: spacing[3] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{
              margin: 0,
              fontSize: fontSize.title3.size,
              fontWeight: fontWeight.semibold,
              color: 'var(--label-primary)',
              fontFamily: 'var(--font-sans)',
            }}>
              {name}
            </h3>
            <span style={{
              fontSize: fontSize.caption1.size,
              color: 'var(--label-tertiary)',
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'var(--secondary-system-background)',
              padding: `${spacing[1]}px ${spacing[2]}px`,
              borderRadius: borderRadius.full,
            }}>
              {blur}
            </span>
          </div>
          <div style={{
            height: '60px',
            borderRadius: borderRadius.continuousMd,
            background: 'linear-gradient(135deg, var(--system-blue) 0%, var(--system-purple) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div className={className} style={{
              width: '80%',
              height: '80%',
              borderRadius: borderRadius.continuousMd,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <p style={{
                fontSize: fontSize.caption1.size,
                fontWeight: fontWeight.medium,
                color: 'var(--label-primary)',
                fontFamily: 'var(--font-sans)',
              }}>
                Content over vibrant background
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AccessibilityCard({ title, description }: { title: string; description: string }) {
  return (
    <Card variant="default" padding="md" style={{ borderRadius: borderRadius.continuousMd }}>
      <CardContent>
        <h3 style={{
          margin: `0 0 ${spacing[1]}px 0`,
          fontSize: fontSize.headline.size,
          fontWeight: fontWeight.semibold,
          color: 'var(--label-primary)',
          fontFamily: 'var(--font-sans)',
        }}>
          {title}
        </h3>
        <p style={{
          margin: 0,
          fontSize: fontSize.body.size,
          color: 'var(--label-secondary)',
          fontFamily: 'var(--font-sans)',
        }}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default AppleDesignDemo;