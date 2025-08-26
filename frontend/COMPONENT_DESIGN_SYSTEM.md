# Interview Coach Component Design System

A comprehensive design system extracted from the refined Job Details screen, providing consistent styling patterns for the entire Interview Coach app.

## 🎯 Design Principles

### Visual Hierarchy
- **Primary content** takes precedence over secondary details
- **Functional colors** (green, purple) reserved for status and interaction states
- **Progressive disclosure** with unlock/lock states for user guidance

### Interaction Feedback
- **Haptic feedback** on all interactive elements
- **Visual state changes** with appropriate opacity and color shifts
- **Clear affordances** for touchable vs. non-touchable elements

---

## 🎨 Color System

### Text Hierarchy
```typescript
text: {
  primary: '#FFFFFF',                    // Main headings, key information
  secondary: 'rgba(255, 255, 255, 0.85)', // Supporting text, labels
  muted: 'rgba(255, 255, 255, 0.70)',     // Metadata, descriptions
  detail: '#d1d5db',                     // Minor details, supplementary info
}
```

### Functional Colors
```typescript
functional: {
  success: '#10b981',      // Progress indicators, completed states
  active: '#A855F7',       // Current/active states, primary CTAs
  warning: '#f59e0b',      // Warning states, attention needed
  muted: '#6b7280',        // Disabled, locked, inactive states
}
```

### Status Colors for Stage States
```typescript
stageStates: {
  completed: '#10b981',    // Green - successfully finished
  active: '#A855F7',       // Purple - current focus
  pending: '#6b7280',      // Gray - available but not active
  locked: '#4b5563',       // Darker gray - unavailable
}
```

---

## 📝 Typography Scale

### Content Hierarchy (Primary Information)
```typescript
content: {
  // Main page/section titles
  pageTitle: {
    typography: TYPOGRAPHY.pageTitle,    // 22px, bold
    color: text.primary,
    use: 'Screen titles, main headings'
  },
  
  // Section organization
  sectionHeader: {
    typography: TYPOGRAPHY.sectionHeader, // 18px, semibold
    color: text.primary,
    use: 'Section divisions, content groupings'
  },
  
  // Individual item titles
  itemTitle: {
    typography: TYPOGRAPHY.itemTitle,    // 16px, semibold
    color: text.primary,
    use: 'List items, card titles, individual entries'
  }
}
```

### Supporting Information
```typescript
supporting: {
  // Secondary content
  bodyMedium: {
    typography: TYPOGRAPHY.bodyMedium,   // 16px, regular
    color: text.secondary,
    use: 'Important supporting text, company names, descriptions'
  },
  
  // Minor details
  bodySmall: {
    typography: TYPOGRAPHY.bodySmall,    // 14px, regular
    color: text.detail,
    use: 'Metadata, location, seniority, timestamps'
  },
  
  // Labels and UI elements
  labelMedium: {
    typography: TYPOGRAPHY.labelMedium,  // 14px, medium
    color: text.secondary,
    use: 'Form labels, button text, UI controls'
  }
}
```

---

## 🎭 Component Patterns

### 1. Screen Layout Pattern
```typescript
screenLayout: {
  structure: {
    background: 'ChatGPTBackground',
    safeArea: "edges={['left', 'right']}",
    scroll: 'ScrollView with paddingHorizontal: 20'
  },
  
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    backButton: 'Simple chevron-back, no container',
    title: 'pageTitle typography, left-aligned with button'
  }
}
```

### 2. Information Card Pattern
```typescript
informationCard: {
  // For primary content that needs visual grouping
  style: 'GlassStyles.card with 20-24px padding',
  use: 'Complex information that benefits from container',
  avoid: 'Static text-only content'
}
```

### 3. Content Section Pattern
```typescript
contentSection: {
  // For related information without visual containers
  spacing: 'marginBottom: 24-28px between sections',
  title: 'sectionHeader typography',
  content: 'Direct children without wrapper containers'
}
```

### 4. Metadata Pattern
```typescript
metadata: {
  layout: 'Vertical stack with 8px gap',
  items: {
    structure: 'Icon + Text in horizontal row',
    iconSize: 16,
    iconColor: 'text.muted',
    textStyle: 'bodySmall',
    gap: 6
  }
}
```

---

## 🔘 Interactive Elements

### Button Hierarchy

#### Primary Action (Pill Button)
```typescript
primaryButton: {
  structure: 'LinearGradient wrapper + TouchableOpacity inner',
  gradient: ['#A855F7', '#EC4899'],
  outer: {
    borderRadius: 28,
    padding: 2,
    height: 56
  },
  inner: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 26,
    height: 52
  },
  haptic: 'Haptics.ImpactFeedbackStyle.Medium'
}
```

