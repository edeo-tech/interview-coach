import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  icon_name?: string;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  currentStep, 
  totalSteps,
  onBack,
  icon_name
}) => {
  // Goal-weighted progress calculation
  // Early steps get more weight to encourage users
  const calculateProgress = () => {
    // Updated weights for 17 total steps with better distribution
    const weights = [
      0.05, 0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48, 0.54, 0.60, 
      0.66, 0.72, 0.78, 0.84, 0.90, 0.96, 1.0
    ];
    return weights[Math.min(currentStep - 1, weights.length - 1)] || 0;
  };

  const progress = calculateProgress();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name={icon_name as any || "arrow-back"} size={24} color="#ffffff" />
      </TouchableOpacity>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <LinearGradient
            colors={['#F59E0B', '#F97316', '#EA580C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>
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
});

export default OnboardingProgress;