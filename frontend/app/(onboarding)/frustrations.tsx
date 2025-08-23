import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const Frustrations = () => {
  const { data, updateData } = useOnboarding();
  const [selectedFrustration, setSelectedFrustration] = useState(data.frustration);

  const frustrations = [
    { id: 'blank-mind', name: 'My mind goes blank under pressure', icon: 'help-circle-outline' },
    { id: 'rambling', name: 'I ramble and lose focus', icon: 'chatbubbles-outline' },
    { id: 'weak-examples', name: 'My examples feel weak or irrelevant', icon: 'document-text-outline' },
    { id: 'no-questions', name: 'I never have good questions to ask', icon: 'help-outline' },
    { id: 'salary-negotiation', name: 'I\'m terrible at salary discussions', icon: 'cash-outline' },
    { id: 'confidence', name: 'I don\'t project confidence', icon: 'sad-outline' },
    { id: 'reading-room', name: 'I can\'t read the room or interviewer', icon: 'eye-outline' },
    { id: 'follow-up', name: 'I don\'t know what to do after interviews', icon: 'time-outline' },
  ];

  const handleContinue = () => {
    if (selectedFrustration) {
      updateData('frustration', selectedFrustration);
      router.push('/(onboarding)/problems');
    }
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={11} totalSteps={17} />
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.screenTitle}>Screen 11: Most Frustrating Part</Text>
            <Text style={styles.subtitle}>
              What's the most frustrating part of interviews for you?
            </Text>
            
            <View style={styles.frustrationsContainer}>
              {frustrations.map((frustration) => (
                <TouchableOpacity
                  key={frustration.id}
                  style={[
                    styles.frustrationCard,
                    selectedFrustration === frustration.id && styles.frustrationCardSelected
                  ]}
                  onPress={() => setSelectedFrustration(frustration.id)}
                >
                  <Ionicons 
                    name={frustration.icon as any} 
                    size={24} 
                    color={selectedFrustration === frustration.id ? '#F59E0B' : 'rgba(255, 255, 255, 0.7)'} 
                  />
                  <Text style={[
                    styles.frustrationText,
                    selectedFrustration === frustration.id && styles.frustrationTextSelected
                  ]}>
                    {frustration.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, !selectedFrustration && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!selectedFrustration}
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
  frustrationsContainer: {
    gap: 12,
  },
  frustrationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  frustrationCardSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  frustrationText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  frustrationTextSelected: {
    color: '#F59E0B',
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

export default Frustrations;