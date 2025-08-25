# Interview Coach Design System

A minimal, elegant design system inspired by our welcome screen aesthetic. Clean typography, subtle glassmorphic elements, and plenty of whitespace create a sophisticated, distraction-free experience that puts content first.

## 🎨 Color Philosophy

### Design Approach
Our color system prioritizes clarity and elegance over complexity. We use minimal colors with maximum impact, allowing the beautiful gradient background to be the hero while content remains crystal clear.

### Core Colors
```typescript
colors: {
  // Background is handled by ChatGPTBackground component
  // Pure whites for maximum clarity
  white: '#FFFFFF',
  
  // Brand purple - our primary accent
  brand: {
    primary: '#A855F7',     // Main purple from welcome screen
    secondary: '#8B5CF6',   // Slightly deeper for variety
  },
  
  // Functional colors - minimal palette
  accent: {
    gold: '#F59E0B',        // Secondary actions (from welcome screen)
    cyan: '#06B6D4',        // Info/links when needed
    pink: '#EC4899',        // Rarely used, gradient accent only
  }
}
```

### Text Colors
```typescript
text: {
  primary: '#FFFFFF',                      // Pure white for main content
  secondary: 'rgba(255, 255, 255, 0.85)', // Slightly dimmed for secondary info
  tertiary: 'rgba(255, 255, 255, 0.70)',  // Subtle for supporting text
  muted: 'rgba(255, 255, 255, 0.55)',     // Very subtle for hints/placeholders
  disabled: 'rgba(255, 255, 255, 0.35)',  // Disabled state
}
```

### Semantic Colors (Use Sparingly)
```typescript
semantic: {
  // Only use when absolutely necessary for user feedback
  success: '#22C55E',
  warning: '#F59E0B', // Uses our existing gold
  error: '#EF4444',
  info: '#06B6D4',    // Uses our existing cyan
}
```


## 🪟 Minimal Glass Effects

### Philosophy
Glass effects should be subtle and purposeful, never overwhelming. Our welcome screen shows perfect restraint - minimal glass, maximum clarity.

### Glass Styles
```typescript
glass: {
  // Subtle containers - use sparingly
  subtle: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
  },
  
  // Modal/sheet backgrounds
  modal: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 24, // Top corners only for sheets
  },
  
  // Interactive states
  interactive: {
    default: 'rgba(255, 255, 255, 0.10)',
    pressed: 'rgba(255, 255, 255, 0.20)',
    disabled: 'rgba(255, 255, 255, 0.05)',
  }
}
```

## ✍️ Typography

### Philosophy
Our typography reflects the welcome screen's elegant simplicity. Clean, readable fonts with generous spacing and thoughtful hierarchy. Less is more.

### Font Stack
```typescript
fonts: {
  display: 'SpaceGrotesk', // For hero text and brand elements
  body: 'Inter',           // For all other text
}
```

### Type Scale (Simplified)
```typescript
typography: {
  // Hero text (like welcome screen)
  hero: {
    fontSize: 48,          // "nextround" brand text
    fontWeight: '800',
    fontFamily: 'SpaceGrotesk',
    lineHeight: 60,
    color: '#A855F7',      // Brand purple
  },
  
  // Main message text (like "Get to the")
  title: {
    fontSize: 28,
    fontWeight: '300',     // Light weight for elegance
    fontFamily: 'SpaceGrotesk',
    letterSpacing: 1,
    lineHeight: 36,
    color: '#FFFFFF',
  },
  
  // Standard headings
  heading: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk',
    lineHeight: 30,
    color: '#FFFFFF',
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 24,
    color: '#FFFFFF',
  },
  
  // Supporting text
  supporting: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.70)',
  },
  
  // Button text
  button: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    lineHeight: 22,
    letterSpacing: 0.005,
  },
  
  // Small/subtle text (like "Already have an account?")
  subtle: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.65)',
  }
}
```

## 📏 Spacing & Layout

### Philosophy
Generous whitespace creates breathing room and elegance. Our welcome screen demonstrates perfect spacing - nothing feels cramped.

### Core Spacing
```typescript
spacing: {
  xs: 8,    // Tight spacing
  sm: 16,   // Standard spacing
  md: 24,   // Comfortable spacing
  lg: 32,   // Generous spacing
  xl: 48,   // Hero spacing
  xxl: 60,  // Major section breaks (like welcome screen message)
}
```

