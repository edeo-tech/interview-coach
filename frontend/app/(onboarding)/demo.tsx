import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MorphingBackground from '../../components/MorphingBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const SolutionFraming = () => {
  const { data } = useOnboarding();
  
  const handleContinue = () => {
    router.push('/(onboarding)/notifications');
  };

  const getPainPoint = () => {
    if (data.hasFailed && data.mainBlocker) {
      const painPoints = {
        prep: 'lack of preparation',
        nerves: 'interview anxiety',
        communication: 'poor communication',
        experience: 'limited experience',
        technical: 'technical gaps'
      };
      return painPoints[data.mainBlocker] || 'preparation challenges';
    }
    return 'interview confidence';
  };

  const industryName = data.industry ? data.industry.charAt(0).toUpperCase() + data.industry.slice(1) : 'your industry';
  const painPoint = getPainPoint();

  return (
    <MorphingBackground mode="static" style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={14} totalSteps={17} />
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.screenTitle}>Here's how we'll help</Text>
            
            <View style={styles.chainContainer}>
              <View style={styles.chainStep}>
                <View style={styles.stepCircle}>
                  <Ionicons name="book-outline" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.stepTitle}>Prepared</Text>
                <Text style={styles.stepDescription}>Structured practice with AI feedback</Text>
              </View>

              <View style={styles.arrow}>
                <Ionicons name="arrow-down" size={20} color="rgba(255, 255, 255, 0.5)" />
              </View>

              <View style={styles.chainStep}>
                <View style={styles.stepCircle}>
                  <Ionicons name="shield-checkmark" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.stepTitle}>Confident</Text>
                <Text style={styles.stepDescription}>Feel ready for any question</Text>
              </View>

              <View style={styles.arrow}>
                <Ionicons name="arrow-down" size={20} color="rgba(255, 255, 255, 0.5)" />
              </View>

              <View style={styles.chainStep}>
                <View style={styles.stepCircle}>
                  <Ionicons name="chatbubbles" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.stepTitle}>Clear Communication</Text>
                <Text style={styles.stepDescription}>Articulate your value effectively</Text>
              </View>

              <View style={styles.arrow}>
                <Ionicons name="arrow-down" size={20} color="rgba(255, 255, 255, 0.5)" />
              </View>

              <View style={[styles.chainStep, styles.finalStep]}>
                <View style={[styles.stepCircle, styles.finalCircle]}>
                  <Ionicons name="trophy" size={24} color="#ffffff" />
                </View>
                <Text style={[styles.stepTitle, styles.finalTitle]}>Next Round</Text>
                <Text style={styles.stepDescription}>Land the job you want</Text>
              </View>
            </View>

            <View style={styles.personalizedContainer}>
              <Text style={styles.personalizedText}>
                For people in {industryName} with {painPoint}, structured prep increases confidence dramatically.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>I'm ready to start</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
  },
  chainContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  chainStep: {
    alignItems: 'center',
    maxWidth: 200,
  },
  stepCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  finalCircle: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  finalTitle: {
    color: '#10B981',
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  arrow: {
    paddingVertical: 16,
  },
  finalStep: {
    marginTop: 4,
  },
  personalizedContainer: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  personalizedText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default SolutionFraming;