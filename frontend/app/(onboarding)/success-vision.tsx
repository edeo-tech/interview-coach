import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Colors from '../../constants/Colors';

const SuccessVision = () => {
  const { data, updateData } = useOnboarding();
  const [selectedVision, setSelectedVision] = useState(data.successVision);

  const visions = [
    { 
      id: 'confident-storytelling', 
      name: 'Confidently telling compelling stories', 
      icon: 'book-outline',
      description: 'Articulate examples that showcase my value'
    },
    { 
      id: 'natural-conversation', 
      name: 'Having a natural, flowing conversation', 
      icon: 'chatbubbles-outline',
      description: 'Feel relaxed and authentic throughout'
    },
    { 
      id: 'technical-mastery', 
      name: 'Demonstrating deep technical knowledge', 
      icon: 'code-slash-outline',
      description: 'Answer complex questions with authority'
    },
    { 
      id: 'strategic-thinking', 
      name: 'Showing strategic and analytical thinking', 
      icon: 'analytics-outline',
      description: 'Impress with insights and problem-solving'
    },
    { 
      id: 'culture-fit', 
      name: 'Proving I\'m the perfect culture fit', 
      icon: 'people-outline',
      description: 'Connect personally with the team'
    },
    { 
      id: 'salary-negotiation', 
      name: 'Negotiating the salary I deserve', 
      icon: 'trending-up-outline',
      description: 'Confidently discuss compensation'
    },
  ];

  const handleContinue = () => {
    if (selectedVision) {
      updateData('successVision', selectedVision);
      router.push('/(onboarding)/problems');
    }
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={11} totalSteps={12} />
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.screenTitle}>Picture yourself succeeding</Text>
            <Text style={styles.subtitle}>
              What would a successful interview look like for you?
            </Text>
            
            <View style={styles.visionsContainer}>
              {visions.map((vision) => (
                <TouchableOpacity
                  key={vision.id}
                  style={[
                    styles.visionCard,
                    selectedVision === vision.id && styles.visionCardSelected
                  ]}
                  onPress={() => setSelectedVision(vision.id)}
                >
                  <View style={styles.visionHeader}>
                    <Ionicons 
                      name={vision.icon as any} 
                      size={24} 
                      color={selectedVision === vision.id ? Colors.accent.gold : Colors.text.tertiary} 
                    />
                    <Text style={[
                      styles.visionTitle,
                      selectedVision === vision.id && styles.visionTitleSelected
                    ]}>
                      {vision.name}
                    </Text>
                  </View>
                  <Text style={styles.visionDescription}>
                    {vision.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, !selectedVision && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!selectedVision}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
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
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  visionsContainer: {
    gap: 16,
  },
  visionCard: {
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary,
  },
  visionCardSelected: {
    backgroundColor: Colors.glass.gold,
    borderColor: Colors.accent.gold,
  },
  visionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  visionTitle: {
    color: Colors.text.tertiary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  visionTitleSelected: {
    color: Colors.accent.gold,
  },
  visionDescription: {
    color: Colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 36,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: Colors.accent.gold,
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.glass.goldMedium,
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default SuccessVision;