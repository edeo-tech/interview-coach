import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from '@/context/authentication/AuthContext';
import { CustomerInfoProvider } from '@/context/purchases/CustomerInfo';
import { ModalPortalProvider } from '@/context/modals/ModalPortalContext';

interface MiddlewareProps {
    children: React.ReactNode;
}

// Try to import ElevenLabsProvider, but don't fail if it's not available
let ElevenLabsProvider: React.ComponentType<{ children: React.ReactNode }> | null = null;

try {
    // This will fail during SSR but succeed on native
    const elevenLabsModule = require('@elevenlabs/react-native');
    ElevenLabsProvider = elevenLabsModule.ElevenLabsProvider;
} catch (e) {
    // Silently ignore - we'll just not use the provider
    console.log('ElevenLabsProvider not available - likely running in SSR/web context');
}

const Middleware: React.FC<MiddlewareProps> = ({ children }) => {
    const content = (
        <ModalPortalProvider>
            {children}
        </ModalPortalProvider>
    );

    return (
        <AuthProvider>
            <CustomerInfoProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    {ElevenLabsProvider ? (
                        <ElevenLabsProvider>
                            {content}
                        </ElevenLabsProvider>
                    ) : (
                        content
                    )}
                </GestureHandlerRootView>
            </CustomerInfoProvider>
        </AuthProvider>
    );
};

export default Middleware;