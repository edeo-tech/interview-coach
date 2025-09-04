/**
 * Enhanced Color System for Interview Coach
 * 
 * A comprehensive color palette designed for:
 * - Dark mode interface with glassmorphic design
 * - Strong brand identity with purple accent
 * - Accessibility and readability
 * - Semantic color meanings
 */

// Base Colors
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const TRANSPARENT = 'transparent';

// Brand Colors
export const BRAND = {
  primary: '#A855F7', // Main purple brand color
  primaryRGB: 'rgb(169, 85, 247)', // RGB variant for compatibility
  secondary: '#8B5CF6', // Secondary purple
  tertiary: '#7C3AED', // Tertiary purple
  quaternary: '#9333EA', // Fourth purple variant
} as const;

// Accent Colors
export const ACCENT = {
  gold: '#F59E0B', // Gold/orange accent
  goldAlt: '#FCB000', // Alternative gold
  blue: '#60A5FA', // Accent blue
  blueAlt: '#3B82F6', // Alternative blue
  googleBlue: '#4285F4', // Google brand blue
} as const;

// Semantic Colors
export const SEMANTIC = {
  success: '#22C55E', // Primary success green
  successAlt: '#10B981', // Alternative success (emerald)
  successLight: '#34D399', // Light success
  
  error: '#EF4444', // Primary error red
  errorAlt: 'rgba(239, 68, 68, 1)', // Alternative error
  
  warning: '#F97316', // Primary warning orange
  warningAlt: '#EA580C', // Alternative warning
  warningDark: '#D97706', // Dark warning
  
  info: '#2E78B7', // Info blue
  infoAlt: '#3B82F6', // Alternative info
} as const;

// Gray Scale
export const GRAY = {
  900: '#0F172A', // Darkest gray
  800: '#1E293B', // Very dark gray
  700: '#334155', // Dark gray
  600: '#4B5563', // Medium dark gray
  500: '#6B7280', // Medium gray
  400: '#9CA3AF', // Light gray
  300: '#D1D5DB', // Very light gray
  200: '#E5E7EB', // Extra light gray
  100: '#F3F4F6', // Nearly white
  50: '#F9FAFB', // Off white
} as const;

// Text Colors (for dark mode)
export const TEXT = {
  primary: WHITE,
  secondary: 'rgba(255, 255, 255, 0.85)',
  tertiary: 'rgba(255, 255, 255, 0.70)',
  quaternary: 'rgba(255, 255, 255, 0.65)',
  muted: 'rgba(255, 255, 255, 0.55)',
  disabled: 'rgba(255, 255, 255, 0.40)',
  inverse: BLACK,
} as const;

