# Typography Hierarchy Guide - UX Design Principles

## 🎯 **Welcome Screen Typography** (Updated)

### **Visual Hierarchy:**
1. **"nextround"** → `TYPOGRAPHY.welcomeHero` → **48px, Nunito Bold** (HERO)
2. **"Get to the"** → `TYPOGRAPHY.welcomeIntro` → **30px, Nunito SemiBold** (INTRO)  
3. **"Start practicing now"** → `TYPOGRAPHY.primaryCTA` → **18px, Nunito SemiBold** (PRIMARY CTA)

### **Design Rationale:**
- **48px hero text** creates dominant brand presence and memorable impact
- **30px intro text** provides supporting context without competing 
- **18px button text** ensures high readability for the primary action
- **Nunito font family** throughout maintains brand consistency
- **Proper letter-spacing** (-1, -0.5, +0.2) optimizes readability at each size

## 📊 **Typography System Improvements**

### **Enhanced Button Hierarchy:**
- `primaryCTA` (18px) - For most important actions (welcome, signup, primary CTAs)
- `buttonLarge` (18px) - For important actions (Updated from 16px)
- `buttonMedium` (15px) - For secondary actions
- `buttonSmall` (14px) - For tertiary actions

### **Enhanced Display Hierarchy:**
- `welcomeHero` (48px) - For brand hero moments
- `displayLarge` (36px) - For major page titles
- `displayMedium` (30px) - For section titles
- `welcomeIntro` (30px) - For welcome supporting text
- `displaySmall` (28px) - For smaller headings (Updated from 24px)

## 🎨 **UX Design Principles Applied**

### **1. Visual Impact Ladder**
```
HERO (48px) → INTRO (30px) → CTA (18px)
     ↓            ↓           ↓
  Brand Focus → Context → Action
```

### **2. Reading Flow**
- **Eye catches "nextround"** (largest, branded color)
- **Reads "Get to the"** (medium size, white)
- **Takes action** (clear button, good contrast)

### **3. Responsive Considerations**
- All sizes work well on mobile (12px minimum maintained)
- Letter-spacing optimized for each size
- Line-height maintains ~120-125% for readability

### **4. Brand Consistency**
- **Nunito** for all brand/action elements (headings, buttons)
- **Inter** for all utility/content elements (body, captions)
- **Hierarchy rule:** Nunito is always larger/stronger than Inter

## 📱 **Implementation Strategy**

### **When to Use Each Style:**

**`welcomeHero`** - Only for:
- Main brand word on welcome screen
- Major product name displays
- Hero marketing moments

**`welcomeIntro`** - Only for:
- Welcome screen supporting text
- Onboarding hero introductions
- Marketing page subheadings

**`primaryCTA`** - Only for:
- Welcome screen main button
- Sign up buttons
- Purchase/upgrade buttons
- Primary conversion actions

**`buttonLarge`** - For:
- Important action buttons (but not primary conversion)
- Submit forms
- Navigate to next step
- Save/continue actions

This ensures **proper hierarchy** - the most important elements stand out while maintaining consistency across the app.

## 🔧 **Migration Notes**

- **18 files** use `buttonLarge` - these should remain unchanged to maintain hierarchy
- **Welcome screen** is the only screen using the new welcome-specific styles  
- **Future onboarding screens** can use `welcomeIntro` and `primaryCTA` as appropriate
- **Login/signup screens** can use `primaryCTA` for their main conversion buttons

The system now provides **clear visual hierarchy** while maintaining **systematic consistency**!