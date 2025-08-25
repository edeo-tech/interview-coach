import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MorphingBackground from '../../components/MorphingBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnalyzingScreen = () => {
  const { data } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Screen-level animation values - only for exit animations
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  
  const analysisSteps = [
    { text: 'Identifying your interview blockers...', icon: 'search-outline' },
    { text: `Finding best strategies for ${data.industry || 'your industry'}...`, icon: 'bulb-outline' },
    { text: 'Building your personal prep roadmap...', icon: 'map-outline' },
  ];

  useEffect(() => {
    const animateStep = (stepIndex: number) => {
      setCurrentStep(stepIndex);
      
      // Fade in animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Animate through all steps
    const timeouts = [
      setTimeout(() => animateStep(0), 500),
      setTimeout(() => animateStep(1), 2500),
      setTimeout(() => animateStep(2), 4500),
      setTimeout(() => {
        // Animate out before navigation
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
        ]).start(() => {
          // Navigate after animation completes
          setTimeout(() => {
            router.push('/(onboarding)/solutions');
          }, 100);
        });
      }, 6400), // Start exit animation 600ms before original timeout
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [fadeAnim, data.industry]);

  return (
    <MorphingBackground mode="static" style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={12} totalSteps={17} />
        
        <Animated.View 
          style={[
            styles.content,
            {
              transform: [{ translateX: contentTranslateX }],
              opacity: contentOpacity,
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.loadingContainer}>
              <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}>
                <Ionicons 
                  name={analysisSteps[currentStep]?.icon as any || 'search-outline'} 
                  size={48} 
                  color="#A855F7" 
                />
              </Animated.View>
              <View style={styles.loadingDots}>
                {[0, 1, 2].map((dot) => (
                  <View 
                    key={dot} 
                    style={[
                      styles.dot, 
                      currentStep >= dot && styles.activeDot
                    ]} 
                  />
                ))}
              </View>
            </View>
          </View>
          
          <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
            <Text style={styles.screenTitle}>Analyzing your responses...</Text>
            <Text style={styles.analysisText}>
              {analysisSteps[currentStep]?.text || 'Analyzing...'}
            </Text>
          </Animated.View>
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
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: '#A855F7',
  },
  textContainer: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  analysisText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
    maxWidth: 280,
  },
});

export default AnalyzingScreen;