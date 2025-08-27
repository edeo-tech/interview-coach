import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { getNavigationDirection, setNavigationDirection } from '../../utils/navigationDirection';
import Colors from '../../constants/Colors';
import { TYPOGRAPHY } from '../../constants/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingJobRole = () => {
  const { data, updateData } = useOnboarding();
  const [selectedIndustry, setSelectedIndustry] = useState(data.industry);

  // Animation values - exactly like profile-setup
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;

  // Entrance animation - exactly like profile-setup with direction awareness
  useFocusEffect(
    React.useCallback(() => {
      // Determine slide direction based on last navigation direction
      const slideInFrom = getNavigationDirection() === 'back' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      
      // Reset to slide-in position 
      contentTranslateX.setValue(slideInFrom);
      buttonTranslateY.setValue(30);
      contentOpacity.setValue(0);
      buttonOpacity.setValue(0);
      
      // Add a brief pause before sliding in new content for a more relaxed feel - exactly like profile-setup
      setTimeout(() => {
        // Animate in content and button together with gentle timing - exactly like profile-setup
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
          }),
          // Button animates in slightly after content starts, creating a nice cascade - exactly like profile-setup
          Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
              Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(buttonTranslateY, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              })
            ])
          ])
        ]).start();
      }, 100);
    }, [])
  );

  const industries = [
    { id: 'technology', name: 'Technology', icon: 'laptop-outline' },
    { id: 'marketing', name: 'Marketing', icon: 'trending-up-outline' },
    { id: 'sales', name: 'Sales', icon: 'handshake-outline' },
    { id: 'finance', name: 'Finance', icon: 'calculator-outline' },
    { id: 'healthcare', name: 'Healthcare', icon: 'medical-outline' },
    { id: 'education', name: 'Education', icon: 'school-outline' },
    { id: 'consulting', name: 'Consulting', icon: 'business-outline' },
    { id: 'other', name: 'Other', icon: 'help-circle-outline' },
  ];

  const handleContinue = () => {
    if (selectedIndustry) {
      updateData('industry', selectedIndustry);
      
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
        }),
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 30,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Navigate after animation completes
        setTimeout(() => {
          router.push('/(onboarding)/industry-struggle');
        }, 100);
      });
    }
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
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: 30,
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
          totalSteps={17}
          onBack={handleBack}
        />
        
        <ScrollView 
          style={styles.scrollContent} 
          contentContainerStyle={styles.scrollContentContainer}
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
              <Text style={styles.screenTitle}>What industry are you in?</Text>
              <Text style={styles.subtitle}>
                Which industry are you applying in? We'll tailor advice and prep to this field.
              </Text>
              
              <View style={styles.industryGrid}>
                {industries.map((industry) => (
                  <TouchableOpacity
                    key={industry.id}
                    style={[
                      styles.industryCard,
                      selectedIndustry === industry.id && styles.industryCardSelected
                    ]}
                    onPress={() => setSelectedIndustry(industry.id)}
                  >
                    <Ionicons 
                      name={industry.icon as any} 
                      size={32} 
                      color={selectedIndustry === industry.id ? Colors.brand.primary : Colors.text.tertiary} 
                    />
                    <Text style={[
                      styles.industryText,
                      selectedIndustry === industry.id && styles.industryTextSelected
                    ]}>
                      {industry.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.continueButton, !selectedIndustry && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!selectedIndustry}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </Animated.View>
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
    paddingBottom: 100, // Space for button container
  },
  animatedContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  screenTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 16,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  industryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  industryCard: {
    width: '47%',
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.backgroundSubtle,
    minHeight: 100,
    justifyContent: 'center',
    marginBottom: 12,
  },
  industryCardSelected: {
    backgroundColor: Colors.glass.purple,
    borderColor: Colors.brand.primary,
  },
  industryText: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.text.tertiary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  industryTextSelected: {
    color: Colors.brand.primary,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.glass.purple,
    borderWidth: 1,
    borderColor: Colors.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.glass.purpleSubtle,
    borderColor: Colors.glass.purpleLight,
    shadowOpacity: 0,
  },
  continueButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.text.primary,
    marginRight: 8,
  },
});

export default OnboardingJobRole;