# Interview Coach Design System

A comprehensive glassmorphic design system for the Interview Coach app, built around the beautiful gradient background with consistent styling, typography, and component patterns.

## 🎨 Color System

### Core Palette

Based on the app's gradient background, our color system extracts key hues and creates a cohesive palette:

#### Primary Colors
```typescript
primary: {
  50: 'rgba(248, 250, 252, 1)',    // Very light slate
  100: 'rgba(241, 245, 249, 1)',   // Light slate
  200: 'rgba(226, 232, 240, 1)',   // Pale slate
  300: 'rgba(203, 213, 225, 1)',   // Light gray-blue
  400: 'rgba(148, 163, 184, 1)',   // Medium gray-blue
  500: 'rgba(100, 116, 139, 1)',   // Slate gray
  600: 'rgba(71, 85, 105, 1)',     // Dark slate
  700: 'rgba(51, 65, 85, 1)',      // Darker slate
  800: 'rgba(30, 41, 59, 1)',      // Very dark slate
  900: 'rgba(15, 23, 42, 1)',      // Near black slate
  950: 'rgba(11, 20, 38, 1)',      // Deepest background
}
```

#### Accent Colors
```typescript
// Purple - from background gradient
purple: {
  100: 'rgba(237, 233, 254, 1)',   // Very light purple
  200: 'rgba(221, 214, 254, 1)',   // Light purple
  300: 'rgba(196, 181, 253, 1)',   // Medium light purple
  400: 'rgba(168, 85, 247, 1)',    // Bright purple (main)
  500: 'rgba(139, 92, 246, 1)',    // Standard purple
  600: 'rgba(124, 58, 237, 1)',    // Deep purple
  700: 'rgba(109, 40, 217, 1)',    // Darker purple
  800: 'rgba(91, 33, 182, 1)',     // Very dark purple
}

// Cyan/Teal - from background gradient
cyan: {
  100: 'rgba(236, 254, 255, 1)',   // Very light cyan
  200: 'rgba(207, 250, 254, 1)',   // Light cyan
  300: 'rgba(165, 243, 252, 1)',   // Medium light cyan
  400: 'rgba(6, 182, 212, 1)',     // Bright cyan (main)
  500: 'rgba(14, 165, 233, 1)',    // Standard cyan
  600: 'rgba(2, 132, 199, 1)',     // Deep cyan
  700: 'rgba(3, 105, 161, 1)',     // Darker cyan
  800: 'rgba(7, 89, 133, 1)',      // Very dark cyan
}

// Gold/Amber - accent color for CTAs
gold: {
  100: 'rgba(254, 243, 199, 1)',   // Very light gold
  200: 'rgba(253, 230, 138, 1)',   // Light gold
  300: 'rgba(252, 211, 77, 1)',    // Medium light gold
  400: 'rgba(252, 180, 0, 1)',     // Bright gold (main)
  500: 'rgba(245, 158, 11, 1)',    // Standard gold
  600: 'rgba(217, 119, 6, 1)',     // Deep gold
  700: 'rgba(180, 83, 9, 1)',      // Darker gold
  800: 'rgba(146, 64, 14, 1)',     // Very dark gold
}

// Pink - complementary accent
pink: {
  100: 'rgba(252, 231, 243, 1)',   // Very light pink
  200: 'rgba(251, 207, 232, 1)',   // Light pink
  300: 'rgba(249, 168, 212, 1)',   // Medium light pink
  400: 'rgba(236, 72, 153, 1)',    // Bright pink (main)
  500: 'rgba(219, 39, 119, 1)',    // Standard pink
  600: 'rgba(190, 24, 93, 1)',     // Deep pink
  700: 'rgba(157, 23, 77, 1)',     // Darker pink
  800: 'rgba(131, 24, 67, 1)',     // Very dark pink
}
```

#### Semantic Colors
```typescript
semantic: {
  success: {
    light: 'rgba(34, 197, 94, 0.1)',
    main: 'rgba(34, 197, 94, 1)',
    dark: 'rgba(22, 163, 74, 1)',
  },
  warning: {
    light: 'rgba(217, 119, 6, 0.1)',
    main: 'rgba(217, 119, 6, 1)',
    dark: 'rgba(180, 83, 9, 1)',
  },
  error: {
    light: 'rgba(239, 68, 68, 0.1)',
    main: 'rgba(239, 68, 68, 1)',
    dark: 'rgba(220, 38, 38, 1)',
  },
  info: {
    light: 'rgba(59, 130, 246, 0.1)',
    main: 'rgba(59, 130, 246, 1)',
    dark: 'rgba(37, 99, 235, 1)',
  }
}
```

