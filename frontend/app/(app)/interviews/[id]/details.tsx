import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInterview, useStartAttempt } from '../../../../_queries/interviews/interviews';
import { useAttemptFeedback } from '../../../../_queries/interviews/feedback';
import usePosthogSafely from '../../../../hooks/posthog/usePosthogSafely';

export default function InterviewDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: interviewData, isLoading, error } = useInterview(id);
  const startAttempt = useStartAttempt();
  const { posthogScreen } = usePosthogSafely();
  const [attemptGrades, setAttemptGrades] = useState<{[key: string]: number}>({});

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interview_details');
    }, [posthogScreen])
  );

  // Helper functions for grade styling
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Work';
    return 'Poor';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'graded': return 'analytics';
      case 'active': return 'time';
      default: return 'ellipse';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#f59e0b';
      case 'graded': return '#10b981';
      case 'active': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Component for individual attempt cards  
  const AttemptCard = ({ attempt, index }: { attempt: any; index: number }) => {
    const { data: feedback } = useAttemptFeedback(attempt.id);
    const hasGrade = feedback?.overall_score !== undefined;
    const grade = feedback?.overall_score || 0;

    return (
      <View style={styles.attemptCard}>
        {/* Header with attempt number and status */}
        <View style={styles.attemptHeader}>
          <View style={styles.attemptInfo}>
            <Text style={styles.attemptTitle}>Attempt #{index + 1}</Text>
            <View style={styles.statusContainer}>
              <Ionicons 
                name={getStatusIcon(attempt.status) as any} 
                size={14} 
                color={getStatusColor(attempt.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(attempt.status) }]}>
                {attempt.status}
              </Text>
            </View>
          </View>
          
          {/* Grade display */}
          {hasGrade ? (
            <View style={styles.gradeContainer}>
              <Text style={[styles.gradeScore, { color: getScoreColor(grade) }]}>
                {grade}
              </Text>
              <Text style={styles.gradeLabel}>Score</Text>
            </View>
          ) : attempt.status === 'graded' ? (
            <View style={styles.gradeContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.gradeLabel}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.gradeContainer}>
              <Text style={styles.gradeScore}>--</Text>
              <Text style={styles.gradeLabel}>Score</Text>
            </View>
          )}
        </View>

        {/* Details row */}
        <View style={styles.attemptDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
            <Text style={styles.detailText}>{formatDate(attempt.created_at)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#9ca3af" />
            <Text style={styles.detailText}>{formatDuration(attempt.duration_seconds)}</Text>
          </View>
        </View>

        {/* Performance indicator for graded attempts */}
        {hasGrade && (
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Performance: </Text>
            <Text style={[styles.performanceLevel, { color: getScoreColor(grade) }]}>
              {getScoreLabel(grade)}
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBar, 
                    { backgroundColor: getScoreColor(grade), width: `${grade}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.attemptActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({ 
              pathname: '/interviews/[id]/attempts/[attemptId]/transcript', 
              params: { id, attemptId: attempt.id } 
            })}
          >
            <Ionicons name="document-text-outline" size={16} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Transcript</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              attempt.status === 'graded' ? styles.primaryAction : styles.disabledAction
            ]}
            onPress={() => {
              if (attempt.status === 'graded') {
                router.push({ 
                  pathname: '/interviews/[id]/attempts/[attemptId]/grading', 
                  params: { id, attemptId: attempt.id } 
                });
              }
            }}
            disabled={attempt.status !== 'graded'}
          >
            <Ionicons 
              name="analytics-outline" 
              size={16} 
              color={attempt.status === 'graded' ? '#10b981' : '#6b7280'} 
            />
            <Text style={[
              styles.actionButtonText,
              attempt.status === 'graded' ? { color: '#10b981' } : { color: '#6b7280' }
            ]}>
              Feedback
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleStartInterview = async () => {
    try {
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
              <Text style={styles.startButtonText}>Start Mock Interview</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Previous Attempts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Previous Attempts ({attempts.length})</Text>
          
          {attempts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color="#6b7280" />
              <Text style={styles.emptyTitle}>No attempts yet</Text>
              <Text style={styles.emptySubtitle}>
                Start your first mock interview to begin practicing
              </Text>
            </View>
          ) : (
            <View style={styles.attemptsContainer}>
              {attempts.map((attempt, index) => (
                <AttemptCard key={attempt.id} attempt={attempt} index={index} />
              ))}
            </View>
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
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  attemptsContainer: {
    gap: 16,
  },
  attemptCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  attemptInfo: {
    flex: 1,
  },
  attemptTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  gradeContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  gradeScore: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gradeLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  attemptDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#d1d5db',
    fontSize: 13,
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  performanceLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  performanceLevel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  attemptActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  primaryAction: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  disabledAction: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
