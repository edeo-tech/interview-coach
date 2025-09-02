import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useUpdateProfile } from '../../_queries/users/auth/users';
import { getNavigationDirection, setNavigationDirection } from '../../utils/navigationDirection';
import Colors from '../../constants/Colors';
import { TYPOGRAPHY } from '../../constants/Typography';
import useHapticsSafely from '../../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingJobRole = () => {
  const { data, updateData } = useOnboarding();
  const updateProfileMutation = useUpdateProfile();
  const [selectedIndustry, setSelectedIndustry] = useState(data.industry);
  const { impactAsync } = useHapticsSafely();

  // Animation values - exactly like profile-setup
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  

  // Entrance animation - exactly like profile-setup with direction awareness
  useFocusEffect(
    React.useCallback(() => {
      // Determine slide direction based on last navigation direction
      const slideInFrom = getNavigationDirection() === 'back' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      
      // Reset to slide-in position 
      contentTranslateX.setValue(slideInFrom);
      contentOpacity.setValue(0);
      
      // Add a brief pause before sliding in new content for a more relaxed feel - exactly like profile-setup
      setTimeout(() => {
        // Animate in content with gentle timing - exactly like profile-setup
        Animated.parallel([
          Animated.timing(contentTranslateX, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          })
        ]).start();
      }, 100);
    }, [])
  );

  const industries = [
    { id: 'technology', name: 'Technology', icon: 'laptop-outline' },
    { id: 'marketing', name: 'Marketing', icon: 'trending-up-outline' },
    { id: 'sales', name: 'Sales', icon: 'card-outline' },
    { id: 'finance', name: 'Finance', icon: 'calculator-outline' },
    { id: 'healthcare', name: 'Healthcare', icon: 'medical-outline' },
    { id: 'education', name: 'Education', icon: 'school-outline' },
    { id: 'consulting', name: 'Consulting', icon: 'business-outline' },
    { id: 'law', name: 'Law', icon: 'library-outline' },
    { id: 'engineering', name: 'Engineering', icon: 'construct-outline' },
    { id: 'media', name: 'Entertainment', icon: 'play-circle-outline' },
    { id: 'retail', name: 'Retail', icon: 'bag-outline' },
    { id: 'manufacturing', name: 'Manufacturing', icon: 'build-outline' },
    { id: 'government', name: 'Government', icon: 'shield-outline' },
    { id: 'nonprofit', name: 'Non-Profit', icon: 'heart-outline' },
    { id: 'real-estate', name: 'Real Estate', icon: 'home-outline' },
    { id: 'transportation', name: 'Transportation', icon: 'car-outline' },
    { id: 'construction', name: 'Construction', icon: 'construct-outline' },
    { id: 'other', name: 'Other', icon: 'help-circle-outline' },
  ];

  const proceedWithIndustry = (industryId: string) => {
    impactAsync(ImpactFeedbackStyle.Light);
    setSelectedIndustry(industryId);
    updateData('industry', industryId);
    
    // Save industry to user document
    updateProfileMutation.mutate({ industry: industryId });
    
    // Auto-continue after brief delay to show selection feedback - exactly like industry-struggle
    setTimeout(() => {
      // Set direction for next screen
      setNavigationDirection('forward');
      
      // Slide out to left (forward direction) - exactly like profile-setup
      Animated.parallel([
        Animated.timing(contentTranslateX, {
          toValue: -SCREEN_WIDTH,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Navigate after animation completes
        setTimeout(() => {
          router.push('/(onboarding)/industry-struggle');
        }, 100);
      });
    }, 600);
  };

  const handleBack = () => {
    // Set direction for previous screen
    setNavigationDirection('back');
    
    // Slide out to right (back direction) - exactly like profile-setup
    Animated.parallel([
      Animated.timing(contentTranslateX, {
        toValue: SCREEN_WIDTH,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setTimeout(() => {
        router.back();
      }, 100);
    });
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={7} 
          totalSteps={12}
          onBack={handleBack}
        />
        
        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Animated content container - exactly like profile-setup */}
          <Animated.View 
            style={[
              styles.animatedContent,
              {
                transform: [{ translateX: contentTranslateX }],
                opacity: contentOpacity,
              }
            ]}
          >
            <View style={styles.content}>
              <View style={styles.headerSection}>
                <Text style={styles.screenTitle}>What industry are you in?</Text>
                <Text style={styles.subtitle}>
                  We'll tailor advice to your field
                </Text>
              </View>
              
              <View style={styles.industryGrid}>
                {industries.map((industry) => (
                  <TouchableOpacity
                    key={industry.id}
                    style={[
                      styles.industryCard,
                      selectedIndustry === industry.id && styles.industryCardSelected
                    ]}
                    onPress={() => proceedWithIndustry(industry.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={industry.icon as any} 
                      size={20} 
                      color={selectedIndustry === industry.id ? Colors.brand.primary : Colors.text.tertiary} 
                    />
                    <Text 
                      style={[
                        styles.industryText,
                        selectedIndustry === industry.id && styles.industryTextSelected
                      ]}
                      numberOfLines={2}
                    >
                      {industry.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        
      </View>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  animatedContent: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  screenTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  industryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  industryCard: {
    width: '31%',
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    marginBottom: 8,
  },
  industryCardSelected: {
    backgroundColor: Colors.glass.purple,
  },
  industryText: {
    ...TYPOGRAPHY.labelSmall,
    color: Colors.text.tertiary,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  industryTextSelected: {
    color: Colors.brand.primary,
  },
  
});

export default OnboardingJobRole;