### Text Colors
```typescript
text: {
  primary: '#FFFFFF',                    // Pure white for main text
  secondary: 'rgba(255, 255, 255, 0.85)', // High contrast secondary
  tertiary: 'rgba(255, 255, 255, 0.70)',  // Medium contrast tertiary
  muted: 'rgba(255, 255, 255, 0.55)',     // Low contrast muted
  accent: '#60A5FA',                     // Light blue accent
  inverse: '#0F172A',                    // Dark text for light backgrounds
}
```

## 🎭 Glassmorphic Effects

### Glass Containers

#### Primary Glass (Most Common)
```typescript
glass: {
  background: 'rgba(255, 255, 255, 0.12)',
  border: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 14,
  backdropBlur: 20, // CSS backdrop-filter: blur(20px)
  shadow: {
    color: '#000',
    offset: { width: 0, height: 2 },
    opacity: 0.1,
    radius: 4,
  }
}
```

#### Secondary Glass (Subtle Elements)
```typescript
glassSecondary: {
  background: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.12)',
  borderRadius: 12,
  backdropBlur: 15,
  shadow: {
    color: '#000',
    offset: { width: 0, height: 1 },
    opacity: 0.05,
    radius: 2,
  }
}
```

#### Interactive Glass (Buttons, Touchables)
```typescript
glassInteractive: {
  default: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.20)',
  },
  pressed: {
    background: 'rgba(255, 255, 255, 0.25)',
    border: 'rgba(255, 255, 255, 0.30)',
  },
  disabled: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.08)',
  }
}
```

#### Input Glass
```typescript
glassInput: {
  background: 'rgba(255, 255, 255, 0.10)',
  border: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 12,
  focused: {
    border: 'rgba(168, 85, 247, 0.4)',
    shadow: {
      color: 'rgba(168, 85, 247, 0.25)',
      offset: { width: 0, height: 0 },
      radius: 8,
    }
  }
}
```

#### Dark Glass (High Contrast)
```typescript
glassDark: {
  background: 'rgba(0, 0, 0, 0.40)',
  border: 'rgba(255, 255, 255, 0.10)',
  borderRadius: 14,
}
```

## 📝 Typography

### Enhanced Font Stack
```typescript
fonts: {
  display: 'NunitoSans', // Primary display font - heroes, major headings, content hierarchy
  heading: 'NunitoSans', // Heading font - all content structure and hierarchy
  body: 'Inter', // Body and UI font - all interface text, UI elements, forms
  mono: 'SF Mono', // Code and monospace needs (unchanged)
}
```

#### Font Selection Rationale - Perfect for Interview Coaching

**Nunito Sans** - *Primary Content Font*
- **Complements rounded audio bar logo**: Rounded, friendly characteristics that perfectly match the app's visual identity
- **Professional yet approachable**: Balanced geometric sans-serif that builds trust while remaining inviting
- **Exceptional readability**: Designed with careful attention to letter spacing and character clarity
- **Mobile optimized**: Clean, legible performance across all screen sizes and resolutions
- **Unified hierarchy**: Single font family with multiple weights creates strong visual cohesion
- **Used for**: All content structure - hero titles, headings, section headers, content titles

**Inter** - *Interface & UI Font*
- **Perfect UI partner**: Both Nunito Sans and Inter are modern interface fonts that complement each other beautifully
- **Specifically designed for user interfaces**: Optimized for buttons, forms, navigation, metadata
- **Comprehensive character set**: Excellent international support
- **Proven readability**: Industry standard for interface text
- **Used for**: All UI elements - buttons, forms, labels, metadata, supporting information

### Enhanced Typography Scale

Our typography system provides a comprehensive hierarchy optimized for interview coaching and professional development applications.

