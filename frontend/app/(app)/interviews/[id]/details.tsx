import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterview, useStartAttempt, useInterviewAttemptsCount } from '../../../../_queries/interviews/interviews';
import usePosthogSafely from '../../../../hooks/posthog/usePosthogSafely';
import { useInterviewRetryCheck } from '../../../../hooks/premium/usePremiumCheck';

export default function InterviewDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: interviewData, isLoading, error } = useInterview(id);
  const { data: attemptsData } = useInterviewAttemptsCount(id);
  const startAttempt = useStartAttempt();
  const { posthogScreen } = usePosthogSafely();
  const { canRetryInterview } = useInterviewRetryCheck();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interview_details');
    }, [posthogScreen])
  );

  const handleStartInterview = async () => {
    try {
      // Check if user can retry this interview
      const hasExistingAttempts = attemptsData?.has_attempts || false;
      const retryCheck = canRetryInterview(hasExistingAttempts);
      
      if (!retryCheck.canRetry && retryCheck.requiresUpgrade) {
        // Show paywall for premium upgrade
        router.push('/paywall');
        return;
      }

      // Navigate directly to mock interview with interview data
      // No backend call needed for frontend-only implementation
      router.push({
        pathname: '/mock-interview',
        params: {
          companyName: interview.company,
          role: interview.role_title,
          difficulty: interview.difficulty || 'Medium',
          topics: JSON.stringify(interview.focus_areas || ['General Interview Skills']),
          interviewId: id,
          location: interview.location || 'Remote',
          callState: 'incoming' // Start in incoming call state
        }
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to start interview');
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
    <LinearGradient
      colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
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
              <Ionicons name="call" size={24} color="white" />
              <Text style={styles.startButtonText}>
                {attemptsData?.has_attempts ? 'Retry Interview' : 'Start Mock Interview'}
              </Text>
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
              <View key={attempt.id} style={styles.attemptCard}>
                <Text style={styles.attemptDate}>
                  {new Date(attempt.created_at).toLocaleDateString()}
                </Text>
                <Text style={styles.attemptStatus}>{attempt.status}</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <TouchableOpacity onPress={() => router.push({ pathname: '/interviews/[id]/attempts/[attemptId]/transcript', params: { id, attemptId: attempt.id } })}>
                    <Text style={{ color: '#60a5fa' }}>View transcript</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push({ pathname: '/interviews/[id]/attempts/[attemptId]/grading', params: { id, attemptId: attempt.id } })}>
                    <Text style={{ color: '#60a5fa' }}>View grading</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
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
    backgroundColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 17,
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
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