// Glass Effects
export const GLASS = {
  // White-based glass
  background: 'rgba(255, 255, 255, 0.12)', // Primary glass background
  backgroundSecondary: 'rgba(255, 255, 255, 0.08)', // Secondary glass
  backgroundSubtle: 'rgba(255, 255, 255, 0.06)', // Very subtle glass
  backgroundInput: 'rgba(255, 255, 255, 0.10)', // Input fields
  
  border: 'rgba(255, 255, 255, 0.15)', // Primary glass border
  borderSecondary: 'rgba(255, 255, 255, 0.10)', // Secondary border
  borderInteractive: 'rgba(255, 255, 255, 0.20)', // Interactive border
  borderPressed: 'rgba(255, 255, 255, 0.30)', // Pressed state
  
  // Brand color glass (Purple)
  purple: 'rgba(168, 85, 247, 0.15)', // Purple glass background
  purpleTint: 'rgba(168, 85, 247, 0.25)', // Purple tint
  purpleSubtle: 'rgba(168, 85, 247, 0.05)', // Very subtle purple
  purpleLight: 'rgba(168, 85, 247, 0.10)', // Light purple
  purpleMedium: 'rgba(168, 85, 247, 0.30)', // Medium purple
  purpleBright: 'rgba(168, 85, 247, 0.60)', // Bright purple
  purpleIntense: 'rgba(168, 85, 247, 0.80)', // Intense purple
  
  // Accent color glass (Gold/Orange)
  gold: 'rgba(245, 158, 11, 0.15)', // Gold glass
  goldLight: 'rgba(245, 158, 11, 0.10)', // Light gold
  goldBorder: 'rgba(245, 158, 11, 0.40)', // Gold border
  goldMedium: 'rgba(245, 158, 11, 0.30)', // Medium gold
  goldBright: 'rgba(245, 158, 11, 0.50)', // Bright gold
  goldIntense: 'rgba(252, 180, 0, 0.60)', // Intense gold
  
  // Semantic glass colors
  success: 'rgba(34, 197, 94, 0.15)', // Success glass
  successBorder: 'rgba(34, 197, 94, 0.25)', // Success border
  successAlt: 'rgba(16, 185, 129, 0.30)', // Alt success
  successSecondary: 'rgba(16, 185, 129, 0.10)', // Secondary success
  successBorderAlt: 'rgba(16, 185, 129, 0.20)', // Alt success border
  
  error: 'rgba(239, 68, 68, 0.12)', // Error glass
  errorBorder: 'rgba(239, 68, 68, 0.25)', // Error border
  
  warning: 'rgba(217, 119, 6, 0.15)', // Warning glass
  
  info: 'rgba(59, 130, 246, 0.15)', // Info glass
  infoBorder: 'rgba(59, 130, 246, 0.25)', // Info border
  
  // Accent blue glass
  accentBlue: 'rgba(96, 165, 250, 0.20)', // Accent blue tint
  
  // Pink glass
  pink: 'rgba(236, 72, 153, 0.08)', // Subtle pink
  pinkMedium: 'rgba(236, 72, 153, 0.50)', // Medium pink
} as const;

// Overlay Colors
export const OVERLAY = {
  light: 'rgba(0, 0, 0, 0.3)', // Light overlay
  medium: 'rgba(0, 0, 0, 0.4)', // Medium overlay
  dark: 'rgba(0, 0, 0, 0.5)', // Dark overlay (modals)
  darker: 'rgba(0, 0, 0, 0.6)', // Darker overlay
  intense: 'rgba(0, 0, 0, 0.8)', // Intense overlay
  solid: 'rgba(0, 0, 0, 0.85)', // Nearly solid overlay
  extreme: 'rgba(0, 0, 0, 0.9)', // Extreme overlay
} as const;

// Gradient Colors
export const GRADIENT = {
  purple: 'rgba(124, 58, 237, 0.4)',
  cyan: 'rgba(6, 182, 212, 0.25)',
  green: 'rgba(34, 197, 94, 0.15)',
  darkPurple: 'rgba(19, 0, 57, 0.17)',
  iPhonePurple: 'rgba(128, 90, 168, 0.6)',
} as const;

// Background Colors
export const BACKGROUND = {
  primary: BLACK,
  secondary: GRAY[900],
  tertiary: GRAY[800],
  elevated: GRAY[700],
  transparent: TRANSPARENT,
} as const;

// Special Colors
export const SPECIAL = {
  tabIconDefault: '#CCC',
  tabIconSelected: BRAND.primary,
  pink: '#EC4899',
} as const;

// Export the complete color system
const Colors = {
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
  glass: GLASS,
  overlay: OVERLAY,
  gradient: GRADIENT,
  background: BACKGROUND,
  special: SPECIAL,
  
  // Legacy support (will be deprecated)
  dark: {
    text: WHITE,
    background: BLACK,
    tint: WHITE,
    tabIconDefault: '#CCC',
    tabIconSelected: WHITE,
  },
} as const;

export default Colors;

// Type exports for better TypeScript support
export type BrandColor = keyof typeof BRAND;
export type AccentColor = keyof typeof ACCENT;
export type SemanticColor = keyof typeof SEMANTIC;
export type GrayScale = keyof typeof GRAY;
export type TextColor = keyof typeof TEXT;
export type GlassColor = keyof typeof GLASS;
export type OverlayColor = keyof typeof OVERLAY;
export type GradientColor = keyof typeof GRADIENT;
export type BackgroundColor = keyof typeof BACKGROUND;
export type SpecialColor = keyof typeof SPECIAL;