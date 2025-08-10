import React, { createContext, useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';

const ModalPortalContext = createContext<{
    showModal: (modal: React.ReactNode) => void,
    hideModal: () => void,
}>({
    showModal: () => {},
    hideModal: () => {},
});

export const ModalPortalProvider = ({ children }: { children: React.ReactNode }) =>
{
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    const showModal = (content: React.ReactNode) =>
    {
        setModalContent(content);
    }

    const hideModal = () =>
    {
        setModalContent(null);
    }

    return (
        <ModalPortalContext.Provider value={{ showModal, hideModal }}>
            {children}
            <View style={styles.modalContainer}>
                {modalContent}
            </View>
        </ModalPortalContext.Provider>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none',
    }
});

export const useModalPortal = () =>
{
    const context = useContext(ModalPortalContext);
    if (!context)
    {
        throw new Error('useModalPortal must be used within a ModalPortalProvider');
    }
    return context;
}
