import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import { GlassStyles } from '../../constants/GlassStyles';
import * as Linking from 'expo-linking';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import { useAuth } from '../../context/authentication/AuthContext';
import { useCreateCheckoutSession, useCreateCustomerPortal } from '../../_queries/payments/stripe';

const Paywall = () => {
  const { posthogScreen } = usePosthogSafely();
  const { auth } = useAuth();
  const createCheckoutSession = useCreateCheckoutSession();
  const createCustomerPortal = useCreateCustomerPortal();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('paywall');
    }, [posthogScreen])
  );

  const handleUpgrade = async () => {
    try {
      const response = await createCheckoutSession.mutateAsync({
        success_url: `${Linking.createURL('')}premium-success`,
        cancel_url: `${Linking.createURL('')}paywall`,
      });
      
      // Open Stripe checkout
      await Linking.openURL(response.data.checkout_url);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to start checkout process. Please try again.');
      console.error('Checkout error:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await createCustomerPortal.mutateAsync(
        Linking.createURL('profile')
      );
      
      await Linking.openURL(response.data.portal_url);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to open customer portal. Please try again.');
      console.error('Portal error:', error);
    }
  };

  const features = [
    {
      icon: 'refresh',
      title: 'Unlimited Interview Retries',
      description: 'Practice the same interview as many times as you want until you perfect it',
      isRestricted: true,
    },
    {
      icon: 'analytics',
      title: 'Detailed Feedback & Scoring',
      description: 'Get comprehensive rubric scores, strengths, and improvement areas',
      isRestricted: true,
    },
    {
      icon: 'trending-up',
      title: 'Performance Tracking',
      description: 'Track your progress over time and see improvement metrics',
      isRestricted: false,
    },
    {
      icon: 'school',
      title: 'AI-Powered Interview Coach',
      description: 'Get personalized coaching tips based on your performance',
      isRestricted: false,
    },
  ];

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Upgrade to Premium</Text>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={24} color="#f59e0b" />
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
            <Text style={styles.heroTitle}>Unlock Your Interview Potential</Text>
            <Text style={styles.heroSubtitle}>
              Get unlimited practice, detailed feedback, and track your progress
            </Text>
          </View>

          {/* Pricing Card */}
          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.planName}>Premium Monthly</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>£19.99</Text>
                <Text style={styles.priceUnit}>/month</Text>
              </View>
            </View>
            <Text style={styles.pricingDescription}>
              Cancel anytime. No long-term commitment.
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[
                  styles.featureIcon,
                  { backgroundColor: feature.isRestricted ? '#f59e0b20' : '#10b98120' }
                ]}>
                  <Ionicons 
                    name={feature.icon as any} 
                    size={20} 
                    color={feature.isRestricted ? '#f59e0b' : '#10b981'} 
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                  {feature.isRestricted && (
                    <Text style={styles.restrictedLabel}>Premium Feature</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            {auth?.is_premium ? (
              <TouchableOpacity
                onPress={handleManageSubscription}
                disabled={createCustomerPortal.isPending}
                style={styles.primaryButton}
              >
                <Ionicons name="settings" size={20} color="white" />
                <Text style={styles.primaryButtonText}>
                  {createCustomerPortal.isPending ? 'Loading...' : 'Manage Subscription'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleUpgrade}
                disabled={createCheckoutSession.isPending}
                style={styles.primaryButton}
              >
                <Ionicons name="diamond" size={20} color="white" />
                <Text style={styles.primaryButtonText}>
                  {createCheckoutSession.isPending ? 'Loading...' : 'Upgrade to Premium'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              By subscribing, you agree to our Terms of Service and Privacy Policy. 
              Subscription automatically renews unless cancelled.
            </Text>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  premiumText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  pricingCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#f59e0b40',
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  priceUnit: {
    color: '#9ca3af',
    fontSize: 16,
    marginLeft: 4,
  },
  pricingDescription: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  restrictedLabel: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '500',
  },
  ctaSection: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
  },
  termsSection: {
    paddingHorizontal: 16,
  },
  termsText: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default Paywall;