```typescript
typography: {
  // Hero/Display Sizes - For onboarding heroes and major brand moments
  hero: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '800',
    fontFamily: 'NunitoSans_800ExtraBold',
    letterSpacing: -1.5,
  },
  
  heroMedium: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
    fontFamily: 'NunitoSans_700Bold',
    letterSpacing: -1,
  },
  
  heroSmall: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    fontFamily: 'NunitoSans_600SemiBold',
    letterSpacing: -0.5,
  },
  
  // Display Sizes - For major headings
  displayLarge: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
    fontFamily: 'NunitoSans_600SemiBold',
    letterSpacing: -0.5,
  },
  
  displayMedium: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
    letterSpacing: -0.25,
  },
  
  displaySmall: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
    letterSpacing: 0,
  },
  
  // Heading Hierarchy - For section headers
  heading1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    fontFamily: 'NunitoSans_700Bold',
    letterSpacing: 0,
  },
  
  heading2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
    letterSpacing: 0,
  },
  
  heading3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_500Medium',
    letterSpacing: 0,
  },
  
  heading4: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0,
  },
  
  heading5: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.1,
  },
  
  // Body Text - For readable content
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0,
  },
  
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0,
  },
  
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },
  
  bodyXSmall: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },
  
  // Labels & UI Elements
  labelLarge: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.1,
  },
  
  labelMedium: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.1,
  },
  
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.2,
  },
  
  // Button Text
  buttonLarge: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.1,
  },
  
  buttonMedium: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.1,
  },
  
  buttonSmall: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.15,
  },
  
  // Special Cases
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },
  
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
}
```

### Implementation Guidelines

#### Font Loading
All fonts are loaded at app startup via the main `_layout.tsx` using Expo Google Fonts:

```typescript
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
```

#### Usage in Components
Import and use the typography constants throughout your app:

```typescript
import { TYPOGRAPHY } from '../constants/Typography';

// Example usage
const styles = StyleSheet.create({
  heroTitle: {
    ...TYPOGRAPHY.hero,
    color: '#A855F7',
    textAlign: 'center',
  },
  sectionHeading: {
    ...TYPOGRAPHY.heading2,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  bodyText: {
    ...TYPOGRAPHY.bodyMedium,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
```

#### Typography Hierarchy Guidelines

#### **✨ Refined Content Hierarchy (Recommended)**
*Use these for visually coherent interface design with proper font family consistency:*

**Content Structure** - All Nunito Sans for consistent visual hierarchy
- `contentTitle` - Primary content titles like job roles (26px - Nunito Sans Bold)
- `pageTitle` - Navigation and page titles (22px - Nunito Sans Bold) 
- `sectionHeader` - Section headings like "Interview Stages" (18px - Nunito Sans SemiBold)
- `itemTitle` - Individual item titles within sections (16px - Nunito Sans Medium)

**Interface Elements** - All Inter for UI consistency
- Use `bodyLarge`, `bodyMedium`, `labelMedium`, `buttonMedium` etc. for all UI text
- Company names, metadata, descriptions use Inter variants
- Buttons, forms, navigation use Inter variants

**Why This Works Better:**
- **Visual Coherence**: Similar hierarchy levels use the same font family
- **Clear Differentiation**: 4px+ size differences between each level  
- **Consistent Application**: Content structure = Space Grotesk, Interface = Inter
- **Mobile Optimized**: Proper sizing for iOS/Android readability

#### **Legacy System (For Reference)**

**Hero & Display** - Use for major brand moments and onboarding screens
- `hero` - Main app title, onboarding heroes (56px)
- `displayLarge` - Major section titles (36px)
- `displaySmall` - Screen titles, important headings (28px)

**Headings** - Use for content organization
- `heading1` - Main page titles (24px - Space Grotesk)
- `heading2` - Section headings (22px - Space Grotesk)  
- `heading3` - Subsection headings (20px - Space Grotesk)
- `heading4` - Component titles (18px - Inter)
- `heading5` - Small headings, card titles (16px - Inter)

**Body Text** - Use for readable content
- `bodyLarge` - Emphasized content (18px)
- `bodyMedium` - Primary body text (16px)
- `bodySmall` - Secondary information (14px)
- `bodyXSmall` - Captions, meta information (12px)

**UI Elements** - Use for interface components
- `buttonLarge` - Primary CTAs (18px)
- `buttonMedium` - Standard buttons (16px)
- `labelMedium` - Form labels, navigation (14px)
- `caption` - Timestamps, helper text (12px)

### Accessibility Considerations

- **Minimum Size**: No text below 12px for accessibility compliance
- **Line Height**: Optimized ratios (1.4-1.6) for comfortable reading
- **Letter Spacing**: Carefully tuned for each size to optimize readability
- **Color Contrast**: Always maintain WCAG AA contrast ratios (4.5:1 minimum)
- **Responsive Scaling**: Typography scales appropriately on different screen sizes

### Font Performance

