import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const ProblemValidation = () => {
  const { data } = useOnboarding();
  
  const handleContinue = () => {
    router.push('/(onboarding)/demo');
  };

  const getPrimaryProblem = () => {
    if (data.hasFailed && data.mainBlocker) {
      const problems = {
        prep: 'preparation',
        nerves: 'nerves',
        communication: 'communication',
        experience: 'experience',
        technical: 'technical knowledge'
      };
      return problems[data.mainBlocker] || 'preparation';
    }
    return 'confidence';
  };

  const primaryProblem = getPrimaryProblem();
  const industryName = data.industry ? data.industry.charAt(0).toUpperCase() + data.industry.slice(1) : 'your field';

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={13} totalSteps={17} />
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.screenTitle}>Screen 13: Problem Validation</Text>
            
            <View style={styles.insightContainer}>
              <Text style={styles.insightText}>
                Based on what you told us, the #1 reason people don't get to the next round isn't credentials, it's <Text style={styles.highlightText}>{primaryProblem}</Text>.
              </Text>
            </View>

            <View style={styles.comparisonContainer}>
              <Text style={styles.comparisonTitle}>The Difference</Text>
              
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="close-circle" size={32} color="#EF4444" />
                    <Text style={styles.cardTitle}>Unprepared</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardItem}>• Wings it with generic answers</Text>
                    <Text style={styles.cardItem}>• Stumbles under pressure</Text>
                    <Text style={styles.cardItem}>• Lacks specific examples</Text>
                    <Text style={styles.cardItem}>• Misses follow-up opportunities</Text>
                  </View>
                </View>

                <View style={[styles.comparisonCard, styles.preparedCard]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                    <Text style={[styles.cardTitle, styles.preparedTitle]}>Prepared</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardItem}>• Tells compelling, relevant stories</Text>
                    <Text style={styles.cardItem}>• Stays calm and confident</Text>
                    <Text style={styles.cardItem}>• Uses concrete examples</Text>
                    <Text style={styles.cardItem}>• Asks insightful questions</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>I want to be prepared</Text>
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
    marginBottom: 24,
  },
  insightContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  insightText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
  },
  highlightText: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  comparisonContainer: {
    marginBottom: 24,
  },
  comparisonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  comparisonRow: {
    gap: 16,
  },
  comparisonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 12,
  },
  preparedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  preparedTitle: {
    color: '#10B981',
  },
  cardContent: {
    gap: 8,
  },
  cardItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
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

export default ProblemValidation;