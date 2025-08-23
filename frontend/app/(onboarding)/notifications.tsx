import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';

const ReassuranceDataProof = () => {
  const handleContinue = () => {
    router.push('/(onboarding)/reviews');
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={15} totalSteps={17} />
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.screenTitle}>Screen 15: Reassurance & Data Proof</Text>
            
            <View style={styles.statContainer}>
              <View style={styles.statCircle}>
                <Text style={styles.statNumber}>9x</Text>
                <Text style={styles.statLabel}>More Likely</Text>
              </View>
              <Text style={styles.statDescription}>
                Users who complete 8 mocks are 9x more likely to reach the next round.
              </Text>
            </View>

            <View style={styles.testimonialContainer}>
              <View style={styles.testimonialQuote}>
                <Ionicons name="chatbubble-ellipses" size={32} color="#A855F7" />
              </View>
              <Text style={styles.testimonialText}>
                "Sarah, Marketing: 'I froze in 3 real interviews. After 6 mocks, I landed an offer.'"
              </Text>
            </View>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>What You'll Get:</Text>
              
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={styles.benefitText}>AI-powered mock interviews</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={styles.benefitText}>Personalized feedback on every answer</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={styles.benefitText}>Industry-specific question preparation</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={styles.benefitText}>Confidence building through practice</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>I'm convinced!</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
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
  statContainer: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 3,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  statDescription: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
  },
  testimonialContainer: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  testimonialQuote: {
    alignItems: 'center',
    marginBottom: 16,
  },
  testimonialText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  benefitText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
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
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ReassuranceDataProof;