// Enhanced glassmorphic styles with improved accessibility
// These styles provide better visibility against the new colorful background
// while maintaining the glassmorphic aesthetic and ensuring good text contrast
import { Platform } from 'react-native';

export const GlassStyles = {
  // Primary container - most common use case
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // Increased from 0.06-0.08
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Increased from 0.08
    borderRadius: 14,
    overflow: 'hidden' as const,
  },

  // Secondary container - less prominent elements  
  containerSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Increased from 0.03-0.04
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)', // Increased from 0.06
    borderRadius: 14,
    overflow: 'hidden' as const,
  },

  // Interactive elements (buttons, touchable areas)
  interactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Increased from 0.08
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)', // Increased from 0.10
    borderRadius: 14,
    overflow: 'hidden' as const,
  },

  // Input fields
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)', // Increased from 0.06
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Increased from 0.08
    borderRadius: 12,
  },

  // Cards and content blocks
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // Increased from 0.06
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Increased from 0.08
    borderRadius: 16,
    overflow: 'hidden' as const,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    }),
  },

  // Status colors - success, warning, error with improved visibility
  success: {
    backgroundColor: 'rgba(5, 46, 22, 0.25)', // Increased from 0.15
    borderColor: 'rgba(34, 197, 94, 0.35)', // Increased from 0.25
  },

  warning: {
    backgroundColor: 'rgba(146, 64, 14, 0.25)', // Increased from 0.15  
    borderColor: 'rgba(217, 119, 6, 0.35)', // Increased from 0.25
  },

  error: {
    backgroundColor: 'rgba(127, 29, 29, 0.25)', // Increased from 0.15
    borderColor: 'rgba(239, 68, 68, 0.35)', // Increased from 0.25  
  },

  info: {
    backgroundColor: 'rgba(30, 58, 138, 0.25)', // Increased from 0.15
    borderColor: 'rgba(59, 130, 246, 0.35)', // Increased from 0.25
  },

  // Dark variant containers for areas needing more contrast
  containerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.40)', // Dark semi-transparent
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 14,
    overflow: 'hidden' as const,
  },

  // Accent colors with better visibility
  accent: {
    backgroundColor: 'rgba(59, 130, 246, 0.20)', // Increased from 0.15
    borderColor: 'rgba(59, 130, 246, 0.30)', // Increased from 0.25
  },
};

// Text colors that work well with the enhanced glass containers
export const GlassTextColors = {
  primary: '#FFFFFF',
  secondary: 'rgba(255, 255, 255, 0.85)',
  muted: 'rgba(255, 255, 255, 0.70)',
  accent: '#60A5FA', // Light blue that pops against the background
};