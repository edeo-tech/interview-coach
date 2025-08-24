import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../../components/ChatGPTBackground';
import { useAttemptFeedback } from '../../../../_queries/interviews/feedback';
import { useInterview, useStartAttempt, useInterviewAttemptsCount } from '../../../../_queries/interviews/interviews';
import usePosthogSafely from '../../../../hooks/posthog/usePosthogSafely';
import { useInterviewRetryCheck } from '../../../../hooks/premium/usePremiumCheck';
import { InterviewType } from '../../../../_interfaces/interviews/interview-types';
import { useToast } from '../../../../components/Toast';

const getInterviewTypeDisplayName = (type: string): string => {
  const displayNames: Record<string, string> = {
    [InterviewType.PhoneScreen]: 'Phone Screen',
    [InterviewType.InitialHRInterview]: 'HR Interview',
    [InterviewType.MockSalesCall]: 'Sales Call',
    [InterviewType.PresentationPitch]: 'Presentation',
    [InterviewType.TechnicalScreeningCall]: 'Technical Screen',
    [InterviewType.SystemDesignInterview]: 'System Design',
    [InterviewType.PortfolioReview]: 'Portfolio Review',
    [InterviewType.CaseStudy]: 'Case Study',
    [InterviewType.BehavioralInterview]: 'Behavioral',
    [InterviewType.ValuesInterview]: 'Values Interview',
    [InterviewType.TeamFitInterview]: 'Team Fit',
    [InterviewType.InterviewWithBusinessPartnerClientStakeholder]: 'Stakeholder Interview',
    [InterviewType.ExecutiveLeadershipRound]: 'Executive Round',
  };
  return displayNames[type] || type;
};

const getInterviewTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    [InterviewType.PhoneScreen]: 'call',
    [InterviewType.InitialHRInterview]: 'people',
    [InterviewType.MockSalesCall]: 'megaphone',
    [InterviewType.PresentationPitch]: 'easel',
    [InterviewType.TechnicalScreeningCall]: 'code',
    [InterviewType.SystemDesignInterview]: 'git-network',
    [InterviewType.PortfolioReview]: 'images',
    [InterviewType.CaseStudy]: 'document-text',
    [InterviewType.BehavioralInterview]: 'chatbubbles',
    [InterviewType.ValuesInterview]: 'heart',
    [InterviewType.TeamFitInterview]: 'people-circle',
    [InterviewType.InterviewWithBusinessPartnerClientStakeholder]: 'business',
    [InterviewType.ExecutiveLeadershipRound]: 'trending-up',
  };
  return iconMap[type] || 'chatbubble';
};

