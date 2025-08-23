import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const PreparationLevel = () => {
  const { data, updateData } = useOnboarding();
  const [preparationLevel, setPreparationLevel] = useState(data.preparationLevel);

  const levels = [
    { id: '1', name: 'Not prepared at all', description: 'I winged it', color: '#EF4444' },
    { id: '2', name: 'Barely prepared', description: 'Looked up the company', color: '#F97316' },
    { id: '3', name: 'Somewhat prepared', description: 'Did basic research', color: '#F59E0B' },
    { id: '4', name: 'Well prepared', description: 'Practiced some answers', color: '#EAB308' },
    { id: '5', name: 'Very well prepared', description: 'Rehearsed extensively', color: '#10B981' },
  ];

  const handleContinue = () => {
    if (preparationLevel) {
      updateData('preparationLevel', preparationLevel);
      router.push('/(onboarding)/frustrations');
    }
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={10} totalSteps={17} />
        
        <View style={styles.content}>
          <Text style={styles.screenTitle}>Screen 10: Preparation Level</Text>
          <Text style={styles.subtitle}>
            On a scale of 1-5, how prepared did you feel?
          </Text>
          
          <View style={styles.levelsContainer}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  preparationLevel === level.id && styles.levelCardSelected,
                  preparationLevel === level.id && { borderColor: level.color }
                ]}
                onPress={() => setPreparationLevel(level.id)}
              >
                <View style={styles.levelHeader}>
                  <View style={[styles.numberCircle, { backgroundColor: level.color }]}>
                    <Text style={styles.numberText}>{level.id}</Text>
                  </View>
                  <Text style={[
                    styles.levelName,
                    preparationLevel === level.id && { color: level.color }
                  ]}>
                    {level.name}
                  </Text>
                </View>
                <Text style={styles.levelDescription}>{level.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, !preparationLevel && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!preparationLevel}
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
  content: {
    flex: 1,
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
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  levelsContainer: {
    gap: 12,
  },
  levelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  levelCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  levelDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginLeft: 44,
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

export default PreparationLevel;