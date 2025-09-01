/**
 * Typography System - Nunito + Inter Implementation
 * 
 * Implementation of the font overhaul plan:
 * - Nunito (brand/expressive): Voice & actions → headings, buttons, navigation, branded touchpoints
 * - Inter (readability/utility): Readability & information → paragraphs, feedback, transcripts, lists, system text
 * 
 * Usage Rule: Nunito is always larger/stronger than Inter in the same view
 */

import { Platform } from 'react-native';
import { fonts } from './Fonts';

// Font Family Constants
export const FONTS = {
  // Nunito - Brand Font (headings, buttons, navigation, branded touchpoints)
  brandBold: fonts.brand.bold,          // H1, strong brand emphasis
  brandSemiBold: fonts.brand.semiBold,  // H2, H3, buttons, labels, navigation
  brandRegular: fonts.brand.regular,    // Light brand text (if needed)
  
  // Inter - Utility Font (paragraphs, feedback, transcripts, lists, system text)
  utilityRegular: fonts.utility.regular, // Body text, captions, descriptions
  utilityMedium: fonts.utility.medium,   // Status text, emphasis
  utilitySemiBold: fonts.utility.semiBold, // Strong body emphasis
  utilityBold: fonts.utility.bold,       // Very strong body emphasis
  
  // Fallback
  fallback: Platform.OS === 'ios' ? 'System' : 'Roboto',
} as const;

