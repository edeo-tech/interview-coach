import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../../../../components/ChatGPTBackground';
import BrandfetchLogo from '../../../../../../components/BrandfetchLogo';
import { useAttemptFeedback } from '../../../../../../_queries/interviews/feedback';
import { useInterview, useStartAttempt, useInterviewAttemptsCount, useInterviewAttempts } from '../../../../../../_queries/interviews/interviews';
import { attemptFeedback } from '../../../../../../_api/interviews/feedback';
import usePosthogSafely from '../../../../../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../../../../../hooks/haptics/useHapticsSafely';
import { useInterviewRetryCheck } from '../../../../../../hooks/premium/usePremiumCheck';
import { InterviewType } from '../../../../../../_interfaces/interviews/interview-types';
import { useToast } from '../../../../../../components/Toast';
import { TYPOGRAPHY } from '../../../../../../constants/Typography';
import Colors from '../../../../../../constants/Colors';

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

// Helper functions for grade styling
const getScoreColor = (score: number) => {
  if (score >= 90) return Colors.semantic.successAlt;
  if (score >= 80) return Colors.accent.blueAlt;
  if (score >= 70) return Colors.accent.gold;
  if (score >= 60) return Colors.semantic.warning;
  return Colors.semantic.error;
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  if (score >= 60) return 'Needs Work';
  return 'Poor';
};

// Component to fetch and display attempt score
const AttemptScore = ({ attemptId }: { attemptId: string }) => {
  const { data: feedback } = useAttemptFeedback(attemptId);
  const score = feedback?.overall_score || 0;
  
  return (
    <Text style={[styles.scoreValue, { color: getScoreColor(score) }]}>
      {score}
    </Text>
  );
};