- **Preloaded**: All fonts loaded at app startup, preventing FOUC (Flash of Unstyled Content)
- **Optimized Variants**: Only necessary font weights included to minimize bundle size
- **Fallbacks**: Graceful degradation to system fonts if loading fails

## 📏 Spacing & Layout

### Spacing Scale
```typescript
spacing: {
  0: 0,
  1: 4,    // 0.25rem
  2: 8,    // 0.5rem
  3: 12,   // 0.75rem
  4: 16,   // 1rem
  5: 20,   // 1.25rem
  6: 24,   // 1.5rem
  7: 28,   // 1.75rem
  8: 32,   // 2rem
  9: 36,   // 2.25rem
  10: 40,  // 2.5rem
  12: 48,  // 3rem
  14: 56,  // 3.5rem
  16: 64,  // 4rem
  20: 80,  // 5rem
  24: 96,  // 6rem
  28: 112, // 7rem
  32: 128, // 8rem
  36: 144, // 9rem
  40: 160, // 10rem
  44: 176, // 11rem
  48: 192, // 12rem
  52: 208, // 13rem
  56: 224, // 14rem
  60: 240, // 15rem
  64: 256, // 16rem
  72: 288, // 18rem
  80: 320, // 20rem
  96: 384, // 24rem
}
```

### Border Radius
```typescript
borderRadius: {
  none: 0,
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 20,
  2xl: 24,
  3xl: 32,
  full: 9999,
}
```

### Layout Constants
```typescript
layout: {
  // Screen padding
  screenPadding: 20,
  screenPaddingLarge: 24,
  
  // Safe areas
  safeAreaTop: 44,    // iOS status bar
  safeAreaBottom: 34, // iOS home indicator
  
  // Content widths
  maxContentWidth: 420,
  maxTextWidth: 360,
  
  // Component heights
  buttonHeight: {
    small: 40,
    medium: 48,
    large: 56,
    xlarge: 64,
  },
  
  inputHeight: {
    small: 40,
    medium: 48,
    large: 56,
  },
  
  // Header heights
  headerHeight: 60,
  tabBarHeight: 84,
  
  // Minimum touch targets
  minTouchTarget: 44,
}
```

## 🎯 Component Specifications

### Button Variants

#### Primary Button (CTA) - Unique Pill Style
```typescript
buttonPrimary: {
  // Outer gradient border
  border: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
  borderWidth: 2,
  borderRadius: 28, // Fully rounded (height/2 = 56/2 = 28)
  height: 56,
  
  // Inner glassmorphic fill
  background: 'rgba(255, 255, 255, 0.08)', // Glass-like transparent fill
  
  shadow: {
    color: '#A855F7',
    offset: { width: 0, height: 4 },
    opacity: 0.3,
    radius: 12,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    background: 'rgba(255, 255, 255, 0.15)', // Slightly more opaque when pressed
    shadow: {
      opacity: 0.2,
      radius: 8,
    }
  }
}
```

**Implementation Note**: This uses a LinearGradient as the outer container (for gradient border) with a semi-transparent inner View (for the fill). The pill shape is achieved by setting borderRadius to exactly half the button height.

#### Secondary Button (Glass)
```typescript
buttonSecondary: {
  background: 'rgba(255, 255, 255, 0.15)',
  border: 'rgba(255, 255, 255, 0.20)',
  borderRadius: 12,
  height: 56,
  pressed: {
    background: 'rgba(255, 255, 255, 0.25)',
  }
}
```

#### Ghost Button
```typescript
buttonGhost: {
  background: 'transparent',
  border: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 12,
  height: 48,
  pressed: {
    background: 'rgba(255, 255, 255, 0.1)',
  }
}
```

### Input Fields
```typescript
input: {
  background: 'rgba(255, 255, 255, 0.10)',
  border: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 12,
  height: 56,
  padding: { horizontal: 16, vertical: 0 },
  focused: {
    border: 'rgba(168, 85, 247, 0.4)',
    shadow: {
      color: 'rgba(168, 85, 247, 0.25)',
      radius: 8,
    }
  },
  error: {
    border: 'rgba(239, 68, 68, 0.4)',
    shadow: {
      color: 'rgba(239, 68, 68, 0.25)',
      radius: 8,
    }
  }
}
```

### Cards
```typescript
card: {
  background: 'rgba(255, 255, 255, 0.12)',
  border: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 16,
  padding: 20,
  shadow: {
    color: '#000',
    offset: { width: 0, height: 2 },
    opacity: 0.1,
    radius: 4,
  }
}
```

