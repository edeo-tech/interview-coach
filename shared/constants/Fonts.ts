/**
 * Font System - Nunito + Inter
 * 
 * Nunito (brand/expressive): Voice & actions → headings, buttons, navigation, branded touchpoints
 * Inter (readability/utility): Readability & information → paragraphs, feedback, transcripts, lists, system text
 * 
 * Usage Rule: Nunito is always larger/stronger than Inter in the same view
 */

export const fonts = {
  // Nunito - Primary Brand Font (expressive/actions)
  brand: {
    regular: 'Nunito-Regular',    // 400 - fallback/light brand text
    semiBold: 'Nunito-SemiBold',  // 600 - H2, H3, buttons, labels, navigation
    bold: 'Nunito-Bold',          // 700 - H1, strong emphasis
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
  // Brand fonts (Nunito)
  BRAND_REGULAR: fonts.brand.regular,
  BRAND_SEMIBOLD: fonts.brand.semiBold,
  BRAND_BOLD: fonts.brand.bold,
  
  // Utility fonts (Inter)
  UTILITY_REGULAR: fonts.utility.regular,
  UTILITY_MEDIUM: fonts.utility.medium,
  UTILITY_SEMIBOLD: fonts.utility.semiBold,
  UTILITY_BOLD: fonts.utility.bold,
} as const;