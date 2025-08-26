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

### Font Stack
```typescript
fonts: {
  primary: 'Inter', // Main UI font - clean, readable
  heading: 'SpaceGrotesk', // Headers and display text - modern, unique
  mono: 'SF Mono', // Code and monospace needs
}
```

### Typography Scale
```typescript
typography: {
  // Display sizes for hero sections
  display: {
    large: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: '800',
      fontFamily: 'SpaceGrotesk',
      letterSpacing: -0.02,
    },
    medium: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '700',
      fontFamily: 'SpaceGrotesk',
      letterSpacing: -0.015,
    },
    small: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '700',
      fontFamily: 'SpaceGrotesk',
      letterSpacing: -0.01,
    }
  },

  // Heading hierarchy
  heading: {
    h1: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700',
      fontFamily: 'SpaceGrotesk',
      letterSpacing: -0.01,
    },
    h2: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '600',
      fontFamily: 'SpaceGrotesk',
      letterSpacing: -0.005,
    },
    h3: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '600',
      fontFamily: 'Inter',
      letterSpacing: 0,
    },
    h4: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600',
      fontFamily: 'Inter',
      letterSpacing: 0,
    },
    h5: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600',
      fontFamily: 'Inter',
      letterSpacing: 0,
    },
    h6: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      fontFamily: 'Inter',
      letterSpacing: 0,
    }
  },

  // Body text
  body: {
    large: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '400',
      fontFamily: 'Inter',
    },
    medium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      fontFamily: 'Inter',
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      fontFamily: 'Inter',
    },
    xsmall: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      fontFamily: 'Inter',
    }
  },

  // Labels and captions
  label: {
    large: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '500',
      fontFamily: 'Inter',
      letterSpacing: 0.01,
    },
    medium: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '500',
      fontFamily: 'Inter',
      letterSpacing: 0.01,
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      fontFamily: 'Inter',
      letterSpacing: 0.02,
    }
  },

  // Button text
  button: {
    large: {
      fontSize: 18,
      lineHeight: 22,
      fontWeight: '600',
      fontFamily: 'Inter',
      letterSpacing: 0.005,
    },
    medium: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600',
      fontFamily: 'Inter',
      letterSpacing: 0.005,
    },
    small: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600',
      fontFamily: 'Inter',
      letterSpacing: 0.01,
    }
  }
}
```

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

This design system provides a solid foundation for consistent, beautiful, and accessible interface design throughout the Interview Coach app while maintaining the stunning glassmorphic aesthetic.
