import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const WorstCaseScenario = () => {
  const { data, updateData } = useOnboarding();
  const [selectedScenario, setSelectedScenario] = useState(data.worstCaseScenario);

  const scenarios = [
    { 
      id: 'freeze-up', 
      name: 'Freezing up and going blank', 
      icon: 'snow-outline',
      description: 'Mind goes completely empty when asked a question'
    },
    { 
      id: 'rambling', 
      name: 'Rambling without making a point', 
      icon: 'chatbubbles-outline',
      description: 'Talking in circles and losing the interviewer'
    },
    { 
      id: 'technical-failure', 
      name: 'Failing a technical question badly', 
      icon: 'code-slash-outline',
      description: 'Looking completely incompetent on technical topics'
    },
    { 
      id: 'awkward-silence', 
      name: 'Creating awkward silences', 
      icon: 'volume-mute-outline',
      description: 'Not knowing what to say and making it weird'
    },
    { 
      id: 'wrong-culture', 
      name: 'Coming across as a bad culture fit', 
      icon: 'people-outline',
      description: 'Saying something that makes them not want to work with me'
    },
    { 
      id: 'underselling', 
      name: 'Completely underselling myself', 
      icon: 'trending-down-outline',
      description: 'Not communicating my value and appearing weak'
    },
  ];

  const handleContinue = () => {
    if (selectedScenario) {
      updateData('worstCaseScenario', selectedScenario);
      router.push('/(onboarding)/problems');
    }
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={11} totalSteps={17} />
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.screenTitle}>Screen 11: Worst Case Scenario</Text>
            <Text style={styles.subtitle}>
              What's your biggest fear about your first interview?
            </Text>
            
            <View style={styles.scenariosContainer}>
              {scenarios.map((scenario) => (
                <TouchableOpacity
                  key={scenario.id}
                  style={[
                    styles.scenarioCard,
                    selectedScenario === scenario.id && styles.scenarioCardSelected
                  ]}
                  onPress={() => setSelectedScenario(scenario.id)}
                >
                  <View style={styles.scenarioHeader}>
                    <Ionicons 
                      name={scenario.icon as any} 
                      size={24} 
                      color={selectedScenario === scenario.id ? '#F59E0B' : 'rgba(255, 255, 255, 0.7)'} 
                    />
                    <Text style={[
                      styles.scenarioTitle,
                      selectedScenario === scenario.id && styles.scenarioTitleSelected
                    ]}>
                      {scenario.name}
                    </Text>
                  </View>
                  <Text style={styles.scenarioDescription}>
                    {scenario.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, !selectedScenario && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!selectedScenario}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  scenariosContainer: {
    gap: 16,
  },
  scenarioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scenarioCardSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  scenarioTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  scenarioTitleSelected: {
    color: '#F59E0B',
  },
  scenarioDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 36,
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
  continueButtonDisabled: {
    backgroundColor: 'rgba(245, 158, 11, 0.5)',
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default WorstCaseScenario;