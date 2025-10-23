/**
 * Light Mode Color System - Fintech Design
 *
 * Inspired by modern fintech apps (Jio BlackRock style)
 * - Clean white backgrounds
 * - Purple brand accent
 * - High contrast text for readability
 * - Professional, trustworthy aesthetic
 */

// Base Colors
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const TRANSPARENT = 'transparent';

// Brand Colors - Purple Theme
export const BRAND = {
  primary: '#6C2BDC',        // Main purple brand color
  primaryLight: '#8B5CF6',   // Lighter purple
  primaryDark: '#5B21B6',    // Darker purple
  lavender: '#F3E8FF',       // Light lavender background for cards
  lavenderAlt: '#F5F0FF',    // Alternative soft lavender
} as const;

// Accent Colors
export const ACCENT = {
  gold: '#F5B82E',           // Gold accent for active states
  purple: '#6C2BDC',         // Same as brand primary
  purpleLight: '#F3E8FF',    // Light purple background
  blue: '#3B82F6',           // Accent blue
  blueLight: '#60A5FA',      // Light blue
} as const;

// Semantic Colors
export const SEMANTIC = {
  success: '#10B981',        // Green for positive indicators (+10.17%)
  successLight: '#34D399',   // Lighter success
  successBg: '#D1FAE5',      // Success background

  error: '#EF4444',          // Red for errors
  errorLight: '#F87171',     // Light error
  errorBg: '#FEE2E2',        // Error background

  warning: '#F59E0B',        // Orange warning
  warningLight: '#FCD34D',   // Light warning
  warningBg: '#FEF3C7',      // Warning background

  info: '#3B82F6',           // Blue info
  infoLight: '#60A5FA',      // Light info
  infoBg: '#DBEAFE',         // Info background
} as const;

// Gray Scale
export const GRAY = {
  900: '#1A1A1A',            // Darkest - Primary text
  800: '#2D2D2D',            // Very dark
  700: '#404040',            // Dark
  600: '#555555',            // Medium dark - Secondary text
  500: '#737373',            // Medium
  400: '#A3A3A3',            // Light medium
  300: '#D4D4D4',            // Light
  200: '#E5E5E5',            // Very light - Borders/Dividers
  100: '#F5F5F5',            // Nearly white - Card backgrounds
  50: '#FAFAFA',             // Off white
} as const;

// Text Colors (for light mode)
export const TEXT = {
  primary: '#1A1A1A',        // Black/Charcoal for headings
  secondary: '#555555',      // Dark gray for body text
  tertiary: '#737373',       // Medium gray for captions
  muted: '#A3A3A3',          // Light gray for disabled
  inverse: WHITE,            // White text on dark backgrounds
  link: '#6C2BDC',           // Purple for links
  success: '#10B981',        // Green for positive numbers
  error: '#EF4444',          // Red for errors
} as const;

// Background Colors
export const BACKGROUND = {
  primary: WHITE,            // Main background
  secondary: '#FAFAFA',      // Secondary background
  tertiary: '#F5F5F5',       // Tertiary background
  card: WHITE,               // Card background
  cardSecondary: '#F3E8FF',  // Lavender card background
  elevated: WHITE,           // Elevated surfaces
} as const;

// Border Colors
export const BORDER = {
  light: '#F5F5F5',          // Very light border
  default: '#E5E5E5',        // Default border/divider
  medium: '#D4D4D4',         // Medium border
  dark: '#A3A3A3',           // Dark border
  brand: '#6C2BDC',          // Brand colored border
  brandLight: '#F3E8FF',     // Light brand border
} as const;

// Icon Colors
export const ICON = {
  default: '#737373',        // Default icon color
  active: '#6C2BDC',         // Active/selected icon
  inactive: '#A3A3A3',       // Inactive icon
  background: '#F5F0FF',     // Icon circle background
  backgroundAlt: '#F3E8FF',  // Alternative icon background
} as const;

// Card Styles
export const CARD = {
  background: WHITE,
  backgroundSecondary: '#F3E8FF',  // Lavender cards
  border: '#E5E5E5',
  shadow: 'rgba(0, 0, 0, 0.05)',   // Subtle shadow
  shadowStrong: 'rgba(0, 0, 0, 0.1)', // Stronger shadow
} as const;

// Interactive States
export const INTERACTIVE = {
  hover: '#F5F5F5',          // Hover state background
  pressed: '#E5E5E5',        // Pressed state background
  focus: '#6C2BDC',          // Focus state color
  disabled: '#F5F5F5',       // Disabled background
  disabledText: '#A3A3A3',   // Disabled text
} as const;

// Shadow Styles
export const SHADOW = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Export the complete light color system
const ColorsLight = {
  // Core colors
  white: WHITE,
  black: BLACK,
  transparent: TRANSPARENT,

  // Color groups
  brand: BRAND,
  accent: ACCENT,
  semantic: SEMANTIC,
  gray: GRAY,
  text: TEXT,
  background: BACKGROUND,
  border: BORDER,
  icon: ICON,
  card: CARD,
  interactive: INTERACTIVE,
  shadow: SHADOW,
} as const;

export default ColorsLight;

// Type exports for better TypeScript support
export type BrandColor = keyof typeof BRAND;
export type AccentColor = keyof typeof ACCENT;
export type SemanticColor = keyof typeof SEMANTIC;
export type GrayScale = keyof typeof GRAY;
export type TextColor = keyof typeof TEXT;
export type BackgroundColor = keyof typeof BACKGROUND;
export type BorderColor = keyof typeof BORDER;
export type IconColor = keyof typeof ICON;
export type CardColor = keyof typeof CARD;
export type InteractiveColor = keyof typeof INTERACTIVE;
