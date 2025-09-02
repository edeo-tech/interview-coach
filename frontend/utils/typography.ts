/**
 * Typography Utilities
 * 
 * Helper functions and utilities for the Nunito + Inter font system.
 * These utilities help ensure consistent font usage across the app.
 */

import { TextStyle } from 'react-native';
import { TYPOGRAPHY, TypographyStyle, FONTS } from '../constants/Typography';

// Type-safe typography style getter
export const getTypographyStyle = (style: TypographyStyle): TextStyle => {
  return TYPOGRAPHY[style];
};

// Font family utilities
export const getFontFamily = (type: 'brand' | 'utility', weight: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular'): string => {
  if (type === 'brand') {
    switch (weight) {
      case 'bold': return FONTS.brandBold;
      case 'semiBold': return FONTS.brandSemiBold;
      case 'regular': return FONTS.brandRegular;
      default: return FONTS.brandRegular;
    }
  } else {
    switch (weight) {
      case 'bold': return FONTS.utilityBold;
      case 'semiBold': return FONTS.utilitySemiBold;
      case 'medium': return FONTS.utilityMedium;
      case 'regular': return FONTS.utilityRegular;
      default: return FONTS.utilityRegular;
    }
  }
};

// Typography selection helpers
export const getHeadingStyle = (level: 1 | 2 | 3): TextStyle => {
  const styles = {
    1: TYPOGRAPHY.heading1,
    2: TYPOGRAPHY.heading2,
    3: TYPOGRAPHY.heading3,
  };
  return styles[level];
};

export const getButtonStyle = (size: 'small' | 'medium' | 'large' = 'medium'): TextStyle => {
  const styles = {
    small: TYPOGRAPHY.buttonSmall,
    medium: TYPOGRAPHY.buttonMedium,
    large: TYPOGRAPHY.buttonLarge,
  };
  return styles[size];
};

export const getBodyStyle = (size: 'small' | 'medium' | 'large' = 'medium'): TextStyle => {
  const styles = {
    small: TYPOGRAPHY.bodySmall,
    medium: TYPOGRAPHY.bodyMedium,
    large: TYPOGRAPHY.bodyLarge,
  };
  return styles[size];
};

export const getLabelStyle = (size: 'small' | 'medium' | 'large' = 'medium'): TextStyle => {
  const styles = {
    small: TYPOGRAPHY.labelSmall,
    medium: TYPOGRAPHY.labelMedium,
    large: TYPOGRAPHY.labelLarge,
  };
  return styles[size];
};

// Semantic typography helpers
export const getSemanticStyle = (semantic: 'title' | 'subtitle' | 'body' | 'caption' | 'button' | 'label'): TextStyle => {
  switch (semantic) {
    case 'title': return TYPOGRAPHY.pageTitle;
    case 'subtitle': return TYPOGRAPHY.sectionHeader;
    case 'body': return TYPOGRAPHY.bodyMedium;
    case 'caption': return TYPOGRAPHY.caption;
    case 'button': return TYPOGRAPHY.buttonMedium;
    case 'label': return TYPOGRAPHY.labelMedium;
    default: return TYPOGRAPHY.bodyMedium;
  }
};

// Usage validation helpers
export const isNunitoFont = (fontFamily: string): boolean => {
  return fontFamily.includes('Nunito');
};

export const isInterFont = (fontFamily: string): boolean => {
  return fontFamily.includes('Inter');
};

// Responsive typography helpers
export const getResponsiveTypography = (
  baseStyle: TypographyStyle, 
  screenWidth: number,
  customScale?: number
): TextStyle => {
  const style = TYPOGRAPHY[baseStyle];
  const scale = customScale || 1;
  
  let responsiveScale = 1;
  if (screenWidth < 375) responsiveScale = 0.9;
  else if (screenWidth > 414) responsiveScale = 1.1;
  
  return {
    ...style,
    fontSize: Math.max((style.fontSize || 16) * scale * responsiveScale, 12),
    lineHeight: (style.lineHeight || 24) * scale * responsiveScale,
  };
};

// Accessibility helpers
export const getAccessibleTypography = (
  baseStyle: TypographyStyle,
  accessibilityScale: number = 1
): TextStyle => {
  const style = TYPOGRAPHY[baseStyle];
  const minSize = 12;
  
  return {
    ...style,
    fontSize: Math.max((style.fontSize || 16) * accessibilityScale, minSize),
    lineHeight: (style.lineHeight || 24) * accessibilityScale,
  };
};