const getInterviewStageInfo = (type: string) => {
  const stageInfo: Record<string, { duration: string; focus: string[]; evaluation: string[] }> = {
    [InterviewType.PhoneScreen]: {
      duration: '15-20 minutes',
      focus: ['Background discussion', 'Role fit assessment', 'Company culture match'],
      evaluation: ['Communication skills', 'Interest in role', 'Professional experience', 'Cultural alignment']
    },
    [InterviewType.InitialHRInterview]: {
      duration: '20-30 minutes', 
      focus: ['Experience review', 'Salary expectations', 'Availability discussion'],
      evaluation: ['Communication skills', 'Experience relevance', 'Compensation alignment', 'Scheduling fit']
    },
    [InterviewType.TechnicalScreeningCall]: {
      duration: '45-60 minutes',
      focus: ['Technical knowledge', 'Problem solving', 'Coding discussion'],
      evaluation: ['Technical competency', 'Problem-solving approach', 'Code quality', 'Communication of ideas']
    },
    [InterviewType.BehavioralInterview]: {
      duration: '30-45 minutes',
      focus: ['Past experiences', 'Situational responses', 'Leadership examples'],
      evaluation: ['Leadership potential', 'Team collaboration', 'Conflict resolution', 'Growth mindset']
    },
    // Add more types as needed
  };
  
  return stageInfo[type] || {
    duration: '30-45 minutes',
    focus: ['General discussion', 'Role-specific topics', 'Company questions'],
    evaluation: ['Communication skills', 'Role fit', 'Company interest', 'Professional experience']
  };
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
  const [bestScore, setBestScore] = useState<number>(0);
  const { canRetryInterview, isPaywallEnabled } = useInterviewRetryCheck();
  const { showToast } = useToast();
  
  // Flatten the paginated attempts data
  const attempts = attemptsData?.pages.flatMap(page => page.attempts) || [];
  
  // Calculate best score from all attempts
  useEffect(() => {
    if (!interviewData?.interview) return;
    
    // Use best_score from interview if available
    if (interviewData.interview.best_score !== undefined) {
      setBestScore(interviewData.interview.best_score);
    } else if (attempts.length > 0) {
      // Fallback: calculate from attempts if best_score not available
      const calculateBestScore = async () => {
        let maxScore = 0;
        for (const attempt of attempts) {
          if (attempt.status === 'graded') {
            try {
              const { data: feedback } = await attemptFeedback(attempt.id);
              if (feedback && feedback.overall_score > maxScore) {
                maxScore = feedback.overall_score;
              }
            } catch (error) {
              console.error('Error fetching feedback:', error);
            }
          }
        }
        setBestScore(maxScore);
      };
      calculateBestScore();
    }
  }, [interviewData, attempts]);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interview_details');
    }, [posthogScreen])
  );

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
            <ActivityIndicator size="large" color={Colors.brand.primary} />
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
            <Ionicons name="alert-circle" size={64} color={Colors.semantic.error} />
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
  const stageInfo = getInterviewStageInfo(interview.interview_type || '');
  const hasAttempts = attempts.length > 0;

  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              selectionAsync();
              router.back();
            }}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Stage {interview.order || 1}: {getInterviewTypeDisplayName(interview.interview_type || '')}
            </Text>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {interview.role_title} at {interview.company}
          </Text>

          {!hasAttempts ? (
            // First-time user experience
            <>
              {/* What to Expect Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What to Expect</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={20} color={Colors.brand.primary} />
                    <Text style={styles.infoText}>Duration: {stageInfo.duration}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="chatbubble-outline" size={20} color={Colors.brand.primary} />
                    <Text style={styles.infoText}>Live conversation with interviewer</Text>
                  </View>
                </View>
              </View>

              {/* Focus Areas */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Focus Areas</Text>
                <View style={styles.bulletList}>
                  {stageInfo.focus.map((item, index) => (
                    <View key={index} style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Evaluation Criteria */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>You'll be evaluated on</Text>
                <View style={styles.bulletList}>
                  {stageInfo.evaluation.map((item, index) => (
                    <View key={index} style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            // Returning user experience
            <>
              {/* Performance Summary */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Performance</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{attempts.length}</Text>
                    <Text style={styles.statLabel}>Attempts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: Colors.semantic.successAlt }]}>
                      {bestScore}
                    </Text>
                    <Text style={styles.statLabel}>Best Score</Text>
                  </View>
                </View>
              </View>

              {/* Previous Attempts */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Previous Attempts</Text>
                <View style={styles.attemptsList}>
                  {attempts.slice(0, 5).map((attempt, index) => (

                      <TouchableOpacity
                        key={attempt.id}
                        style={styles.attemptItem}
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
                        <View style={styles.attemptContent}>
                          <Text style={styles.attemptTitle}>Attempt #{index + 1}</Text>
                          <Text style={styles.attemptDate}>{formatDate(attempt.created_at)}</Text>
                        </View>
                        <View style={styles.attemptScore}>
                          {attempt.status === 'graded' ? (
                            <AttemptScore attemptId={attempt.id} />
                          ) : (
                            <Text style={styles.scorePending}>Pending</Text>
                          )}
                        </View>
                        {attempt.status === 'graded' && (
                          <Ionicons name="chevron-forward" size={16} color={Colors.text.disabled} />
                        )}
                      </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Start/Retry Button */}
          <TouchableOpacity
            onPress={() => {
              selectionAsync();
              handleStartInterview();
            }}
            disabled={startAttempt.isPending}
            style={styles.mainButton}
          >
            {startAttempt.isPending ? (
              <ActivityIndicator color={Colors.text.primary} size="small" />
            ) : (
              <Ionicons name="play" size={20} color={Colors.text.primary} />
            )}
            <Text style={styles.mainButtonText}>
              {hasAttempts ? 'New Attempt' : 'Start Interview'}
            </Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 100, // Extra padding to account for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.primary,
    marginTop: 16,
  },
  errorButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  errorButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingBottom: 20,
    gap: 16,
  },
  headerTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 28,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    marginBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: Colors.glass.background,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary,
  },
  bulletList: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand.primary,
    marginTop: 6,
  },
  bulletText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.pageTitle,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
  },
  attemptsList: {
    gap: 12,
  },
  attemptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.background,
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  attemptContent: {
    flex: 1,
  },
  attemptTitle: {
    ...TYPOGRAPHY.itemTitle,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  attemptDate: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
  },
  attemptScore: {
    alignItems: 'center',
    minWidth: 40,
  },
  scoreValue: {
    ...TYPOGRAPHY.labelMedium,
    fontWeight: '700',
    fontSize: 18,
  },
  scorePending: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.disabled,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.primary,
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
    marginTop: 8,
  },
  mainButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: Colors.text.primary,
    fontWeight: '600',
  },
});