### Modal/Sheet
```typescript
modal: {
  background: 'rgba(255, 255, 255, 0.15)',
  border: 'rgba(255, 255, 255, 0.20)',
  borderRadius: { topLeft: 24, topRight: 24 },
  backdrop: 'rgba(0, 0, 0, 0.5)',
  backdropBlur: 10,
}
```

## 🔧 Usage Guidelines

### Glassmorphic Best Practices

1. **Layering**: Use different opacity levels to create depth hierarchy
2. **Contrast**: Ensure text remains readable on glass surfaces
3. **Performance**: Use backdrop blur sparingly on mobile devices
4. **Accessibility**: Maintain WCAG contrast ratios (4.5:1 minimum)

### Typography Guidelines

1. **Hierarchy**: Use size and weight to create clear information hierarchy
2. **Readability**: Maintain comfortable line heights (1.4-1.6 for body text)
3. **Consistency**: Stick to the defined scale for consistent spacing
4. **Accessibility**: Ensure minimum font sizes (14px body text minimum)

### Color Usage

1. **Primary**: Use purple-to-pink gradient for main CTAs and important actions
2. **Accent**: Purple and cyan individually for highlights and interactive elements  
3. **Secondary**: Gold/amber for secondary actions and highlights
4. **Semantic**: Use semantic colors consistently for status indicators
5. **Glass**: White with varying opacity for glassmorphic effects

### Component States

All interactive components should have clear visual feedback:

1. **Default**: Base appearance
2. **Pressed/Active**: Slightly darker or scaled
3. **Disabled**: Reduced opacity and no interaction
4. **Loading**: Loading indicators for async actions

### Platform Considerations

#### iOS Specific
- Use native blur effects when possible
- Respect safe area insets
- Use haptic feedback for interactions

#### Android Specific  
- Reduce blur intensity for performance
- Use elevation for depth instead of complex shadows
- Material Design-inspired ripple effects

### Animation & Transitions

#### Standard Durations
```typescript
animations: {
  fast: 150,
  normal: 250,  
  slow: 350,
  extraSlow: 500,
}
```

#### Easing Curves
```typescript
easing: {
  ease: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
}
```

## 🚀 Enhanced Typography System (2024 Update)

### Major Typography Improvements

The Interview Coach design system has been significantly enhanced with a professional three-font hierarchy specifically optimized for career development and interview preparation applications.

#### New Font Hierarchy - Nunito Sans + Inter System

**Nunito Sans** → *Primary Content Font*
- Perfect for interview coaching: professional yet confidence-building
- Complements rounded audio bar logo with subtle curved characteristics
- Exceptional readability - originally designed for long-form reading
- Creates unified visual hierarchy across all content structure
- Used for: Hero titles, page titles, section headers, content titles

**Inter** → *Interface & UI Font*
- Industry-leading interface font, perfect partner to Nunito Sans
- Optimized for all UI contexts: buttons, forms, navigation, metadata
- Maintains excellent readability across all interface elements
- Used for: All UI text, forms, buttons, labels, supporting information

#### Implementation Benefits

✅ **Professional Aesthetic** - Creates trust and authority for interview coaching content  
✅ **Enhanced Readability** - Optimized font sizes, line heights, and spacing  
✅ **Scalable System** - 20+ predefined typography styles from hero (56px) to caption (12px)  
✅ **Accessibility Focused** - WCAG compliance with proper contrast and minimum sizes  
✅ **Performance Optimized** - Preloaded fonts prevent layout shifts  
✅ **Developer Experience** - Simple import and usage with TypeScript constants  

#### Migration from Previous System

The enhanced typography system maintains backward compatibility while introducing new capabilities:

- **Display Typography**: New hero and display sizes for impactful onboarding
- **Enhanced Hierarchy**: More granular heading levels for better content organization  
- **Improved Spacing**: Optimized line heights and letter spacing for mobile
- **Consistent Naming**: Clear, semantic naming convention for all typography styles

#### Files Updated

- `constants/Typography.ts` - Complete typography system with all styles
- `app/_layout.tsx` - Font loading configuration
- `DESIGN_SYSTEM.md` - Updated documentation and guidelines
- Onboarding screens - Applied new typography throughout flow

This enhanced design system provides a solid foundation for consistent, beautiful, and accessible interface design throughout the Interview Coach app while maintaining the stunning glassmorphic aesthetic and elevating the professional appearance to match the serious nature of career development.
