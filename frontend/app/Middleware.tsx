import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ModalPortalProvider } from '@/context/modals/ModalPortalContext';

interface MiddlewareProps {
    children: React.ReactNode;
}

// Try to import ElevenLabsProvider, but don't fail if it's not available (web/SSR)
let ElevenLabsProvider: React.ComponentType<{ children: React.ReactNode }> | null = null;

try {
    const elevenLabsModule = require('@elevenlabs/react-native');
    ElevenLabsProvider = elevenLabsModule.ElevenLabsProvider;
} catch (e) {
    // Silently ignore - ElevenLabs not available in web/SSR context
    console.log('ElevenLabsProvider not available - likely running in SSR/web context');
}

const Middleware: React.FC<MiddlewareProps> = ({ children }) => {
    const content = (
        <ModalPortalProvider>
            {children}
        </ModalPortalProvider>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {ElevenLabsProvider ? (
                <ElevenLabsProvider>
                    {content}
                </ElevenLabsProvider>
            ) : (
                content
            )}
        </GestureHandlerRootView>
    );
};

export default Middleware;