#### Status Indicator Button (Solid Color)
```typescript
statusButton: {
  structure: 'Single TouchableOpacity',
  variants: {
    active: {
      backgroundColor: 'rgba(168, 85, 247, 0.3)',
      borderColor: '#A855F7',
      borderWidth: 2
    },
    completed: {
      backgroundColor: 'rgba(16, 185, 129, 0.3)',
      borderColor: '#10b981',
      borderWidth: 2
    }
  },
  borderRadius: 28, // Always pill-shaped
  haptic: 'Haptics.ImpactFeedbackStyle.Light'
}
```

#### Navigation Elements
```typescript
navigation: {
  backButton: {
    element: 'Simple TouchableOpacity + Ionicons',
    icon: 'chevron-back, 24px',
    haptic: 'Haptics.ImpactFeedbackStyle.Light'
  },
  
  listItem: {
    structure: 'TouchableOpacity with pill shape',
    background: 'GlassStyles.container',
    borderRadius: 50,
    padding: '14px vertical, 16px horizontal',
    haptic: {
      unlocked: 'Haptics.ImpactFeedbackStyle.Medium',
      locked: 'Haptics.NotificationFeedbackType.Warning'
    }
  }
}
```

---

## 📊 Progress & Status Patterns

### Progress Display
```typescript
progressPattern: {
  header: {
    layout: 'Horizontal row, space-between',
    title: 'sectionHeader typography',
    value: 'labelLarge typography, success color'
  },
  
  bar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    fillColor: functional.success,
    borderRadius: 4
  },
  
  subtext: 'bodyMedium, muted color'
}
```

### Stage/Step States
```typescript
stageStates: {
  number: {
    size: '32x32px circle',
    borderRadius: 16,
    variants: {
      default: 'rgba(255,255,255,0.1)',
      active: 'Purple opaque + solid border',
      completed: 'Green opaque + solid border',
      locked: 'Same as default but with overlay'
    }
  },
  
  lockOverlay: {
    position: 'absolute, covers entire item',
    background: 'rgba(0, 0, 0, 0.3)',
    icon: 'lock-closed, 24px, white, centered'
  }
}
```

---

## 💬 Modal & Popup Pattern

### Feedback Modal
```typescript
feedbackModal: {
  backdrop: 'rgba(0, 0, 0, 0.6)',
  container: {
    background: 'rgba(0, 0, 0, 0.85)', // Solid, not glass
    borderRadius: 20,
    padding: 24,
    maxWidth: 340
  },
  
  structure: {
    icon: 'Colored icon in circle background',
    title: 'pageTitle typography',
    message: 'bodyMedium, secondary color',
    button: 'statusButton pattern'
  },
  
  animation: 'fade',
  dismissal: 'Backdrop tap + explicit button'
}
```

---

## 🎯 Implementation Guidelines

### When to Use Containers
```typescript
useContainers: {
  // ✅ Good uses
  yes: [
    'Complex interactive elements (progress with multiple parts)',
    'Content that benefits from visual grouping',
    'Elements with multiple states or actions'
  ],
  
  // ❌ Avoid containers for
  no: [
    'Static text-only information',
    'Simple metadata (location, dates)',
    'Single-purpose display elements'
  ]
}
```

### Spacing System
```typescript
spacing: {
  sections: 'marginBottom: 24-28px',
  relatedItems: 'gap: 8-12px',
  unrelatedItems: 'gap: 16-20px',
  screenPadding: 'paddingHorizontal: 20px',
  componentPadding: '16-24px based on complexity'
}
```

### Haptic Feedback Rules
```typescript
haptics: {
  navigation: 'Light - for back buttons, dismissals',
  success: 'Medium - for successful actions, unlocked access',
  blocked: 'Warning - for locked/disabled actions',
  selection: 'Light - for non-critical selections'
}
```

---

## 🚀 Quick Implementation Checklist

### New Screen Setup
- [ ] Use `ChatGPTBackground` + `SafeAreaView`
- [ ] Add back button with light haptic
- [ ] Set screen title with `pageTitle` typography
- [ ] Use 20px horizontal padding on scroll container

### Content Organization
- [ ] Section headers use `sectionHeader` typography
- [ ] Primary info uses appropriate content hierarchy
- [ ] Secondary details use `bodySmall` for metadata
- [ ] Related items grouped with consistent spacing

### Interactive Elements
- [ ] All buttons have appropriate haptic feedback
- [ ] Use pill shapes (borderRadius = height/2) for buttons
- [ ] Status indicators use functional colors consistently
- [ ] Lock states implemented for restricted access

### Polish & Accessibility
- [ ] No text smaller than 14px for readability
- [ ] Functional colors used only for status/interaction
- [ ] Clear visual hierarchy from most to least important
- [ ] Appropriate contrast ratios maintained

---

This design system ensures that every screen in your app can achieve the same level of polish and consistency as the Job Details screen, while providing clear guidelines for when and how to use each pattern.