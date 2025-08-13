import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeFeatureFlags } from '../config/featureFlags';

export default function Main() {
    useEffect(() => {
        // Initialize feature flags on app startup
        initializeFeatureFlags().catch(console.warn);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <Slot />
        </View>
    );
};