### Layout Constants
```typescript
layout: {
  // Screen padding - consistent with welcome screen
  screenPadding: 24,
  
  // Content constraints
  maxContentWidth: 320,  // Keep content focused, like welcome text
  
  // Component dimensions
  buttonHeight: 56,      // Standard from welcome screen
  inputHeight: 48,       // Slightly shorter for visual hierarchy
  componentMaxWidth: 320, // Consistent width for inputs, buttons, and content
  iconSize: 120,         // Logo size from welcome screen
  
  // Border radius - minimal options
  radius: {
    sm: 12,   // Inputs, cards
    md: 16,   // Larger elements
    lg: 24,   // Modals (top corners)
    pill: 28, // Buttons (56/2 = 28)
  }
}
```

## 🎯 Component Patterns

### Button Hierarchy

#### Primary CTA (Welcome Screen Style)
```typescript
primaryButton: {
  // Exact style from welcome screen
  width: '100%',
  maxWidth: 320,                                      // Consistent with inputs and content
  height: 56,
  borderRadius: 28,                                    // Full pill shape
  backgroundColor: 'rgba(168, 85, 247, 0.15)',       // Subtle purple fill
  borderWidth: 1,
  borderColor: 'rgb(169, 85, 247)',                   // Purple border
  
  // Typography
  fontSize: 18,
  fontWeight: '600',
  fontFamily: 'Inter',
  letterSpacing: 0.005,
  color: '#FFFFFF',
  
  // Shadow
  shadowColor: '#A855F7',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  
  // States
  pressed: { transform: [{ scale: 0.98 }] }
}
```

#### Secondary Actions
```typescript
secondaryButton: {
  // Minimal approach - just text
  backgroundColor: 'transparent',
  color: 'rgba(255, 255, 255, 0.70)',
  fontSize: 15,
  fontWeight: '400',
  fontFamily: 'Inter',
  
  pressed: { color: '#FFFFFF' }
}
```

### Input Fields
```typescript
input: {
  width: '100%',
  maxWidth: 320,                                      // Consistent with buttons and content
  height: 48,                                         // Slightly shorter than buttons for hierarchy
  borderRadius: 24,                                   // Pill shape (height/2)
  backgroundColor: 'rgba(255, 255, 255, 0.10)',
  borderColor: 'rgba(255, 255, 255, 0.20)',
  borderWidth: 1,
  paddingHorizontal: 20,
  
  fontSize: 18,
  fontFamily: 'Inter',
  color: '#FFFFFF',
  textAlign: 'center',
  
  focused: {
    borderColor: 'rgba(168, 85, 247, 0.4)',
  }
}
```

### Modal/Sheet (Welcome Screen Modal Style)
```typescript
modal: {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderColor: 'rgba(255, 255, 255, 0.20)',
  borderWidth: 1,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingHorizontal: 24,
  paddingTop: 16,
  
  // Handle
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  }
}
```

## 📖 Design Principles

### 1. Clarity Over Decoration
Our welcome screen proves that simple is powerful. Every element serves a purpose. Remove anything that doesn't directly help the user.

### 2. Generous Whitespace
Space is not wasted - it's intentional. Give content room to breathe, like the perfect spacing around our welcome message.

### 3. Consistent Patterns
Once you establish a pattern (like our button style), stick to it. Consistency reduces cognitive load.

### 4. Typography Hierarchy
Use size, weight, and color to guide the eye. Our welcome screen shows perfect hierarchy: logo → message → action.

### 5. Subtle Glass Effects
Glass should enhance, not overwhelm. If users notice the glass more than the content, you've used too much.

### 6. Progressive Disclosure
Show only what's needed. Our welcome screen modal is a perfect example - authentication options appear only when needed.

## 🎬 Animation Guidelines

### Philosophy
Animations should feel natural and purposeful, like our welcome screen's elegant entrance sequence.

```typescript
animations: {
  // Welcome screen timing
  entrance: 800,      // Logo, text, button animations
  interaction: 250,   // Button presses, state changes
  transition: 300,    // Screen transitions
  
  // Easing - smooth and natural
  easing: 'ease-out',
}
```

## 🎯 Implementation Notes

### Key Components to Replicate
1. **ChatGPTBackground**: Always use as the base (never override)
2. **Pill Buttons**: Perfect rounded buttons like welcome screen CTA
3. **Modal Sheets**: Glass panels with top radius and handle
4. **Centered Content**: Use welcome screen's content centering approach
5. **Minimal Glass**: Only when absolutely necessary for grouping

### What to Avoid
- Complex color schemes (stick to white + purple + gold)
- Heavy glass effects (keep them subtle)
- Cramped layouts (follow welcome screen's generous spacing)
- Unnecessary decorations (every element must have purpose)
- Breaking the established button and modal patterns

This design system captures the essence of our perfect welcome screen - elegant, minimal, and focused on what matters most: helping users succeed in their interviews.