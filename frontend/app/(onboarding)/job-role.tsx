import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const OnboardingJobRole = () => {
  const { data, updateData } = useOnboarding();
  const [selectedIndustry, setSelectedIndustry] = useState(data.industry);

  const industries = [
    { id: 'technology', name: 'Technology', icon: 'laptop-outline' },
    { id: 'marketing', name: 'Marketing', icon: 'trending-up-outline' },
    { id: 'sales', name: 'Sales', icon: 'handshake-outline' },
    { id: 'finance', name: 'Finance', icon: 'calculator-outline' },
    { id: 'healthcare', name: 'Healthcare', icon: 'medical-outline' },
    { id: 'education', name: 'Education', icon: 'school-outline' },
    { id: 'consulting', name: 'Consulting', icon: 'business-outline' },
    { id: 'other', name: 'Other', icon: 'help-circle-outline' },
  ];

  const handleContinue = () => {
    if (selectedIndustry) {
      updateData('industry', selectedIndustry);
      router.push('/(onboarding)/industry-struggle');
    }
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={6} totalSteps={17} />
        
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.screenTitle}>What industry are you in?</Text>
            <Text style={styles.subtitle}>
              Which industry are you applying in? We'll tailor advice and prep to this field.
            </Text>
            
            <View style={styles.industryGrid}>
              {industries.map((industry) => (
                <TouchableOpacity
                  key={industry.id}
                  style={[
                    styles.industryCard,
                    selectedIndustry === industry.id && styles.industryCardSelected
                  ]}
                  onPress={() => setSelectedIndustry(industry.id)}
                >
                  <Ionicons 
                    name={industry.icon as any} 
                    size={32} 
                    color={selectedIndustry === industry.id ? '#F59E0B' : 'rgba(255, 255, 255, 0.7)'} 
                  />
                  <Text style={[
                    styles.industryText,
                    selectedIndustry === industry.id && styles.industryTextSelected
                  ]}>
                    {industry.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, !selectedIndustry && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!selectedIndustry}
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
  industryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  industryCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 100,
    justifyContent: 'center',
  },
  industryCardSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  industryText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  industryTextSelected: {
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

export default OnboardingJobRole;