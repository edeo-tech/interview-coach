import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeFeatureFlags } from '../config/featureFlags';
import { useSplashScreen } from '@/context/splash/SplashScreenContext';
import SplashTransition from '@/components/SplashTransition';

export default function Main() {
    const { showTransition, setShowTransition } = useSplashScreen();
    const [transitionComplete, setTransitionComplete] = useState(false);
    
    useEffect(() => {
        // Initialize feature flags on app startup
        initializeFeatureFlags().catch(console.warn);
    }, []);

    const handleTransitionComplete = () => {
        setTransitionComplete(true);
        setShowTransition(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <Slot />
            {showTransition && !transitionComplete && (
                <SplashTransition onTransitionComplete={handleTransitionComplete} />
            )}
        </View>
    );
};
