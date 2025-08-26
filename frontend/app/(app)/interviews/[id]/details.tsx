import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../../components/ChatGPTBackground';
import BrandfetchLogo from '../../../../components/BrandfetchLogo';
import { useAttemptFeedback } from '../../../../_queries/interviews/feedback';
import { useInterview, useStartAttempt, useInterviewAttemptsCount, useInterviewAttempts } from '../../../../_queries/interviews/interviews';
import usePosthogSafely from '../../../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../../../hooks/haptics/useHapticsSafely';
import { useInterviewRetryCheck } from '../../../../hooks/premium/usePremiumCheck';
import { InterviewType } from '../../../../_interfaces/interviews/interview-types';
import { useToast } from '../../../../components/Toast';
import { TYPOGRAPHY } from '../../../../constants/Typography';

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
  const { data: attemptsCountData } = useInterviewAttemptsCount(id);
  const { 
    data: attemptsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInterviewAttempts(id, 10);
  const startAttempt = useStartAttempt();
  const { posthogScreen } = usePosthogSafely();
  const { selectionAsync } = useHapticsSafely();
  const [attemptGrades, setAttemptGrades] = useState<{[key: string]: number}>({});
  const { canRetryInterview, isPaywallEnabled } = useInterviewRetryCheck();
  const { showToast } = useToast();
  
  // Flatten the paginated attempts data
  const attempts = attemptsData?.pages.flatMap(page => page.attempts) || [];

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
              <ActivityIndicator size="small" color="#A855F7" />
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
            styles.attemptButton,
            attempt.status !== 'graded' && styles.attemptButtonDisabled
          ]}
          onPress={() => {
            if (attempt.status === 'graded') {
              selectionAsync();
              router.push({ 
                pathname: '/interviews/[id]/attempts/[attemptId]/grading', 
                params: { id, attemptId: attempt.id, is_from_interview: 'false' } 
              });
            }
          }}
          disabled={attempt.status !== 'graded'}
        >
          <Ionicons 
            name="analytics" 
            size={18} 
            color={attempt.status === 'graded' ? '#10b981' : '#6b7280'} 
          />
          <Text style={[
            styles.attemptButtonText,
            attempt.status === 'graded' ? { color: '#10b981' } : { color: '#6b7280' }
          ]}>
            {attempt.status === 'graded' ? 'View Results' : 'Pending'}
          </Text>
          {attempt.status === 'graded' && (
            <Ionicons name="chevron-forward" size={16} color="#10b981" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };
  
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: { layoutMeasurement: any; contentOffset: any; contentSize: any }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  const handleStartInterview = async () => {
    try {
      // Check if user can retry this interview
      const hasExistingAttempts = attemptsCountData?.has_attempts || false;
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
            <ActivityIndicator size="large" color="#A855F7" />
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

  const { interview } = interviewData;

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView 
        style={styles.scrollView}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            selectionAsync();
            router.back();
          }}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interview Details</Text>
        </View>

        {/* Job Info with Integrated CTA */}
        <View style={styles.jobCard}>
          <View style={styles.jobInfo}>
            <View style={styles.jobHeader}>
              <BrandfetchLogo
                identifierType={(interview as any).brandfetch_identifier_type}
                identifierValue={(interview as any).brandfetch_identifier_value}
                fallbackUrl={interview.company_logo_url}
                size={48}
                style={styles.companyLogoContainer}
                fallbackIconColor="#ffffff"
                fallbackIconName="briefcase-outline"
              />
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
            onPress={() => {
              selectionAsync();
              handleStartInterview();
            }}
            disabled={startAttempt.isPending}
            style={styles.startButton}
          >
            {startAttempt.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="play" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.startButtonText}>
              {attemptsCountData?.has_attempts ? 'Retry Interview' : 'Start Interview'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Previous Attempts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Previous Attempts {attemptsData?.pages[0]?.total_count ? `(${attemptsData.pages[0].total_count})` : ''}
          </Text>
          
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
              
              {/* Loading more indicator */}
              {isFetchingNextPage && (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color="#8b5cf6" />
                  <Text style={styles.loadingMoreText}>Loading more attempts...</Text>
                </View>
              )}
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
    paddingHorizontal: 20, // layout.screenPadding
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.70)', // text.tertiary
    marginTop: 16, // spacing.4
    fontSize: 16, // typography.body.medium.fontSize
    ...TYPOGRAPHY.bodyMedium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // layout.screenPadding
  },
  errorTitle: {
    color: '#FFFFFF', // text.primary
    fontSize: 20, // typography.heading.h3.fontSize
    fontWeight: '600', // typography.heading.h3.fontWeight
    marginTop: 16, // spacing.4
    ...TYPOGRAPHY.heading3,
  },
  errorButton: {
    backgroundColor: 'rgba(252, 180, 0, 1)', // gold.400
    paddingHorizontal: 24, // spacing.6
    paddingVertical: 12, // spacing.3
    borderRadius: 12, // glassSecondary.borderRadius
    marginTop: 24, // spacing.6
    shadowColor: '#F59E0B', // gold.400
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  errorButtonText: {
    color: '#FFFFFF', // text.primary
    fontWeight: '600', // typography.button.medium.fontWeight
    fontSize: 16, // typography.button.medium.fontSize
    ...TYPOGRAPHY.buttonMedium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: '#FFFFFF',
    marginLeft: 16,
  },
  jobCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // glass.background
    borderRadius: 16, // glass.borderRadius
    padding: 24, // spacing.6
    marginBottom: 24, // spacing.6
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // glass.border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  jobInfo: {
    marginBottom: 20, // spacing.5
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // spacing.3
  },
  companyLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 8, // borderRadius.default
    backgroundColor: '#ffffff',
    marginRight: 16, // spacing.4
    overflow: 'hidden',
  },
  jobHeaderText: {
    flex: 1,
  },
  roleTitle: {
    color: '#FFFFFF', // text.primary
    fontSize: 24, // typography.heading.h2.fontSize
    fontWeight: '600', // typography.heading.h2.fontWeight
    marginBottom: 4, // spacing.1
    lineHeight: 28, // typography.heading.h2.lineHeight
    ...TYPOGRAPHY.heading2,
    letterSpacing: -0.005, // typography.heading.h2.letterSpacing
  },
  company: {
    color: 'rgba(96, 165, 250, 1)', // text.accent
    fontSize: 18, // typography.heading.h4.fontSize
    fontWeight: '600', // typography.heading.h4.fontWeight
    ...TYPOGRAPHY.heading4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // spacing.1.5
  },
  location: {
    color: 'rgba(255, 255, 255, 0.85)', // text.secondary
    fontSize: 15, // typography.body.medium.fontSize (slightly smaller)
    ...TYPOGRAPHY.bodyMedium,
  },
  interviewTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // spacing.1.5
    marginTop: 8, // spacing.2
  },
  interviewType: {
    color: 'rgba(139, 92, 246, 1)', // purple.500
    fontSize: 15, // typography.body.medium.fontSize (slightly smaller)
    fontWeight: '600', // typography.label.large.fontWeight
    ...TYPOGRAPHY.bodyMedium,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // glassSecondary.border
    marginBottom: 20, // spacing.5
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A855F7',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  startButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24, // spacing.6
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.70)', // text.tertiary
    textAlign: 'center',
    padding: 20, // spacing.5
    fontSize: 16, // typography.body.medium.fontSize
    ...TYPOGRAPHY.bodyMedium,
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)', // glassSecondary.background
    borderRadius: 16, // glass.borderRadius
    padding: 32, // spacing.8
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', // glassSecondary.border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  emptyTitle: {
    color: '#FFFFFF', // text.primary
    fontSize: 16, // typography.body.medium.fontSize
    fontWeight: '600', // typography.label.large.fontWeight
    marginTop: 16, // spacing.4
    marginBottom: 8, // spacing.2
    ...TYPOGRAPHY.bodyMedium,
  },
  emptySubtitle: {
    color: 'rgba(255, 255, 255, 0.70)', // text.tertiary
    fontSize: 14, // typography.body.small.fontSize
    textAlign: 'center',
    lineHeight: 20, // typography.body.small.lineHeight
    ...TYPOGRAPHY.bodySmall,
  },
  attemptsContainer: {
    gap: 16, // spacing.4
  },
  attemptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // glass.background
    borderRadius: 16, // glass.borderRadius
    padding: 20, // spacing.5
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // glass.border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14, // spacing.3.5
  },
  attemptTitle: {
    color: '#FFFFFF', // text.primary
    fontSize: 16, // typography.body.medium.fontSize
    fontWeight: '600', // typography.label.large.fontWeight
    ...TYPOGRAPHY.bodyMedium,
  },
  gradeContainer: {
    alignItems: 'center',
    minWidth: 55,
  },
  gradeScore: {
    fontSize: 22, // typography.heading.h3.fontSize
    fontWeight: '700', // typography.heading.h3.fontWeight
    marginBottom: 1, // spacing.0.25
    ...TYPOGRAPHY.heading3,
  },
  gradeLabel: {
    color: 'rgba(255, 255, 255, 0.55)', // text.muted
    fontSize: 11, // typography.body.xsmall.fontSize (slightly smaller)
    fontWeight: '500', // typography.label.small.fontWeight
    ...TYPOGRAPHY.bodyXSmall,
  },
  attemptDetails: {
    flexDirection: 'row',
    gap: 16, // spacing.4
    marginBottom: 18, // spacing.4.5
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // spacing.1.5
  },
  detailText: {
    color: 'rgba(255, 255, 255, 0.85)', // text.secondary
    fontSize: 13, // typography.body.small.fontSize (slightly smaller)
    ...TYPOGRAPHY.bodySmall,
  },
  attemptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  attemptButtonDisabled: {
    opacity: 0.5,
  },
  attemptButtonText: {
    ...TYPOGRAPHY.labelMedium,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20, // spacing.5
    gap: 8, // spacing.2
  },
  loadingMoreText: {
    color: 'rgba(139, 92, 246, 1)', // purple.500
    fontSize: 14, // typography.body.small.fontSize
    fontWeight: '500', // typography.label.large.fontWeight
    ...TYPOGRAPHY.bodySmall,
  },
});
