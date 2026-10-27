/**
 * Apple HIG Compliant Design Tokens
 * Centralized design tokens for iOS-style design system
 * Based on Apple Human Interface Guidelines specifications
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
  // iOS System Colors - Semantic (adapt to light/dark mode)
  label: {
    primary: '#000000',
    secondary: '#3C3C43',
    tertiary: '#3C3C4399', // 60% opacity
    quaternary: '#3C3C434D', // 30% opacity
  },
  labelDark: {
    primary: '#FFFFFF',
    secondary: '#EBEBF5',
    tertiary: '#EBEBF599', // 60% opacity
    quaternary: '#EBEBF54D', // 30% opacity
  },

  // Fill Colors
  fill: {
    primary: '#0000001A', // 10% opacity
    secondary: '#0000000D', // 5% opacity
    tertiary: '#00000033', // 20% opacity
    quaternary: '#00000014', // 8% opacity
  },
  fillDark: {
    primary: '#FFFFFF1A',
    secondary: '#FFFFFF0D',
    tertiary: '#FFFFFF33',
    quaternary: '#FFFFFF14',
  },

  // Background Colors
  background: {
    system: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#FFFFFF',
    grouped: '#F2F2F7',
    secondaryGrouped: '#FFFFFF',
    tertiaryGrouped: '#F2F2F7',
  },
  backgroundDark: {
    system: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
    grouped: '#000000',
    secondaryGrouped: '#1C1C1E',
    tertiaryGrouped: '#2C2C2E',
  },

  // Separator Colors
  separator: {
    opaque: '#C6C6C8',
    nonOpaque: '#3C3C434D', // 30% opacity
  },
  separatorDark: {
    opaque: '#38383A',
    nonOpaque: '#54545880', // 50% opacity
  },

  // iOS System Brand Colors (Light Mode)
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemIndigo: '#5856D6',
  systemOrange: '#FF9F0A',
  systemPink: '#FF2D55',
  systemPurple: '#AF52DE',
  systemRed: '#FF3B30',
  systemTeal: '#5AC8FA',
  systemYellow: '#FFCC00',

  // iOS System Brand Colors (Dark Mode)
  systemBlueDark: '#0A84FF',
  systemGreenDark: '#30D158',
  systemIndigoDark: '#5E5CE6',
  systemOrangeDark: '#FF9F0A',
  systemPinkDark: '#FF375F',
  systemPurpleDark: '#BF5AF2',
  systemRedDark: '#FF453A',
  systemTealDark: '#64D2FF',
  systemYellowDark: '#FFD60A',

  // System Grays (Light Mode)
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',

  // System Grays (Dark Mode)
  systemGrayDark: '#8E8E93',
  systemGray2Dark: '#636366',
  systemGray3Dark: '#48484A',
  systemGray4Dark: '#3A3A3C',
  systemGray5Dark: '#2C2C2E',
  systemGray6Dark: '#1C1C1E',

  // Semantic Status Colors
  success: '#34C759',
  successDark: '#30D158',
  warning: '#FF9F0A',
  warningDark: '#FF9F0A',
  error: '#FF3B30',
  errorDark: '#FF453A',
  info: '#007AFF',
  infoDark: '#0A84FF',

  // Link Colors
  link: '#007AFF',
  linkDark: '#0A84FF',

  // Placeholder Text
  placeholderText: '#3C3C434D', // 30% opacity
  placeholderTextDark: '#EBEBF54D', // 30% opacity
} as const;

// ============================================================================
// SPACING TOKENS (4px base unit scale)
// ============================================================================

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// Semantic spacing aliases
export const semanticSpacing = {
  xs: spacing[1],    // 4px
  sm: spacing[2],    // 8px
  md: spacing[3],    // 12px
  lg: spacing[4],    // 16px
  xl: spacing[5],    // 20px
  '2xl': spacing[6], // 24px
  '3xl': spacing[8], // 32px
  '4xl': spacing[10], // 40px
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const fontFamily = {
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"SF Pro Display"',
    '"SF Pro Text"',
    '"Helvetica Neue"',
    'Helvetica',
    'Arial',
    'sans-serif',
  ].join(','),
  rounded: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"SF Pro Rounded"',
    '"SF Pro Display"',
    '"SF Pro Text"',
    'sans-serif',
  ].join(','),
  mono: [
    'SF Mono',
    'Monaco',
    'Inconsolata',
    '"Fira Mono"',
    '"Droid Sans Mono"',
    'monospace',
  ].join(','),
} as const;

// iOS Text Styles (Dynamic Type compatible)
export const fontSize = {
  largeTitle: { size: '34px', lineHeight: '41px', letterSpacing: '0.37px', weight: 400 },
  title1: { size: '28px', lineHeight: '34px', letterSpacing: '0.36px', weight: 400 },
  title2: { size: '22px', lineHeight: '28px', letterSpacing: '0.35px', weight: 400 },
  title3: { size: '20px', lineHeight: '25px', letterSpacing: '0.38px', weight: 400 },
  headline: { size: '17px', lineHeight: '22px', letterSpacing: '-0.43px', weight: 600 },
  body: { size: '17px', lineHeight: '22px', letterSpacing: '-0.43px', weight: 400 },
  callout: { size: '16px', lineHeight: '21px', letterSpacing: '-0.32px', weight: 400 },
  subhead: { size: '15px', lineHeight: '20px', letterSpacing: '-0.24px', weight: 400 },
  footnote: { size: '13px', lineHeight: '18px', letterSpacing: '-0.08px', weight: 400 },
  caption1: { size: '12px', lineHeight: '16px', letterSpacing: '0px', weight: 400 },
  caption2: { size: '11px', lineHeight: '13px', letterSpacing: '0.07px', weight: 400 },
} as const;

// Font weights
export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// ============================================================================
// BORDER RADIUS TOKENS (Continuous curves / Squircles)
// ============================================================================

export const borderRadius = {
  // Standard iOS corner radius values
  none: '0px',
  xs: '4px',
  sm: '8px',   // Standard button/small cards
  md: '12px',  // Cards, inputs
  lg: '16px',  // Large cards, sheets
  xl: '22px',  // Large sheets
  '2xl': '24px', // Modal sheets
  '3xl': '28px', // Large modal
  full: '9999px', // Pills, avatars
  // Continuous curve (squircle) approximations
  continuousSm: '8px',   // Continuous curve small
  continuousMd: '12px',  // Continuous curve medium
  continuousLg: '16px',  // Continuous curve large
  continuousXl: '24px',  // Continuous curve XL
  continuous2xl: '28px', // Continuous curve 2XL
  continuousFull: '44px', // Continuous curve full (tab bar)
} as const;

// ============================================================================
// SHADOW / ELEVATION TOKENS (iOS Elevation Levels)
// ============================================================================

export const shadow = {
  // Level 0 - Flat (no shadow)
  none: 'none',

  // Level 1 - Separated (thin elements, separators)
  level1: '0 0.5px 1px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05)',

  // Level 2 - Elevated (cards, buttons)
  level2: '0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.05)',

  // Level 3 - Raised (modals, popovers)
  level3: '0 2px 4px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.08)',

  // Level 4 - Floating (action sheets, large modals)
  level4: '0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)',

  // Level 5 - Overlay (full screen modals)
  level5: '0 8px 16px rgba(0, 0, 0, 0.12), 0 16px 32px rgba(0, 0, 0, 0.12)',

  // Dark mode variants (lighter shadows)
  level1Dark: '0 0.5px 1px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15)',
  level2Dark: '0 1px 2px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.2)',
  level3Dark: '0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.25)',
  level4Dark: '0 4px 8px rgba(0, 0, 0, 0.35), 0 8px 16px rgba(0, 0, 0, 0.3)',
  level5Dark: '0 8px 16px rgba(0, 0, 0, 0.4), 0 16px 32px rgba(0, 0, 0, 0.35)',

  // Inner shadows
  inner: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
  innerDark: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
} as const;

// ============================================================================
// BLUR / BACKDROP FILTER TOKENS (Acrylic Materials)
// ============================================================================

export const blur = {
  // Material thicknesses
  ultraThin: 'blur(10px)',      // UIUltraThinMaterial
  thin: 'blur(20px)',           // UIThinMaterial
  regular: 'blur(40px)',        // UIMaterial / UIRegularMaterial
  thick: 'blur(60px)',          // UIThickMaterial
  ultraThick: 'blur(80px)',     // UIUltraThickMaterial

  // Chroma variants (tinted)
  ultraThinLight: 'blur(10px) saturate(180%)',
  thinLight: 'blur(20px) saturate(180%)',
  regularLight: 'blur(40px) saturate(180%)',
  thickLight: 'blur(60px) saturate(180%)',
  ultraThickLight: 'blur(80px) saturate(180%)',

  ultraThinDark: 'blur(10px) saturate(180%)',
  thinDark: 'blur(20px) saturate(180%)',
  regularDark: 'blur(40px) saturate(180%)',
  thickDark: 'blur(60px) saturate(180%)',
  ultraThickDark: 'blur(80px) saturate(180%)',
} as const;

// ============================================================================
// ANIMATION / MOTION TOKENS
// ============================================================================

export const animation = {
  // Spring configurations (Framer Motion compatible)
  spring: {
    gentle: { type: 'spring', stiffness: 120, damping: 14, mass: 1 },
    smooth: { type: 'spring', stiffness: 180, damping: 16, mass: 1 },
    snappy: { type: 'spring', stiffness: 280, damping: 18, mass: 1 },
    bouncy: { type: 'spring', stiffness: 400, damping: 12, mass: 1 },
    // iOS specific springs
    iosDefault: { type: 'spring', stiffness: 170, damping: 22, mass: 1 },
    iosPress: { type: 'spring', stiffness: 300, damping: 20, mass: 0.8 },
    iosDismiss: { type: 'spring', stiffness: 150, damping: 25, mass: 1 },
  },

  // Duration tokens (ms)
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Easing curves
  easing: {
    // iOS standard easings
    standard: 'cubic-bezier(0.42, 0, 0.58, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.42, 0, 1, 1)',
    // Spring-like easings
    spring: 'cubic-bezier(0.17, 0.67, 0.5, 1)',
    springSoft: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
} as const;

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

export const breakpoints = {
  xs: '320px',
  sm: '375px',   // iPhone SE / mini
  md: '390px',   // iPhone 12/13/14 standard
  lg: '428px',   // iPhone 12/13/14 Pro Max
  xl: '768px',   // iPad mini / portrait
  '2xl': '1024px', // iPad / landscape
  '3xl': '1366px', // iPad Pro
} as const;

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  system: 900,
} as const;

// ============================================================================
// OPACITY TOKENS
// ============================================================================

export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  80: 0.8,
  90: 0.9,
  100: 1,
} as const;

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const transition = {
  // Property-specific transitions
  colors: 'color 150ms cubic-bezier(0.42, 0, 0.58, 1), background-color 150ms cubic-bezier(0.42, 0, 0.58, 1), border-color 150ms cubic-bezier(0.42, 0, 0.58, 1)',
  transform: 'transform 150ms cubic-bezier(0.17, 0.67, 0.5, 1)',
  opacity: 'opacity 150ms cubic-bezier(0.42, 0, 0.58, 1)',
  all: 'all 150ms cubic-bezier(0.42, 0, 0.58, 1)',

  // Component-specific
  button: 'transform 100ms cubic-bezier(0.17, 0.67, 0.5, 1), background-color 100ms cubic-bezier(0.42, 0, 0.58, 1)',
  card: 'transform 200ms cubic-bezier(0.17, 0.67, 0.5, 1), box-shadow 200ms cubic-bezier(0.42, 0, 0.58, 1)',
  modal: 'transform 300ms cubic-bezier(0.17, 0.67, 0.5, 1), opacity 200ms cubic-bezier(0.42, 0, 0.58, 1)',
  sheet: 'transform 400ms cubic-bezier(0.17, 0.67, 0.5, 1), opacity 300ms cubic-bezier(0.42, 0, 0.58, 1)',
} as const;

// ============================================================================
// ICON SIZE TOKENS
// ============================================================================

export const iconSize = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '28px',
  '2xl': '32px',
  '3xl': '44px', // Tab bar icons
} as const;

// ============================================================================
// TOUCH TARGET TOKENS
// ============================================================================

export const touchTarget = {
  minimum: '44px',    // Minimum touch target (Apple HIG)
  comfortable: '48px', // Comfortable touch target
  spacious: '56px',   // Spacious touch target
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const componentTokens = {
  button: {
    height: {
      sm: '32px',
      md: '44px',
      lg: '50px',
    },
    padding: {
      sm: '0 12px',
      md: '0 16px',
      lg: '0 24px',
    },
    borderRadius: borderRadius.full,
    fontSize: {
      sm: fontSize.caption1.size,
      md: fontSize.body.size,
      lg: fontSize.callout.size,
    },
    fontWeight: fontWeight.semibold,
  },

  card: {
    padding: spacing[4], // 16px
    gap: spacing[3], // 12px
    borderRadius: borderRadius.continuousLg,
    borderWidth: '0.5px',
  },

  input: {
    height: '44px',
    padding: '0 16px',
    borderRadius: borderRadius.md,
    borderWidth: '0.5px',
    fontSize: fontSize.body.size,
  },

  navigationBar: {
    height: '44px',
    largeTitleHeight: '52px',
    compactHeight: '44px',
    paddingHorizontal: spacing[4], // 16px
  },

  tabBar: {
    height: '83px', // Including safe area
    itemHeight: '49px',
    iconSize: iconSize['3xl'],
    labelSize: fontSize.caption2.size,
    paddingBottom: '34px', // Home indicator space
  },

  list: {
    itemHeight: '44px',
    itemPaddingHorizontal: spacing[4],
    itemPaddingVertical: spacing[2],
    separatorHeight: '0.5px',
    sectionHeaderHeight: '22px',
    sectionFooterHeight: '16px',
  },

  progress: {
    trackHeight: '4px',
    trackBorderRadius: borderRadius.full,
    ringStrokeWidth: '6px',
    ringSize: '44px',
    ringSizeLarge: '64px',
  },

  bottomSheet: {
    handleSize: '36px x 5px',
    handleBorderRadius: borderRadius.full,
    snapPoints: ['25%', '50%', '90%'],
    backdropBlur: blur.regular,
  },

  segmentedControl: {
    height: '32px',
    borderRadius: borderRadius.full,
    itemPadding: '0 16px',
    fontSize: fontSize.callout.size,
    fontWeight: fontWeight.semibold,
  },

  switch: {
    width: '51px',
    height: '31px',
    thumbSize: '27px',
    borderRadius: borderRadius.full,
  },

  datePicker: {
    height: '216px',
    itemHeight: '36px',
    fontSize: fontSize.body.size,
  },
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type SemanticSpacing = typeof semanticSpacing;
export type FontFamily = typeof fontFamily;
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type BorderRadius = typeof borderRadius;
export type Shadow = typeof shadow;
export type Blur = typeof blur;
export type Animation = typeof animation;
export type Breakpoints = typeof breakpoints;
export type ZIndex = typeof zIndex;
export type Opacity = typeof opacity;
export type Transition = typeof transition;
export type IconSize = typeof iconSize;
export type TouchTarget = typeof touchTarget;
export type ComponentTokens = typeof componentTokens;

// ============================================================================
// THEME HELPER
// ============================================================================

export const theme = {
  colors,
  spacing,
  semanticSpacing,
  fontFamily,
  fontSize,
  fontWeight,
  borderRadius,
  shadow,
  blur,
  animation,
  breakpoints,
  zIndex,
  opacity,
  transition,
  iconSize,
  touchTarget,
  componentTokens,
} as const;

export default theme;