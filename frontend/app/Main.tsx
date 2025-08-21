import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initializeFeatureFlags } from '../config/featureFlags';
import { useSplashScreen } from '@/context/splash/SplashScreenContext';
import SplashTransition from '@/components/SplashTransition';

export default function Main() {
    const { showTransition, setShowTransition, setTransitionRendered } = useSplashScreen();
    const [transitionComplete, setTransitionComplete] = useState(false);
    
    useEffect(() => {
        // Initialize feature flags on app startup
        initializeFeatureFlags().catch(console.warn);
    }, []);

    const handleTransitionComplete = () => {
        console.log('🟢 MAIN: Transition animation complete');
        setTransitionComplete(true);
        setShowTransition(false);
    };

    // Notify splash context when transition component is rendered
    useEffect(() => {
        if (showTransition && !transitionComplete) {
            console.log('🟡 MAIN: Notifying splash context that transition is rendered');
            setTransitionRendered(true);
        }
    }, [showTransition, transitionComplete, setTransitionRendered]);

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <Slot />
            {showTransition && !transitionComplete && (
                <>
                    {console.log('🟡 MAIN: Rendering SplashTransition component')}
                    <SplashTransition onTransitionComplete={handleTransitionComplete} />
                </>
            )}
        </View>
    );
};
