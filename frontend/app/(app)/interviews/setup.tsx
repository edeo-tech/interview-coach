import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateInterviewFromURL } from '../../../_queries/interviews/interviews';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import ChatGPTBackground from '../../../components/ChatGPTBackground';

const InterviewSetup = () => {
  const [formData, setFormData] = useState({
    company: '',
    role_title: '',
    job_description: '',
    difficulty: 'mid' as 'junior' | 'mid' | 'senior',
  });

  const createInterviewMutation = useCreateInterviewFromURL();
  const { posthogScreen } = usePosthogSafely();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interview_setup');
    }, [posthogScreen])
  );

  const handleStart = async () => {
    if (!formData.company.trim() || !formData.role_title.trim()) {
      Alert.alert('Missing Information', 'Please fill in company and role title.');
      return;
    }

    if (!formData.job_description.trim()) {
      Alert.alert('Missing Information', 'Please paste the job description.');
      return;
    }

    try {
      const response = await createInterviewMutation.mutateAsync({
        job_url: formData.job_description // Treating job description as job content
      });
      router.push(`/interviews/${response.data.id}/session` as any);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create interview');
    }
  };

  return (
    <ChatGPTBackground style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setup Interview</Text>
        </View>

        {/* Form */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Google, Microsoft, Startup Inc."
            placeholderTextColor="#6b7280"
            value={formData.company}
            onChangeText={(text) => setFormData({...formData, company: text})}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Software Engineer, Product Manager"
            placeholderTextColor="#6b7280"
            value={formData.role_title}
            onChangeText={(text) => setFormData({...formData, role_title: text})}
          />
        </View>

        {/* Experience Level */}
        <View style={styles.selectorGroup}>
          <Text style={styles.label}>Experience Level</Text>
          <View style={styles.difficultyContainer}>
            {(['junior', 'mid', 'senior'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setFormData({...formData, difficulty: level as 'junior' | 'mid' | 'senior'})}
                style={[
                  styles.difficultyOption,
                  formData.difficulty === level ? styles.difficultySelected : styles.difficultyUnselected
                ]}
              >
                <Text style={[
                  styles.difficultyText,
                  formData.difficulty === level ? styles.difficultyTextSelected : styles.difficultyTextUnselected
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Job Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Paste the full job description here. This helps me ask relevant questions based on the actual requirements..."
            placeholderTextColor="#6b7280"
            multiline
            textAlignVertical="top"
            value={formData.job_description}
            onChangeText={(text) => setFormData({...formData, job_description: text})}
          />
          <Text style={styles.inputHint}>
            The more detailed the job description, the more personalized your interview will be.
          </Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            createInterviewMutation.isPending ? styles.startButtonDisabled : null
          ]}
          onPress={handleStart}
          disabled={createInterviewMutation.isPending}
        >
          <Text style={styles.startButtonText}>
            {createInterviewMutation.isPending ? 'Creating Interview...' : 'Start Interview'}
          </Text>
        </TouchableOpacity>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Interview Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>• Find a quiet space with good internet connection</Text>
            <Text style={styles.tipText}>• Speak clearly and at a normal pace</Text>
            <Text style={styles.tipText}>• Take time to think before answering</Text>
            <Text style={styles.tipText}>• Ask clarifying questions if needed</Text>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20, // layout.screenPadding
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20, // spacing.5
  },
  backButton: {
    marginRight: 16, // spacing.4
  },
  headerTitle: {
    color: '#FFFFFF', // text.primary
    fontSize: 24, // typography.heading.h2.fontSize
    fontWeight: '600', // typography.heading.h2.fontWeight
    fontFamily: 'SpaceGrotesk', // typography.heading.h2.fontFamily
    letterSpacing: -0.005, // typography.heading.h2.letterSpacing
  },
  inputGroup: {
    marginBottom: 24, // spacing.6
  },
  selectorGroup: {
    marginBottom: 24, // spacing.6
  },
  label: {
    color: 'rgba(255, 255, 255, 0.85)', // text.secondary
    fontSize: 16, // typography.label.large.fontSize
    fontWeight: '600', // typography.label.large.fontWeight
    marginBottom: 12, // spacing.3
    fontFamily: 'Inter', // typography.label.large.fontFamily
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)', // glassInput.background
    color: '#FFFFFF', // text.primary
    padding: 16, // spacing.4
    borderRadius: 12, // glassInput.borderRadius
    fontSize: 16, // typography.body.medium.fontSize
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // glassInput.border
    height: 56, // layout.inputHeight.medium
    fontFamily: 'Inter', // typography.body.medium.fontFamily
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    height: undefined,
  },
  inputHint: {
    color: 'rgba(255, 255, 255, 0.55)', // text.muted
    fontSize: 12, // typography.body.xsmall.fontSize
    marginTop: 8, // spacing.2
    fontFamily: 'Inter', // typography.body.xsmall.fontFamily
  },
  difficultyContainer: {
    flexDirection: 'row',
  },
  difficultyOption: {
    flex: 1,
    padding: 12, // spacing.3
    marginHorizontal: 4, // spacing.1
    borderRadius: 12, // glassSecondary.borderRadius
    borderWidth: 1,
    alignItems: 'center',
  },
  difficultySelected: {
    backgroundColor: 'rgba(252, 180, 0, 0.2)', // gold.400 with opacity
    borderColor: 'rgba(252, 180, 0, 0.4)', // gold.400 with opacity
  },
  difficultyUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)', // glassInput.background
    borderColor: 'rgba(255, 255, 255, 0.15)', // glassInput.border
  },
  difficultyText: {
    textAlign: 'center',
    fontWeight: '600', // typography.label.medium.fontWeight
    textTransform: 'capitalize',
    fontSize: 14, // typography.label.medium.fontSize
    fontFamily: 'Inter', // typography.label.medium.fontFamily
  },
  difficultyTextSelected: {
    color: '#FFFFFF', // text.primary
  },
  difficultyTextUnselected: {
    color: 'rgba(255, 255, 255, 0.70)', // text.tertiary
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // glass-like transparent fill
    borderRadius: 28, // pill (height/2 of 56)
    padding: 16, // spacing.4
    marginBottom: 32, // spacing.8
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.4)', // purple.400 with opacity
    height: 56, // layout.buttonHeight.medium
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A855F7', // purple.400
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // disabled glass
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowOpacity: 0,
    elevation: 0,
  },
  startButtonText: {
    color: '#FFFFFF', // text.primary
    textAlign: 'center',
    fontSize: 18, // typography.button.large.fontSize
    fontWeight: '600', // typography.button.large.fontWeight
    fontFamily: 'Inter', // typography.button.large.fontFamily
    letterSpacing: 0.005, // typography.button.large.letterSpacing
  },
  tipsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // glass.background
    borderRadius: 16, // glass.borderRadius
    padding: 16, // spacing.4
    marginBottom: 24, // spacing.6
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // glass.border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tipsTitle: {
    color: '#FFFFFF', // text.primary
    fontSize: 16, // typography.heading.h5.fontSize
    fontWeight: '600', // typography.heading.h5.fontWeight
    marginBottom: 8, // spacing.2
    fontFamily: 'Inter', // typography.heading.h5.fontFamily
  },
  tipsList: {
    gap: 4, // spacing.1
  },
  tipText: {
    color: 'rgba(255, 255, 255, 0.85)', // text.secondary
    fontSize: 14, // typography.body.small.fontSize
    fontFamily: 'Inter', // typography.body.small.fontFamily
  },
});

export default InterviewSetup;