export default function InterviewDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: interviewData, isLoading, error } = useInterview(id);
  const { data: attemptsData } = useInterviewAttemptsCount(id);
  const startAttempt = useStartAttempt();
  const { posthogScreen } = usePosthogSafely();
  const [attemptGrades, setAttemptGrades] = useState<{[key: string]: number}>({});
  const { canRetryInterview, isPaywallEnabled } = useInterviewRetryCheck();
  const { showToast } = useToast();

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
        {/* Header with attempt number and grade */}
        <View style={styles.attemptHeader}>
          <Text style={styles.attemptTitle}>Attempt #{index + 1}</Text>
          
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
              <ActivityIndicator size="small" color="#F59E0B" />
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
          {hasGrade && (
            <View style={styles.detailItem}>
              <Ionicons name="star-outline" size={14} color={getScoreColor(grade)} />
              <Text style={[styles.detailText, { color: getScoreColor(grade) }]}>
                {getScoreLabel(grade)}
              </Text>
            </View>
          )}
        </View>

        {/* Action button */}
        <TouchableOpacity
          style={[
            styles.singleActionButton,
            attempt.status === 'graded' ? styles.primaryAction : styles.disabledAction
          ]}
          onPress={() => {
            if (attempt.status === 'graded') {
              router.push({ 
                pathname: '/interviews/[id]/attempts/[attemptId]/grading', 
                params: { id, attemptId: attempt.id, is_from_interview: 'false' } 
              });
            }
          }}
          disabled={attempt.status !== 'graded'}
        >
          <Ionicons 
            name="analytics-outline" 
            size={18} 
            color={attempt.status === 'graded' ? '#10b981' : '#6b7280'} 
          />
          <Text style={[
            styles.singleActionButtonText,
            attempt.status === 'graded' ? { color: '#10b981' } : { color: '#6b7280' }
          ]}>
            {attempt.status === 'graded' ? 'View Feedback & Results' : 'Feedback Pending'}
          </Text>
          {attempt.status === 'graded' && (
            <Ionicons name="chevron-forward" size={16} color="#10b981" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const handleStartInterview = async () => {
    try {
      // Check if user can retry this interview
      const hasExistingAttempts = attemptsData?.has_attempts || false;
      const retryCheck = canRetryInterview(hasExistingAttempts);
      
      if (!retryCheck.canRetry && retryCheck.requiresUpgrade && isPaywallEnabled) {
        // Show paywall for premium upgrade
        router.push('/paywall?source=retry');
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
          interviewType: interview.interview_type || 'technical', // Pass interview type
          location: interview.location || 'Remote',
          callState: 'incoming' // Start in incoming call state
        }
      });
    } catch (error: any) {
      showToast('Unable to start interview. Please try again.', 'error');
    }
  };

  if (isLoading) {
    return (
      <ChatGPTBackground style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingText}>Loading interview details...</Text>
          </View>
        </SafeAreaView>
      </ChatGPTBackground>
    );
  }

  if (error || !interviewData) {
    return (
      <ChatGPTBackground style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text style={styles.errorTitle}>Failed to load interview</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ChatGPTBackground>
    );
  }

  const { interview, attempts } = interviewData;

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interview Details</Text>
        </View>

        {/* Job Info with Integrated CTA */}
        <View style={styles.jobCard}>
          <View style={styles.jobInfo}>
            <View style={styles.jobHeader}>
              {interview.company_logo_url && (
                <Image 
                  source={{ uri: interview.company_logo_url }}
                  style={styles.companyLogo}
                />
              )}
              <View style={styles.jobHeaderText}>
                <Text style={styles.roleTitle}>{interview.role_title}</Text>
                <Text style={styles.company}>{interview.company}</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color="#9ca3af" />
              <Text style={styles.location}>{interview.location || 'Remote'}</Text>
            </View>
            
            {/* Interview Type */}
            {interview.interview_type && (
              <View style={styles.interviewTypeRow}>
                <Ionicons 
                  name={getInterviewTypeIcon(interview.interview_type) as any} 
                  size={16} 
                  color="#8b5cf6" 
                />
                <Text style={styles.interviewType}>
                  {getInterviewTypeDisplayName(interview.interview_type)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.cardDivider} />
          
          <TouchableOpacity
            onPress={handleStartInterview}
            disabled={startAttempt.isPending}
            style={[
              styles.integratedStartButton,
              startAttempt.isPending && styles.integratedStartButtonDisabled
            ]}
          >
            {startAttempt.isPending ? (
              <ActivityIndicator color="#F43F5E" size="small" />
            ) : (
              <Ionicons name="play-circle" size={20} color="#F43F5E" />
            )}
            <Text style={[
              styles.integratedStartButtonText,
              startAttempt.isPending && styles.integratedStartButtonTextDisabled
            ]}>
              {attemptsData?.has_attempts ? 'Retry Interview' : 'Start Mock Interview'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#F43F5E" />
          </TouchableOpacity>
        </View>

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
    </ChatGPTBackground>
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
    backgroundColor: '#F59E0B',
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  jobCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }
    }),
  },
  jobInfo: {
    marginBottom: 20,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginRight: 16,
  },
  jobHeaderText: {
    flex: 1,
  },
  roleTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 28,
  },
  company: {
    color: '#60a5fa',
    fontSize: 18,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    color: '#d1d5db',
    fontSize: 15,
  },
  interviewTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  interviewType: {
    color: '#8b5cf6',
    fontSize: 15,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20,
  },
  integratedStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
    borderRadius: 12,
  },
  integratedStartButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  integratedStartButtonText: {
    color: '#F43F5E',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  integratedStartButtonTextDisabled: {
    color: '#9ca3af',
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    }),
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  attemptTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  gradeContainer: {
    alignItems: 'center',
    minWidth: 55,
  },
  gradeScore: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  gradeLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  attemptDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 18,
    flexWrap: 'wrap',
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
  singleActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  primaryAction: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  disabledAction: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  singleActionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
});
