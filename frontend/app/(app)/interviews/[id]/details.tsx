import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterview, useStartAttempt } from '../../../../_queries/interviews/interviews';

export default function InterviewDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: interviewData, isLoading, error } = useInterview(id);
  const startAttempt = useStartAttempt();

  const handleStartInterview = async () => {
    try {
      const result = await startAttempt.mutateAsync(id);
      // This is where the call screen should be navigated to
      Alert.alert('Interview Started', `Attempt ID: ${result.data.attempt_id}`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to start interview');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading interview details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !interviewData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to load interview</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { interview, attempts } = interviewData;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interview Details</Text>
        </View>

        {/* Job Info */}
        <View style={styles.jobCard}>
          <Text style={styles.roleTitle}>{interview.role_title}</Text>
          <Text style={styles.company}>{interview.company}</Text>
          <Text style={styles.location}>{interview.location || 'Remote'}</Text>
        </View>

        {/* Start Interview Button */}
        <TouchableOpacity
          onPress={handleStartInterview}
          disabled={startAttempt.isPending}
          style={styles.startButton}
        >
          {startAttempt.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="videocam" size={24} color="white" />
              <Text style={styles.startButtonText}>Start Mock Interview</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Previous Attempts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Previous Attempts ({attempts.length})</Text>
          {attempts.length === 0 ? (
            <Text style={styles.emptyText}>No attempts yet</Text>
          ) : (
            attempts.map((attempt) => (
              <View key={attempt._id} style={styles.attemptCard}>
                <Text style={styles.attemptDate}>
                  {new Date(attempt.created_at).toLocaleDateString()}
                </Text>
                <Text style={styles.attemptStatus}>{attempt.status}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  errorButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  errorButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  jobCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  roleTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  company: {
    color: '#60a5fa',
    fontSize: 18,
    marginBottom: 8,
  },
  location: {
    color: '#d1d5db',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    padding: 20,
  },
  attemptCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  attemptDate: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 4,
  },
  attemptStatus: {
    color: '#9ca3af',
    fontSize: 14,
  },
});
