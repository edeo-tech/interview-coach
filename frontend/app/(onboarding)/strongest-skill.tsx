import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const StrongestSkill = () => {
  const { data, updateData } = useOnboarding();
  const [selectedSkill, setSelectedSkill] = useState(data.strongestSkill);

  const skills = [
    { id: 'communication', name: 'Communication & Storytelling', icon: 'chatbubbles-outline' },
    { id: 'technical', name: 'Technical Knowledge', icon: 'code-slash-outline' },
    { id: 'problem-solving', name: 'Problem Solving', icon: 'bulb-outline' },
    { id: 'leadership', name: 'Leadership & Teamwork', icon: 'people-outline' },
    { id: 'analytical', name: 'Analytical Thinking', icon: 'analytics-outline' },
    { id: 'creativity', name: 'Creativity & Innovation', icon: 'color-palette-outline' },
    { id: 'adaptability', name: 'Adaptability', icon: 'refresh-outline' },
    { id: 'presentation', name: 'Presentation Skills', icon: 'easel-outline' },
  ];

  const handleContinue = () => {
    if (selectedSkill) {
      updateData('strongestSkill', selectedSkill);
      router.push('/(onboarding)/worst-case-scenario');
    }
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={10} totalSteps={17} />
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.screenTitle}>Screen 10: Weakest Skill</Text>
            <Text style={styles.subtitle}>
              Which skill do you feel least confident about in interviews?
            </Text>
            
            <View style={styles.skillsGrid}>
              {skills.map((skill) => (
                <TouchableOpacity
                  key={skill.id}
                  style={[
                    styles.skillCard,
                    selectedSkill === skill.id && styles.skillCardSelected
                  ]}
                  onPress={() => setSelectedSkill(skill.id)}
                >
                  <Ionicons 
                    name={skill.icon as any} 
                    size={28} 
                    color={selectedSkill === skill.id ? '#F59E0B' : 'rgba(255, 255, 255, 0.7)'} 
                  />
                  <Text style={[
                    styles.skillText,
                    selectedSkill === skill.id && styles.skillTextSelected
                  ]}>
                    {skill.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, !selectedSkill && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!selectedSkill}
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
  skillsGrid: {
    gap: 12,
  },
  skillCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skillCardSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  skillText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  skillTextSelected: {
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

export default StrongestSkill;