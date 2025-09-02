# Font Overhaul Plan - Nunito + Inter

## Overview
This document outlines the complete font overhaul strategy for the Interview Coach app, transitioning to a dual-font system using Nunito and Inter for improved brand consistency and readability.

## Font System Design

### Primary Font — Nunito (brand/expressive)
**Usage**: Voice & actions → headings, buttons, navigation, branded touchpoints
**Character**: Bold, friendly, approachable, brand-forward

#### Typography Specifications:
- **H1**: Bold (700), 28–32px, line-height ~120% (1.2)
- **H2**: SemiBold (600), 22–26px, line-height ~120% (1.2) 
- **H3**: SemiBold (600), 18–20px, line-height ~125% (1.25)
- **Buttons & Labels**: SemiBold (600), 14–16px, line-height ~125% (1.25)
- **Navigation**: SemiBold (600), 14–16px

### Secondary Font — Inter (readability/utility)
**Usage**: Readability & information → paragraphs, feedback, transcripts, lists, system text
**Character**: Clean, readable, neutral, functional

#### Typography Specifications:
- **Body Text**: Regular (400), 16px, line-height ~150% (1.5)
- **Secondary Text/Captions**: Regular (400), 14px, line-height ~140% (1.4)
- **Dense UI** (lists, feedback, transcripts): Regular (400), 12–14px, line-height ~135% (1.35)
- **Status/Helper Text**: Medium (500) or Regular (400), 12–14px, line-height ~130% (1.3)

## Usage Rules

### Hierarchy Principle
- **Nunito is always larger/stronger than Inter in the same view**
- Nunito = attention-grabbing, actionable elements
- Inter = consumable, readable content

### Content Guidelines
- **Nunito for**: Page titles, section headers, button labels, navigation items, CTAs, brand messaging
- **Inter for**: Paragraph text, descriptions, form labels, list items, captions, transcripts, feedback text, status messages

## Current State Analysis

### Existing Implementation
- ✅ Inter fonts already loaded and used for body text
- ❌ NunitoSans loaded instead of Nunito (mismatch)
- ❌ Typography.ts references unloaded NunitoSans fonts
- ✅ Good typography scale system in place
- ❌ Font usage doesn't match new plan specifications

### Files Requiring Updates
1. `hooks/useFonts.ts` - Update font loading
2. `constants/Fonts.ts` - Align with new system
3. `constants/Typography.ts` - Update specifications
4. Components throughout app - Systematic font application

## Implementation Strategy

### Phase 1: Foundation Setup
- [ ] Update font loading system to load Nunito (not NunitoSans)
- [ ] Create comprehensive font constants
- [ ] Update typography scale to match exact specifications
- [ ] Create utility functions for font application

### Phase 2: Core Typography System
- [ ] Design font variable system with proper TypeScript types
- [ ] Create typography utilities/helpers
- [ ] Ensure accessibility compliance (minimum 12px, proper contrast)
- [ ] Test font loading across platforms (iOS/Android/Web)

### Phase 3: Systematic Application
- [ ] Identify all text elements in the app
- [ ] Create migration mapping (current → new typography)
- [ ] Update components in priority order:
  1. Headers and titles (H1, H2, H3)
  2. Buttons and navigation
  3. Body text and paragraphs
  4. Form elements and labels
  5. Status and helper text

### Phase 4: Testing & Refinement
- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] Performance testing (font loading)
- [ ] Cross-platform consistency check

## Font Loading Requirements

### Nunito Weights Needed:
- `Nunito_600SemiBold` - For H2, H3, buttons, labels, navigation
- `Nunito_700Bold` - For H1 and strong emphasis
- `Nunito_400Regular` - For fallback/light brand text if needed

### Inter Weights Needed (already available):
- `Inter_400Regular` - Body text, captions, descriptions
- `Inter_500Medium` - Status text, emphasis
- `Inter_600SemiBold` - Optional for strong body emphasis

## Migration Safety

### Risk Mitigation:
- Update typography constants first before changing components
- Use feature flags if available for gradual rollout
- Test on real devices, not just simulators
- Maintain fallback fonts for loading states
- Preserve existing spacing and layout as much as possible

### Quality Assurance:
- Screenshot comparison testing
- Accessibility audit with screen readers
- Performance monitoring for font loading times
- User testing for readability improvements

## Success Metrics

### Visual Consistency:
- All headings use Nunito with proper weights
- All body text uses Inter consistently
- Clear hierarchy between Nunito and Inter elements

### Performance:
- Font loading time < 100ms on average
- No layout shift during font loading
- Proper fallback font display

### User Experience:
- Improved readability scores
- Consistent brand feel across all screens
- Enhanced visual hierarchy and information architecture

---

*This document will be updated as implementation progresses and issues are discovered.*