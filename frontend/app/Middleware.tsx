import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from '@/context/authentication/AuthContext';
import { CustomerInfoProvider } from '@/context/purchases/CustomerInfo';
import { ModalPortalProvider } from '@/context/modals/ModalPortalContext';

interface MiddlewareProps {
    children: React.ReactNode;
}

const Middleware: React.FC<MiddlewareProps> = ({ children }) => {
    return (
        <AuthProvider>
            {/* <CustomerInfoProvider> */}
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <ModalPortalProvider>
                            {children}
                    </ModalPortalProvider>
                </GestureHandlerRootView>
            {/* </CustomerInfoProvider> */}
        </AuthProvider>
    );
};

export default Middleware;
