import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateInterviewFromURL } from '../../../_queries/interviews/interviews';
import usePosthogSafely from '../../../hooks/posthog/usePosthogSafely';
import ChatGPTBackground from '../../../components/ChatGPTBackground';
import Colors from '../../../constants/Colors';
import { TYPOGRAPHY } from '../../../constants/Typography';

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
      router.push(`/(app)/(tabs)/home/interviews/${response.data.id}/details` as any);
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
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setup Interview</Text>
        </View>

        {/* Form */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Google, Microsoft, Startup Inc."
            placeholderTextColor={Colors.gray[500]}
            value={formData.company}
            onChangeText={(text) => setFormData({...formData, company: text})}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Software Engineer, Product Manager"
            placeholderTextColor={Colors.gray[500]}
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
            placeholderTextColor={Colors.gray[500]}
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
    backgroundColor: Colors.transparent,
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
    color: Colors.text.primary,
    ...TYPOGRAPHY.heading2,
  },
  inputGroup: {
    marginBottom: 24, // spacing.6
  },
  selectorGroup: {
    marginBottom: 24, // spacing.6
  },
  label: {
    color: Colors.text.secondary,
    marginBottom: 12,
    ...TYPOGRAPHY.labelLarge,
  },
  input: {
    backgroundColor: Colors.glass.backgroundInput,
    color: Colors.text.primary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    height: 56,
    ...TYPOGRAPHY.bodyMedium,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    height: undefined,
  },
  inputHint: {
    color: Colors.text.muted,
    marginTop: 8,
    ...TYPOGRAPHY.bodyXSmall,
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
    backgroundColor: Colors.glass.goldLight,
    borderColor: Colors.glass.goldBorder,
  },
  difficultyUnselected: {
    backgroundColor: Colors.glass.backgroundInput,
    borderColor: Colors.glass.border,
  },
  difficultyText: {
    textAlign: 'center',
    textTransform: 'capitalize',
    ...TYPOGRAPHY.labelMedium,
  },
  difficultyTextSelected: {
    color: Colors.text.primary,
  },
  difficultyTextUnselected: {
    color: Colors.text.tertiary,
  },
  startButton: {
    backgroundColor: Colors.glass.backgroundSecondary,
    borderRadius: 28,
    padding: 16,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: Colors.glass.purpleLight,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonDisabled: {
    backgroundColor: Colors.glass.backgroundSubtle,
    borderColor: Colors.glass.backgroundSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  startButtonText: {
    color: Colors.text.primary,
    textAlign: 'center',
    ...TYPOGRAPHY.buttonLarge,
  },
  tipsCard: {
    backgroundColor: Colors.glass.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tipsTitle: {
    color: Colors.text.primary,
    marginBottom: 8,
    ...TYPOGRAPHY.heading5,
  },
  tipsList: {
    gap: 4, // spacing.1
  },
  tipText: {
    color: Colors.text.secondary,
    ...TYPOGRAPHY.bodySmall,
  },
});

export default InterviewSetup;