/**
 * Font System - Nunito + Inter
 * 
 * Nunito (brand/expressive): Voice & actions → headings, buttons, navigation, branded touchpoints
 * Inter (readability/utility): Readability & information → paragraphs, feedback, transcripts, lists, system text
 * 
 * Usage Rule: Nunito is always larger/stronger than Inter in the same view
 */

export const fonts = {
  // Familjen Grotesk - Brand/Headings (expressive/actions)
  brand: {
    regular: 'FamiljenGrotesk-Regular',
    semiBold: 'FamiljenGrotesk-SemiBold',
    bold: 'FamiljenGrotesk-Bold',
  },
  
  // Inter - Primary Utility Font (readability/information)
  utility: {
    regular: 'Inter-Regular',     // 400 - body text, captions, descriptions
    medium: 'Inter-Medium',       // 500 - status text, emphasis
    semiBold: 'Inter-SemiBold',   // 600 - strong body emphasis (optional)
    bold: 'Inter-Bold',           // 700 - strong emphasis (optional)
  },
  
  // Legacy aliases for compatibility
  primary: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium', 
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  }
} as const;

// Font family constants for easy reference
export const FONT_FAMILIES = {
  // Brand fonts (Familjen Grotesk)
  BRAND_REGULAR: fonts.brand.regular,
  BRAND_SEMIBOLD: fonts.brand.semiBold,
  BRAND_BOLD: fonts.brand.bold,
  
  // Utility fonts (Inter)
  UTILITY_REGULAR: fonts.utility.regular,
  UTILITY_MEDIUM: fonts.utility.medium,
  UTILITY_SEMIBOLD: fonts.utility.semiBold,
  UTILITY_BOLD: fonts.utility.bold,
} as const;