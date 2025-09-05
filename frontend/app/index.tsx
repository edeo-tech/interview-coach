import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authentication/AuthContext';
import { useIsUserEntitled } from '@/hooks/purchases/useIsUserEntitled';
import Colors from '@/constants/Colors';

export default function Index() {
    const router = useRouter();
    const { auth, authLoading } = useAuth();
    const isUserEntitled = useIsUserEntitled();

    useEffect(() => {
        if (authLoading) return; // Wait for auth to load

        if (!auth?.id) {
            // User not authenticated, redirect to welcome
            router.replace('/(auth)/welcome');
            return;
        }

        // User is authenticated
        if (isUserEntitled) {
            // User has premium, go to home
            router.replace('/(app)/(tabs)/home');
        } else {
            // User doesn't have premium, go to onboarding
            router.replace('/(onboarding)/profile-setup');
        }
    }, [auth?.id, authLoading, isUserEntitled, router]);

    // Show loading while determining route
    return (
        <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#000' 
        }}>
            <ActivityIndicator size="large" color={Colors.brand.primary} />
        </View>
    );
}