// Typography Scale - Exact implementation of the font plan
export const TYPOGRAPHY = {
  // === NUNITO TYPOGRAPHY (Brand/Expressive) ===
  
  // H1 - Bold, 28–32px, line-height ~120%
  heading1: {
    fontSize: 30,
    lineHeight: 36, // 120%
    fontWeight: '700' as const,
    fontFamily: FONTS.brandBold,
    letterSpacing: -0.5,
  },
  
  // H2 - SemiBold, 22–26px
  heading2: {
    fontSize: 24,
    lineHeight: 29, // ~120%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: -0.25,
  },
  
  // H3 - SemiBold, 18–20px
  heading3: {
    fontSize: 19,
    lineHeight: 23, // ~120%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: 0,
  },
  
  // Buttons & Labels - SemiBold, 14–18px (Updated for better hierarchy)
  buttonLarge: {
    fontSize: 18, // Increased from 16 for primary CTAs
    lineHeight: 22, // ~125%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: 0.1,
  },
  
  buttonMedium: {
    fontSize: 15,
    lineHeight: 19, // ~125%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: 0.1,
  },
  
  buttonSmall: {
    fontSize: 14,
    lineHeight: 18, // ~125%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: 0.15,
  },
  
  // Navigation & UI Labels - SemiBold, 14–16px
  navigation: {
    fontSize: 15,
    lineHeight: 19, // ~125%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: 0.1,
  },
  
  tabLabel: {
    fontSize: 14,
    lineHeight: 18, // ~125%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: 0.1,
  },
  
  // === INTER TYPOGRAPHY (Readability/Utility) ===
  
  // Body Text - Regular, 16px, line-height ~150%
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24, // 150%
    fontWeight: '400' as const,
    fontFamily: FONTS.utilityRegular,
    letterSpacing: 0,
  },
  
  bodyLarge: {
    fontSize: 18,
    lineHeight: 27, // 150%
    fontWeight: '400' as const,
    fontFamily: FONTS.utilityRegular,
    letterSpacing: 0,
  },
  
  // Secondary Text/Captions - Regular, 14px
  bodySmall: {
    fontSize: 14,
    lineHeight: 20, // ~140%
    fontWeight: '400' as const,
    fontFamily: FONTS.utilityRegular,
    letterSpacing: 0.1,
  },
  
  caption: {
    fontSize: 14,
    lineHeight: 20, // ~140%
    fontWeight: '400' as const,
    fontFamily: FONTS.utilityRegular,
    letterSpacing: 0.1,
  },
  
  // Dense UI - Regular, 12–14px (lists, feedback, transcripts)
  bodyXSmall: {
    fontSize: 12,
    lineHeight: 16, // ~135%
    fontWeight: '400' as const,
    fontFamily: FONTS.utilityRegular,
    letterSpacing: 0.2,
  },
  
  listItem: {
    fontSize: 13,
    lineHeight: 18, // ~135%
    fontWeight: '400' as const,
    fontFamily: FONTS.utilityRegular,
    letterSpacing: 0.1,
  },
  
  transcript: {
    fontSize: 13,
    lineHeight: 18, // ~135%
    fontWeight: '400' as const,
    fontFamily: FONTS.utilityRegular,
    letterSpacing: 0.1,
  },
  
  // Status/Helper Text - Medium or Regular, 12–14px
  labelLarge: {
    fontSize: 14,
    lineHeight: 18, // ~130%
    fontWeight: '500' as const,
    fontFamily: FONTS.utilityMedium,
    letterSpacing: 0.1,
  },
  
  labelMedium: {
    fontSize: 13,
    lineHeight: 17, // ~130%
    fontWeight: '500' as const,
    fontFamily: FONTS.utilityMedium,
    letterSpacing: 0.1,
  },
  
  labelSmall: {
    fontSize: 12,
    lineHeight: 16, // ~130%
    fontWeight: '500' as const,
    fontFamily: FONTS.utilityMedium,
    letterSpacing: 0.2,
  },
  
  helperText: {
    fontSize: 12,
    lineHeight: 16, // ~130%
    fontWeight: '400' as const,
    fontFamily: FONTS.utilityRegular,
    letterSpacing: 0.2,
  },
  
  statusText: {
    fontSize: 13,
    lineHeight: 17, // ~130%
    fontWeight: '500' as const,
    fontFamily: FONTS.utilityMedium,
    letterSpacing: 0.1,
  },
  
  // === SEMANTIC TYPOGRAPHY ===
  // These provide semantic meaning and map to the core styles above
  
  // Page structure
  pageTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700' as const,
    fontFamily: FONTS.brandBold,
    letterSpacing: -0.5,
  },
  
  sectionHeader: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: -0.25,
  },
  
  itemTitle: {
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: 0,
  },
  
  // Legacy display styles (maintained for compatibility)
  displayLarge: {
    fontSize: 36,
    lineHeight: 43, // ~120%
    fontWeight: '700' as const,
    fontFamily: FONTS.brandBold,
    letterSpacing: -0.75,
  },
  
  displayMedium: {
    fontSize: 30,
    lineHeight: 36, // ~120%
    fontWeight: '700' as const,
    fontFamily: FONTS.brandBold,
    letterSpacing: -0.5,
  },
  
  displaySmall: {
    fontSize: 28, // Increased from 24 for better welcome screen hierarchy
    lineHeight: 34, // ~120%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: -0.25,
  },
  
  // Content hierarchy (backwards compatibility)
  contentTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: -0.25,
  },
  
  // Missing legacy styles (for backward compatibility)
  heading4: {
    fontSize: 17,
    lineHeight: 21, // ~125%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: 0,
  },
  
  heading5: {
    fontSize: 15,
    lineHeight: 19, // ~125%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: 0.1,
  },
  
  heroMedium: {
    fontSize: 42, // Increased from 32 for dominant brand presence
    lineHeight: 50, // ~120%
    fontWeight: '700' as const,
    fontFamily: FONTS.brandBold,
    letterSpacing: -0.75, // Tighter for larger text
  },
  
  heroSmall: {
    fontSize: 28,
    lineHeight: 34, // ~120%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: -0.25,
  },
  
  // Welcome/Onboarding Specific Styles
  welcomeIntro: {
    fontSize: 30, // Perfect for "Get to the" - larger than displaySmall
    lineHeight: 36, // ~120%
    fontWeight: '600' as const,
    fontFamily: FONTS.brandSemiBold,
    letterSpacing: -0.5,
  },
  
  welcomeHero: {
    fontSize: 52, // Perfect impact for "nextround" 
    lineHeight: 62, // ~120%
    fontWeight: '700' as const,
    fontFamily: FONTS.brandBold,
    letterSpacing: -1, // Tight for visual impact
  },
  
  primaryCTA: {
    fontSize: 20, // Prominent CTA button text
    lineHeight: 24, // Perfect for vertical centering
    fontWeight: '700' as const, // Bold for maximum impact
    fontFamily: FONTS.brandBold, // Use bold font family
    letterSpacing: 0.4, // Spacing for bold text readability
  },

  // Special cases
  overline: {
    fontSize: 11,
    lineHeight: 14, // ~130%
    fontWeight: '500' as const,
    fontFamily: FONTS.utilityMedium,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
} as const;

// Font Loading Configuration
export const REQUIRED_FONTS = [
  'Nunito-Bold',
  'Nunito-SemiBold',
  'Nunito-Regular',
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

// Typography usage guide
export const TYPOGRAPHY_USAGE = {
  // Use Nunito (brand fonts) for:
  NUNITO_FOR: [
    'Page titles and main headings (H1, H2, H3)',
    'Button labels and CTAs', 
    'Navigation items and tabs',
    'Section headers and branded touchpoints',
    'Any element representing voice & actions'
  ],
  
  // Use Inter (utility fonts) for:
  INTER_FOR: [
    'Body paragraphs and long-form content',
    'Form labels and input text',
    'Lists and table content',
    'Transcripts and feedback text', 
    'Status messages and helper text',
    'Captions and secondary information',
    'Any element focused on readability'
  ]
} as const;

export type TypographyStyle = keyof typeof TYPOGRAPHY;