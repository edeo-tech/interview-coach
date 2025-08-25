import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MorphingBackground from '../../components/MorphingBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingJobRole = () => {
  const { data, updateData } = useOnboarding();
  const [selectedIndustry, setSelectedIndustry] = useState(data.industry);

  // Animation values - initialized in off-screen state to prevent double appearance
  const contentTranslateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;

  // Smart entrance animation - content already starts off-screen
  React.useEffect(() => {
    // Brief delay then animate in (content already positioned off-screen)
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentTranslateX, {
          toValue: 0,
          duration: 380, // 450ms → 380ms
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 340, // 400ms → 340ms
          useNativeDriver: true,
        }),
      ]).start();

      // Button animates in with slight delay for cascade effect
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 300, // 350ms → 300ms
            useNativeDriver: true,
          }),
          Animated.timing(buttonTranslateY, {
            toValue: 0,
            duration: 340, // 400ms → 340ms
            useNativeDriver: true,
          }),
        ]).start();
      }, 120);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

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
      
      // Animate out before navigation
      Animated.parallel([
        Animated.timing(contentTranslateX, {
          toValue: -SCREEN_WIDTH,
          duration: 520, // 600ms → 520ms
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 430, // 500ms → 430ms
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 350, // 400ms → 350ms
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 30,
          duration: 430, // 500ms → 430ms
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Navigate after animation completes
        setTimeout(() => {
          router.push('/(onboarding)/industry-struggle');
        }, 100);
      });
    }
  };

  return (
    <MorphingBackground mode="static" style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={7} totalSteps={17} />
        
        <ScrollView 
          style={styles.scrollContent} 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                transform: [{ translateX: contentTranslateX }],
                opacity: contentOpacity,
              },
            ]}
          >
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
                    color={selectedIndustry === industry.id ? '#A855F7' : 'rgba(255, 255, 255, 0.7)'} 
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
          </Animated.View>
        </ScrollView>

        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          <TouchableOpacity 
            style={[styles.continueButton, !selectedIndustry && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!selectedIndustry}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </MorphingBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: 'transparent',  // Ensure container is transparent
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100, // Space for button container - prevents content from going behind
  },
  content: {
    paddingHorizontal: 24,  // Design system standard
    paddingVertical: 20,
  },
  screenTitle: {
    fontSize: 24,           // Design system heading size
    fontWeight: '600',      // Design system heading weight
    fontFamily: 'SpaceGrotesk', // Design system heading font
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 30,         // Design system heading line height
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',      // Design system body weight
    fontFamily: 'Inter',    // Design system body font
    color: 'rgba(255, 255, 255, 0.70)', // Design system tertiary text
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,         // Design system body line height
    paddingHorizontal: 16,  // Add padding instead of maxWidth
  },
  industryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  industryCard: {
    width: '47%',           // Slightly smaller to ensure 2 columns fit
    backgroundColor: 'rgba(255, 255, 255, 0.10)', // Design system glass subtle
    borderRadius: 12,       // Design system sm radius
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)', // Design system glass border
    minHeight: 100,
    justifyContent: 'center',
    marginBottom: 12,       // Vertical spacing between rows
  },
  industryCardSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)', // Design system purple
    borderColor: '#A855F7',                      // Design system brand primary
  },
  industryText: {
    color: 'rgba(255, 255, 255, 0.70)', // Design system tertiary
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',                 // Design system body font
    textAlign: 'center',
    marginTop: 8,
  },
  industryTextSelected: {
    color: '#A855F7',                    // Design system brand primary
  },
  bottomContainer: {
    paddingHorizontal: 24,               // Design system standard
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Proper safe area spacing
    paddingTop: 20,                      // Top spacing from content
    alignItems: 'center',                // Center the button
  },
  continueButton: {
    width: '100%',
    maxWidth: 320,                       // Design system constraint
    height: 56,                          // Design system button height
    borderRadius: 28,                    // Design system pill shape
    backgroundColor: 'rgba(168, 85, 247, 0.15)', // Design system purple background
    borderWidth: 1,
    borderColor: 'rgb(169, 85, 247)',    // Design system purple border
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#A855F7',              // Design system purple shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(168, 85, 247, 0.05)', // Design system disabled
    borderColor: 'rgba(169, 85, 247, 0.3)',
    shadowOpacity: 0,
  },
  continueButtonText: {
    fontSize: 18,                        // Design system button text
    lineHeight: 22,
    fontWeight: '600',                   // Design system button weight
    fontFamily: 'Inter',                 // Design system button font
    letterSpacing: 0.005,               // Design system button spacing
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default OnboardingJobRole;