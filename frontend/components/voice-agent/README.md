# Voice Agent Components

This folder contains ElevenLabs voice agent integration components for future use in the application.

## Overview

The voice agent system uses ElevenLabs conversational AI with LiveKit for real-time voice communication. Components are preserved here for future integration into the fintech app.

## Components

### `MockInterviewConversation.tsx`
Core wrapper component for ElevenLabs `useConversation` hook. Provides graceful fallback for web/SSR environments.

**Features:**
- LiveKit WebRTC integration
- Real-time conversation management
- Message transcript handling
- Connection state management
- Graceful SSR/web fallbacks

### `TranscriptView.tsx`
Component for displaying conversation transcripts with user and agent messages.

## Frontend-Only Usage (No Backend Required)

Previously, the voice agent required backend authentication and conversation token generation. Now it can run directly from the frontend using ElevenLabs public agents.

### Setup

1. **Install Dependencies** (already in package.json):
```json
{
  "@elevenlabs/react-native": "^0.2.1",
  "@livekit/react-native": "^2.9.1",
  "@livekit/react-native-webrtc": "^137.0.1",
  "livekit-client": "^2.15.4"
}
```

2. **Configure ElevenLabs Public Agent**:
Create a public agent in your ElevenLabs dashboard and get the agent ID.

3. **Add Environment Variables**:
```env
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here
```

### Example Usage

```tsx
import { useState } from 'react';
import { View, Button, Text } from 'react-native';
import MockInterviewConversation from '@/components/voice-agent/MockInterviewConversation';

export default function VoiceScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const handleMessage = (message: any) => {
    setMessages(prev => [...prev, message]);
  };

  const handleError = (error: any) => {
    console.error('Voice agent error:', error);
  };

  return (
    <View style={{ flex: 1 }}>
      <MockInterviewConversation
        config={{
          // For frontend-only usage with public agent:
          agentId: process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID,

          // OR use a signed URL from backend (if you still want auth):
          // signedUrl: conversationToken,

          onConnect: handleConnect,
          onDisconnect: handleDisconnect,
          onMessage: handleMessage,
          onError: handleError,

          // Optional: custom client tools
          clientTools: {
            // Define custom functions the agent can call
            // Example: { name: 'get_balance', description: '...', handler: async () => {...} }
          }
        }}
      />

      <View style={{ padding: 20 }}>
        <Text>Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
        <Button
          title={isConnected ? 'End Call' : 'Start Call'}
          onPress={isConnected ? handleDisconnect : handleConnect}
        />
      </View>

      {/* Display transcript */}
      <TranscriptView messages={messages} />
    </View>
  );
}
```

### Public vs Private Agents

**Public Agent (Frontend-Only):**
- No backend authentication required
- Agent ID is sufficient
- Anyone can connect to the agent
- Good for: demos, public-facing features, non-sensitive conversations

**Private Agent (Backend Required):**
- Requires backend to generate signed conversation tokens
- User authentication/authorization handled server-side
- Conversation history can be tied to user accounts
- Good for: personalized experiences, sensitive data, usage tracking

### Migration from Backend-Authenticated

If you previously used backend authentication:

**Old approach:**
```tsx
// Fetch token from backend
const { data } = await useGetConversationToken({
  interviewId,
  interviewType
});

<MockInterviewConversation
  config={{
    signedUrl: data.conversation_token,
    // ...
  }}
/>
```

**New approach (frontend-only):**
```tsx
// No backend call needed
<MockInterviewConversation
  config={{
    agentId: process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID,
    // ...
  }}
/>
```

## API Files

The `_api/voice-agent/` and `_queries/voice-agent/` folders contain the old backend integration code. These can be:
- Deleted if you only need frontend-only agents
- Kept if you plan to use private agents with backend authentication in the future

## Documentation

- [ElevenLabs Conversational AI](https://elevenlabs.io/docs/conversational-ai/overview)
- [ElevenLabs React Native SDK](https://github.com/elevenlabs/elevenlabs-react-native)
- [LiveKit React Native](https://docs.livekit.io/realtime/client-sdks/react-native/)

## Future Integration Ideas

1. **Financial Advisory Agent**: Voice-based financial advice
2. **Customer Support**: Voice chatbot for app support
3. **Voice Commands**: Voice-controlled navigation and transactions
4. **Language Support**: Multi-language voice interactions for Indian languages
5. **Voice Authentication**: Biometric voice verification for security
