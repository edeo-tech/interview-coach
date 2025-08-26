/**
 * Enhanced Typography System for Interview Coach
 * 
 * A professional, hierarchical font system optimized for:
 * - Interview coaching and career development
 * - Excellent readability across all devices
 * - Modern, trustworthy, and approachable aesthetic
 */

import { Platform } from 'react-native';

// Font Family Constants - Professional Interview Coaching Typography
export const FONTS = {
  // Primary Display Font - Nunito Sans for all content hierarchy
  display: 'NunitoSans_800ExtraBold',
  displayMedium: 'NunitoSans_700Bold', 
  displayLight: 'NunitoSans_600SemiBold',
  
  // Heading Font - Nunito Sans for consistent visual hierarchy  
  heading: 'NunitoSans_700Bold',
  headingMedium: 'NunitoSans_600SemiBold',
  headingLight: 'NunitoSans_500Medium',
  
  // Body Font - Inter for all UI elements and interface text
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  
  // Fallback for non-custom font situations
  fallback: Platform.OS === 'ios' ? 'System' : 'Roboto',
} as const;

// Typography Scale - Responsive and accessible
export const TYPOGRAPHY = {
  // Hero/Display Sizes - For onboarding heroes and major brand moments
  hero: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '800' as const,
    fontFamily: FONTS.display,
    letterSpacing: -1.5,
  },
  
  heroMedium: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700' as const,
    fontFamily: FONTS.display,
    letterSpacing: -1,
  },
  
  heroSmall: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700' as const,
    fontFamily: FONTS.displayMedium,
    letterSpacing: -0.5,
  },
  
  // Display Sizes - For major headings
  displayLarge: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
    fontFamily: FONTS.displayMedium,
    letterSpacing: -0.5,
  },
  
  displayMedium: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600' as const,
    fontFamily: FONTS.displayLight,
    letterSpacing: -0.25,
  },
  
  displaySmall: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600' as const,
    fontFamily: FONTS.displayLight,
    letterSpacing: 0,
  },
  
  // Content Hierarchy - Refined system for consistent visual hierarchy
  // Use these for better UX coherence (all Space Grotesk for content structure)
  contentTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700' as const,
    fontFamily: FONTS.heading,
    letterSpacing: -0.25,
  },
  
  pageTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    fontFamily: FONTS.heading,
    letterSpacing: 0,
  },
  
  sectionHeader: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    fontFamily: FONTS.headingMedium,
    letterSpacing: 0,
  },
  
  itemTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    fontFamily: FONTS.headingLight,
    letterSpacing: 0,
  },
  
  // Heading Hierarchy - For section headers (legacy - use content hierarchy above)
  heading1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    fontFamily: FONTS.heading,
    letterSpacing: 0,
  },
  
  heading2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    fontFamily: FONTS.headingMedium,
    letterSpacing: 0,
  },
  
  heading3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    fontFamily: FONTS.headingLight,
    letterSpacing: 0,
  },
  
  heading4: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    fontFamily: FONTS.bodySemiBold,
    letterSpacing: 0,
  },
  
  heading5: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    fontFamily: FONTS.bodySemiBold,
    letterSpacing: 0.1,
  },
  
  // Body Text - For readable content
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400' as const,
    fontFamily: FONTS.body,
    letterSpacing: 0,
  },
  
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontFamily: FONTS.body,
    letterSpacing: 0,
  },
  
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    fontFamily: FONTS.body,
    letterSpacing: 0.1,
  },
  
  bodyXSmall: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400' as const,
    fontFamily: FONTS.body,
    letterSpacing: 0.2,
  },
  
  // Labels & UI Elements
  labelLarge: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500' as const,
    fontFamily: FONTS.bodyMedium,
    letterSpacing: 0.1,
  },
  
  labelMedium: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500' as const,
    fontFamily: FONTS.bodyMedium,
    letterSpacing: 0.1,
  },
  
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    fontFamily: FONTS.bodyMedium,
    letterSpacing: 0.2,
  },
  
  // Button Text
  buttonLarge: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    fontFamily: FONTS.bodySemiBold,
    letterSpacing: 0.1,
  },
  
  buttonMedium: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as const,
    fontFamily: FONTS.bodySemiBold,
    letterSpacing: 0.1,
  },
  
  buttonSmall: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as const,
    fontFamily: FONTS.bodySemiBold,
    letterSpacing: 0.15,
  },
  
  // Special Cases
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    fontFamily: FONTS.body,
    letterSpacing: 0.3,
  },
  
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500' as const,
    fontFamily: FONTS.bodyMedium,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
} as const;

// Font Loading Configuration
export const REQUIRED_FONTS = [
  'NunitoSans-ExtraBold',
  'NunitoSans-Bold',
  'NunitoSans-SemiBold', 
  'NunitoSans-Medium',
  'Inter-Regular',
  'Inter-Medium',
  'Inter-SemiBold',
  'Inter-Bold',
] as const;

// Accessibility helpers
export const getAccessibleFontSize = (baseSize: number, scale: number = 1): number => {
  return Math.max(baseSize * scale, 12); // Ensure minimum 12px for accessibility
};

// Responsive typography helper
export const getResponsiveFontSize = (baseSize: number, screenWidth: number): number => {
  if (screenWidth < 375) return baseSize * 0.9;
  if (screenWidth > 414) return baseSize * 1.1;
  return baseSize;
};

export type TypographyStyle = keyof typeof TYPOGRAPHY;