// Migration helpers
export const LEGACY_MAPPING: Record<string, TypographyStyle> = {
  // Common legacy font usage patterns that should be updated
  'title': 'pageTitle',
  'subtitle': 'sectionHeader',
  'heading': 'heading2',
  'subheading': 'heading3',
  'body1': 'bodyMedium',
  'body2': 'bodySmall',
  'button': 'buttonMedium',
  'caption': 'caption',
  'overline': 'overline',
  
  // Specific legacy styles from the old system
  'hero': 'displayLarge',
  'heroMedium': 'displayMedium',
  'heroSmall': 'displaySmall',
  'contentTitle': 'contentTitle',
  'itemTitle': 'itemTitle',
};

export const migrateLegacyTypography = (legacyStyle: string): TextStyle => {
  const mappedStyle = LEGACY_MAPPING[legacyStyle];
  return mappedStyle ? TYPOGRAPHY[mappedStyle] : TYPOGRAPHY.bodyMedium;
};

// Typography combination helpers
export const combineTypographyStyles = (...styles: (TextStyle | undefined)[]): TextStyle => {
  return styles.reduce((combined, style) => {
    if (!style) return combined;
    return { ...combined, ...style };
  }, {} as TextStyle);
};

// Custom typography builder
export const createCustomTypography = (options: {
  type: 'brand' | 'utility';
  size: number;
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  lineHeight?: number;
  letterSpacing?: number;
}): TextStyle => {
  const { type, size, weight = 'regular', lineHeight, letterSpacing } = options;
  
  return {
    fontFamily: getFontFamily(type, weight),
    fontSize: size,
    lineHeight: lineHeight || size * 1.4,
    letterSpacing: letterSpacing || 0,
    fontWeight: weight === 'regular' ? '400' : 
                 weight === 'medium' ? '500' :
                 weight === 'semiBold' ? '600' : '700',
  };
};

// Font loading status helpers
export const validateFontFamily = (fontFamily: string): boolean => {
  const validFonts = [
    'Nunito-Regular',
    'Nunito-SemiBold', 
    'Nunito-Bold',
    'Inter-Regular',
    'Inter-Medium',
    'Inter-SemiBold',
    'Inter-Bold',
  ];
  
  return validFonts.includes(fontFamily);
};

// Development helpers
export const debugTypography = (style: TypographyStyle): void => {
  if (__DEV__) {
    const typographyStyle = TYPOGRAPHY[style];
    console.log(`Typography Debug - ${style}:`, {
      fontSize: typographyStyle.fontSize,
      lineHeight: typographyStyle.lineHeight,
      fontFamily: typographyStyle.fontFamily,
      fontWeight: typographyStyle.fontWeight,
      letterSpacing: typographyStyle.letterSpacing,
      isNunito: isNunitoFont(typographyStyle.fontFamily || ''),
      isInter: isInterFont(typographyStyle.fontFamily || ''),
    });
  }
};

// Type definitions for better TypeScript support
export type FontType = 'brand' | 'utility';
export type FontWeight = 'regular' | 'medium' | 'semiBold' | 'bold';
export type HeadingLevel = 1 | 2 | 3;
export type SizeVariant = 'small' | 'medium' | 'large';
export type SemanticType = 'title' | 'subtitle' | 'body' | 'caption' | 'button' | 'label';

// Export commonly used styles for convenience
export const COMMON_STYLES = {
  // Most frequently used styles
  h1: TYPOGRAPHY.heading1,
  h2: TYPOGRAPHY.heading2, 
  h3: TYPOGRAPHY.heading3,
  body: TYPOGRAPHY.bodyMedium,
  caption: TYPOGRAPHY.caption,
  button: TYPOGRAPHY.buttonMedium,
  label: TYPOGRAPHY.labelMedium,
  
  // Page structure
  pageTitle: TYPOGRAPHY.pageTitle,
  sectionTitle: TYPOGRAPHY.sectionHeader,
  itemTitle: TYPOGRAPHY.itemTitle,
  
  // UI elements
  navigation: TYPOGRAPHY.navigation,
  tabLabel: TYPOGRAPHY.tabLabel,
  statusText: TYPOGRAPHY.statusText,
  helperText: TYPOGRAPHY.helperText,
  
  // Content types
  transcript: TYPOGRAPHY.transcript,
  listItem: TYPOGRAPHY.listItem,
  
  // Welcome/Hero styles
  welcomeIntro: TYPOGRAPHY.welcomeIntro,
  welcomeHero: TYPOGRAPHY.welcomeHero,
  primaryCTA: TYPOGRAPHY.primaryCTA,
} as const;