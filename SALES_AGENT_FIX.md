# Sales Agent Selection Fix

## Problem
When creating a sales interview, the system was still using the default ElevenLabs agent instead of the dedicated sales agent (`agent_9101k2qdcg74f6bteqwe4y2se5ct`), causing it to behave like a regular interview.

## Root Cause
1. **Frontend Agent Selection**: The mock-interview screen was always using `process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID` regardless of interview type
2. **Missing Interview Type Parameter**: The interview details page wasn't passing the interview type to the mock-interview screen
3. **API Data Loading Race Condition**: The interview data from API might not be loaded when agent selection happens

## Fixes Applied

### 1. Fixed Agent Selection Logic (`mock-interview.tsx`)
**Before:**
```typescript
const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;
```

**After:**
```typescript
// Select agent based on interview type (check both API data and URL params)
const interviewType = interviewData?.interview_type || params.interviewType as string;
const agentId = interviewType === 'sales' 
    ? 'agent_9101k2qdcg74f6bteqwe4y2se5ct'  // Sales agent
    : process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID; // Default agent
```

### 2. Pass Interview Type in Navigation (`details.tsx`)
**Before:**
```typescript
router.push({
  pathname: '/mock-interview',
  params: {
    companyName: interview.company,
    role: interview.role_title,
    // ... other params
  }
});
```

**After:**
```typescript
router.push({
  pathname: '/mock-interview',
  params: {
    companyName: interview.company,
    role: interview.role_title,
    interviewType: interview.interview_type || 'technical', // Added this
    // ... other params
  }
});
```

### 3. Updated All Interview Type References
- Interviewer profile selection
- Build interview prompt logic
- Instructions display
- Added fallback to URL params when API data isn't loaded yet

### 4. Enhanced Debugging
Added console logs to track:
- Interview type from API
- Interview type from URL params
- Final interview type used
- Selected agent ID
- Whether it's detected as sales interview

## Expected Behavior Now
1. **Sales Interview Creation**: When user creates a sales interview, `interview_type` is set to "sales"
2. **Agent Selection**: Mock interview screen detects sales type and uses `agent_9101k2qdcg74f6bteqwe4y2se5ct`
3. **Prospect Behavior**: AI behaves as Alex Martinez (Director of Operations) with sales-specific prompts
4. **Role Reversal**: User acts as salesperson, AI acts as prospect with objections

## Testing
Create a new sales interview and check the browser console for:
```
📝 Interview type from API: sales
📝 Interview type from params: sales
📝 Final interview type: sales
📝 AgentId: agent_9101k2qdcg74f6bteqwe4y2se5ct
📝 Is sales interview: true
```

The sales call should now use the correct agent and behave as a prospect rather than an interviewer.