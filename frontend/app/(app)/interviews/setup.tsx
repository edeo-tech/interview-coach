import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCreateInterviewFromURL } from '../../../_queries/interviews/interviews';

const InterviewSetup = () => {
  const [formData, setFormData] = useState({
    company: '',
    role_title: '',
    job_description: '',
    difficulty: 'mid' as 'junior' | 'mid' | 'senior',
  });

  const createInterviewMutation = useCreateInterviewFromURL();

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 24,
  },
  selectorGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#374151',
    color: '#ffffff',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputHint: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
  },
  difficultyOption: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  difficultySelected: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  difficultyUnselected: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  difficultyText: {
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  difficultyTextSelected: {
    color: '#ffffff',
  },
  difficultyTextUnselected: {
    color: '#d1d5db',
  },
  startButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  startButtonDisabled: {
    backgroundColor: '#4b5563',
  },
  startButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tipText: {
    color: '#d1d5db',
    fontSize: 14,
  },
});

export default InterviewSetup;