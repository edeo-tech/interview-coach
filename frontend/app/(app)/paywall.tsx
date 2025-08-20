import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import Purchases from 'react-native-purchases';

const Paywall = () => {
  const { posthogScreen } = usePosthogSafely();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('paywall');
    }, [posthogScreen])
  );

  useEffect(() => {
    const loadOfferings = async () => {
      if (Platform.OS === 'web') return;
      
      try {
        const offerings = await Purchases.getOfferings();
        console.log('RevenueCat Offerings:', offerings);
        
        if (offerings.current) {
          console.log('Current offering:', offerings.current);
          console.log('Available packages:', offerings.current.availablePackages);
          
          offerings.current.availablePackages.forEach((pkg) => {
            console.log(`Package: ${pkg.identifier}`);
            console.log(`Product: ${pkg.product.identifier}`);
            console.log(`Price: ${pkg.product.priceString}`);
          });
        } else {
          console.log('No current offering available');
        }
      } catch (error) {
        console.error('Error loading offerings:', error);
      }
    };

    loadOfferings();
  }, []);

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.paywallText}>Paywall</Text>
        </View>
      </SafeAreaView>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paywallText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default Paywall;