import React from 'react';

interface ConversationProviderProps {
    children: (conversation: any) => React.ReactNode;
    config: {
        onConnect?: () => void;
        onDisconnect?: () => void;
        onMessage?: (message: any) => void;
        onError?: (error: any) => void;
        clientTools?: Record<string, (parameters: unknown) => any>;
    };
}

// Mock conversation for SSR/web
const mockConversation = {
    startSession: async () => {
        console.warn('Mock conversation: startSession called (SSR/web environment)');
    },
    endSession: async () => {
        console.warn('Mock conversation: endSession called (SSR/web environment)');
    }
};

// Try to import useConversation hook
let useConversation: any = null;

try {
    // This will fail during SSR but succeed on native
    const elevenLabsModule = require('@elevenlabs/react-native');
    useConversation = elevenLabsModule.useConversation;
} catch (e) {
    // Silently ignore - we'll use the mock
    console.log('useConversation not available - likely running in SSR/web context');
}

export default function MockInterviewConversation({ children, config }: ConversationProviderProps) {
    // If we have the real hook, use it
    if (useConversation) {
        const conversation = useConversation(config);
        return <>{children(conversation)}</>;
    }
    
    // Otherwise use the mock
    return <>{children(mockConversation)}</>;
}