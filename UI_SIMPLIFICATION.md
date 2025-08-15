# Interview Type UI Simplification

## Changes Made

### Before: 4 Interview Options
- Technical
- Behavioral  
- Leadership
- Sales Call

### After: 2 Interview Options
- **Interview Screening Call** (represents the original mock interview experience)
- **Mock Sales Call** (the new sales simulation experience)

## Implementation Details

### 1. UI Changes (`create.tsx`)
- **Reduced Options**: Changed from 4 buttons in a grid to 2 full-width buttons in a column
- **Better Naming**: 
  - "Technical" → "Interview Screening Call" (more descriptive)
  - "Sales Call" → "Mock Sales Call" (consistent naming)
- **Updated Icons**: 
  - Interview Screening: `chatbubble-ellipses` (represents conversation)
  - Mock Sales Call: `trending-up` (represents sales growth)

### 2. Layout Improvements
- **Full-width buttons**: Each option now takes the full width for better visibility
- **Vertical layout**: Changed from flexWrap grid to column layout
- **Improved spacing**: Better padding and gap between options

### 3. Updated Descriptions
- **Interview Screening Call**: "Practice for your initial screening interview with technical, behavioral, and leadership questions tailored to your role"
- **Mock Sales Call**: Kept the existing sales-specific description with sales emoji

## Backend Compatibility
- **No backend changes needed**: The "technical" type still handles all traditional interview types (technical, behavioral, leadership)
- **Sales functionality preserved**: Sales interviews still use the dedicated agent and sales-specific logic
- **Existing data compatibility**: All existing interviews continue to work as before

## User Experience
- **Clearer choice**: Users now have a simple binary choice between interview types
- **Better understanding**: Names clearly indicate what each option provides
- **Maintained functionality**: All existing features work exactly as before

The UI now provides a cleaner, more intuitive interview type selection while preserving all the underlying functionality for both interview paths.