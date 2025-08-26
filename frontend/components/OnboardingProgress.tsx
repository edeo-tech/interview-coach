import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  icon_name?: string;
  shouldShowProgress?: boolean;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  currentStep, 
  totalSteps,
  onBack,
  icon_name,
  shouldShowProgress = true
}) => {
  // Progress calculation for screens 3-12 only (profile-setup to problems/analyzing)
  // Screen 3 (profile-setup) = 0%, Screen 12 (problems) = 100%
  const calculateProgress = () => {
    // Only show progress for steps 3-12 (profile-setup to analyzing screen)
    if (currentStep < 3) return 0; // Before profile-setup
    if (currentStep > 12) return 1; // After analyzing screen
    
    // Map steps 3-12 to progress 0-100%
    // Step 3 = 0%, Step 12 = 100%
    const progressStep = currentStep - 3; // Convert to 0-9 range
    const totalProgressSteps = 9; // Steps 3-12 = 10 steps (0-9)
    
    // Weighted progress for better UX - early steps get more weight
    const weights = [
      0.0,   // Step 3 (profile-setup-profile) = 0%
      0.15,  // Step 4 (profile-setup-name) = 15%
      0.25,  // Step 5 (profile-setup-age) = 25%
      0.30,  // Step 6 (section-transition) = 30%
      0.35,  // Step 7 (job-role) = 35%
      0.45,  // Step 8 (industry-struggle) = 45%
      0.55,  // Step 9 (past-outcomes) = 55%
      0.65,  // Step 10 (preparation-rating) = 65%
      0.75,  // Step 11 (communication-rating) = 75%
      0.85,  // Step 12 (nerves-rating) = 85%
      1.0    // Step 13 (problems/analyzing) = 100%
    ];
    
    return weights[progressStep] || 0;
  };

  const progress = calculateProgress();
  
  // Calculate previous step's progress for smooth transitions
  const calculatePreviousProgress = () => {
    if (currentStep <= 3) return 0;
    if (currentStep > 12) return 1;
    
    const previousStep = currentStep - 1;
    const progressStep = previousStep - 3;
    
    const weights = [
      0.0, 0.15, 0.25, 0.30, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 1.0
    ];
    
    return weights[progressStep] || 0;
  };

  const previousProgress = calculatePreviousProgress();
  
  // Initialize animated value with previous progress to create smooth transition
  const progressWidth = useRef(new Animated.Value(previousProgress * 100)).current;

  // Animate progress bar when component mounts or currentStep changes
  useEffect(() => {
    // Small delay to ensure smooth transition after navigation
    const timer = setTimeout(() => {
      Animated.timing(progressWidth, {
        toValue: progress * 100,
        duration: 800, // Smooth 800ms animation
        useNativeDriver: false, // Width animations require layout animations
      }).start();
    }, 100); // 100ms delay for smoother visual transition

    return () => clearTimeout(timer);
  }, [progress]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Don't show progress bar for screens after analyzing (step 12)
  const showProgressBar = shouldShowProgress && currentStep <= 12;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name={icon_name as any || "arrow-back"} size={24} color="#ffffff" />
      </TouchableOpacity>
      
      {showProgressBar && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View style={[styles.progressFill, { width: progressWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp'
            }) }]}>
              <LinearGradient
                colors={['#F59E0B', '#F97316', '#EA580C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              />
            </Animated.View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    height: 8,
  },
  progressBackground: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  gradient: {
    flex: 1,
    borderRadius: 4,
  },
});

export default OnboardingProgress;