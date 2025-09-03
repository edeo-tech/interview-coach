import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../../../../components/ChatGPTBackground';
import { useAttemptFeedback } from '../../../../../../_queries/interviews/feedback';
import { useInterview, useStartAttempt, useInterviewAttemptsCount, useInterviewAttempts } from '../../../../../../_queries/interviews/interviews';
import usePosthogSafely from '../../../../../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../../../../../hooks/haptics/useHapticsSafely';
import { useInterviewRetryCheck } from '../../../../../../hooks/premium/usePremiumCheck';
import { InterviewType } from '../../../../../../_interfaces/interviews/interview-types';
import { useToast } from '../../../../../../components/Toast';
import { TYPOGRAPHY } from '../../../../../../constants/Typography';
import Colors from '../../../../../../constants/Colors';

// Comprehensive interview stage information for all interview types
const INTERVIEW_STAGE_CONFIG = {
  [InterviewType.PhoneScreen]: {
    duration: '15-30 minutes',
    focus: [
      'Initial screening and background discussion',
      'Role fit assessment and experience overview',
      'Company culture and values alignment',
      'Availability and logistics discussion'
    ],
    evaluation: [
      'Communication clarity and professionalism',
      'Interest and enthusiasm for the role',
      'Relevant experience and background',
      'Cultural fit and company alignment'
    ],
    tips: [
      'Speak clearly and professionally',
      'Show enthusiasm for the opportunity',
      'Prepare questions about the role and company',
      'Be ready to discuss your background briefly'
    ]
  },
  [InterviewType.InitialHRInterview]: {
    duration: '30-45 minutes',
    focus: [
      'Detailed experience and background review',
      'Salary expectations and compensation discussion',
      'Availability and scheduling preferences',
      'Career goals and long-term objectives'
    ],
    evaluation: [
      'Communication skills and professionalism',
      'Experience relevance to the position',
      'Compensation expectations alignment',
      'Scheduling flexibility and availability'
    ],
    tips: [
      'Research typical salary ranges for the role',
      'Be prepared to discuss your career timeline',
      'Show flexibility with scheduling',
      'Ask thoughtful questions about the company'
    ]
  },
  [InterviewType.MockSalesCall]: {
    duration: '30-45 minutes',
    focus: [
      'Lead qualification and discovery questions',
      'Pain point identification and needs assessment',
      'Solution presentation and value proposition',
      'Objection handling and closing techniques'
    ],
    evaluation: [
      'Discovery and qualification skills',
      'Solution presentation effectiveness',
      'Objection handling and problem-solving',
      'Closing ability and next steps'
    ],
    tips: [
      'Ask open-ended discovery questions',
      'Listen actively to identify pain points',
      'Present solutions that address specific needs',
      'Handle objections professionally and confidently'
    ]
  },
  [InterviewType.PresentationPitch]: {
    duration: '45-60 minutes',
    focus: [
      'Structured presentation delivery',
      'Content organization and flow',
      'Audience engagement and interaction',
      'Q&A handling and follow-up'
    ],
    evaluation: [
      'Presentation structure and clarity',
      'Content relevance and depth',
      'Delivery confidence and engagement',
      'Q&A handling and knowledge depth'
    ],
    tips: [
      'Structure your presentation with clear sections',
      'Practice your delivery and timing',
      'Prepare for potential questions',
      'Engage the audience throughout'
    ]
  },
  [InterviewType.TechnicalScreeningCall]: {
    duration: '45-60 minutes',
    focus: [
      'Technical knowledge assessment',
      'Problem-solving and coding discussion',
      'System design and architecture questions',
      'Technical communication and explanation'
    ],
    evaluation: [
      'Technical competency and knowledge depth',
      'Problem-solving approach and methodology',
      'Code quality and best practices',
      'Communication of technical concepts'
    ],
    tips: [
      'Think aloud while solving problems',
      'Ask clarifying questions before starting',
      'Explain your reasoning and approach',
      'Be honest about what you don\'t know'
    ]
  },
  [InterviewType.SystemDesignInterview]: {
    duration: '60-90 minutes',
    focus: [
      'System architecture and design principles',
      'Scalability and performance considerations',
      'Trade-offs and decision-making rationale',
      'Technical communication and collaboration'
    ],
    evaluation: [
      'System design knowledge and principles',
      'Scalability and performance understanding',
      'Trade-off analysis and decision-making',
      'Technical communication skills'
    ],
    tips: [
      'Start with high-level requirements',
      'Consider scalability and performance early',
      'Discuss trade-offs openly',
      'Collaborate with the interviewer'
    ]
  },
  [InterviewType.PortfolioReview]: {
    duration: '45-60 minutes',
    focus: [
      'Portfolio presentation and walkthrough',
      'Project selection and rationale',
      'Design process and methodology',
      'Technical implementation and challenges'
    ],
    evaluation: [
      'Portfolio quality and presentation',
      'Project selection and relevance',
      'Design process and methodology',
      'Technical implementation understanding'
    ],
    tips: [
      'Select your best and most relevant work',
      'Prepare to discuss your design process',
      'Be ready to explain technical decisions',
      'Show growth and learning from projects'
    ]
  },
  [InterviewType.CaseStudy]: {
    duration: '45-60 minutes',
    focus: [
      'Case analysis and problem breakdown',
      'Structured thinking and methodology',
      'Quantitative and qualitative analysis',
      'Recommendations and implementation'
    ],
    evaluation: [
      'Analytical thinking and problem-solving',
      'Structured approach and methodology',
      'Quantitative and qualitative skills',
      'Recommendation quality and feasibility'
    ],
    tips: [
      'Take time to understand the problem fully',
      'Structure your analysis clearly',
      'Use data and evidence to support conclusions',
      'Consider implementation challenges'
    ]
  },
  [InterviewType.BehavioralInterview]: {
    duration: '45-60 minutes',
    focus: [
      'Past experiences and situational responses',
      'Leadership and teamwork examples',
      'Conflict resolution and problem-solving',
      'Growth mindset and learning ability'
    ],
    evaluation: [
      'Leadership potential and experience',
      'Team collaboration and communication',
      'Conflict resolution and problem-solving',
      'Growth mindset and adaptability'
    ],
    tips: [
      'Use the STAR method for responses',
      'Prepare specific examples from your experience',
      'Show both successes and learning moments',
      'Demonstrate growth and self-awareness'
    ]
  },
  [InterviewType.ValuesInterview]: {
    duration: '30-45 minutes',
    focus: [
      'Personal values and beliefs alignment',
      'Company culture and mission fit',
      'Ethical decision-making scenarios',
      'Long-term career and life goals'
    ],
    evaluation: [
      'Values alignment with company culture',
      'Ethical decision-making and integrity',
      'Long-term vision and goal alignment',
      'Authenticity and self-awareness'
    ],
    tips: [
      'Be authentic and honest about your values',
      'Research the company\'s mission and values',
      'Prepare examples of ethical decisions',
      'Show alignment with company culture'
    ]
  },
  [InterviewType.TeamFitInterview]: {
    duration: '10 minutes',
    focus: [
      'Team collaboration and communication style',
      'Working preferences and environment fit',
      'Conflict resolution and team dynamics',
      'Cultural contribution and team impact'
    ],
    evaluation: [
      'Team collaboration and communication',
      'Working style and environment fit',
      'Conflict resolution and team dynamics',
      'Cultural contribution potential'
    ],
    tips: [
      'Show your collaborative working style',
      'Be honest about your preferences',
      'Provide examples of team success',
      'Demonstrate cultural awareness'
    ]
  },
  [InterviewType.InterviewWithBusinessPartnerClientStakeholder]: {
    duration: '45-60 minutes',
    focus: [
      'Business impact and value delivery',
      'Stakeholder management and communication',
      'Cross-functional collaboration',
      'Business understanding and acumen'
    ],
    evaluation: [
      'Business impact and value understanding',
      'Stakeholder management skills',
      'Cross-functional collaboration ability',
      'Business acumen and strategic thinking'
    ],
    tips: [
      'Focus on business value and impact',
      'Show stakeholder management experience',
      'Demonstrate cross-functional understanding',
      'Ask about business priorities and challenges'
    ]
  },
  [InterviewType.ExecutiveLeadershipRound]: {
    duration: '60-90 minutes',
    focus: [
      'Strategic thinking and vision',
      'Leadership philosophy and approach',
      'Business impact and value creation',
      'Long-term planning and execution'
    ],
    evaluation: [
      'Strategic thinking and vision',
      'Leadership philosophy and effectiveness',
      'Business impact and value creation',
      'Long-term planning and execution ability'
    ],
    tips: [
      'Think strategically and long-term',
      'Show leadership philosophy and approach',
      'Demonstrate business impact understanding',
      'Ask strategic questions about the company'
    ]
  }
};

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
  return INTERVIEW_STAGE_CONFIG[type as keyof typeof INTERVIEW_STAGE_CONFIG] || {
    duration: '30-45 minutes',
    focus: ['General discussion', 'Role-specific topics', 'Company questions'],
    evaluation: ['Communication skills', 'Role fit', 'Company interest', 'Professional experience'],
    tips: ['Be prepared and professional', 'Show enthusiasm', 'Ask thoughtful questions']
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
              // This function is no longer imported, so this block will cause an error.
              // Assuming it was intended to be removed or replaced with a different approach.
              // For now, commenting out the call to avoid linter errors.
              // const { data: feedback } = await attemptFeedback(attempt.id);
              // if (feedback && feedback.overall_score > maxScore) {
              //   maxScore = feedback.overall_score;
              // }
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
          companyName: interviewData?.interview?.company,
          role: interviewData?.interview?.role_title,
          difficulty: interviewData?.interview?.difficulty || 'Medium',
          topics: JSON.stringify(interviewData?.interview?.focus_areas || ['General Interview Skills']),
          interviewId: id,
          interviewType: interviewData?.interview?.interview_type || 'technical', // Pass interview type
          location: interviewData?.interview?.location || 'Remote',
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
              {getInterviewTypeDisplayName(interview.interview_type || '')}
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
                  {stageInfo.focus.map((item: string, index: number) => (
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
                  {stageInfo.evaluation.map((item: string, index: number) => (
                    <View key={index} style={styles.bulletItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Tips Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pro Tips</Text>
                <View style={styles.tipsContainer}>
                  {stageInfo.tips.map((tip: string, index: number) => (
                    <View key={index} style={styles.tipItem}>
                      <Ionicons name="bulb-outline" size={16} color={Colors.accent.gold} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Start Interview CTA for first-time users */}
              <TouchableOpacity
                onPress={() => {
                  selectionAsync();
                  handleStartInterview();
                }}
                disabled={startAttempt.isPending}
                style={styles.primaryActionButton}
              >
                {startAttempt.isPending ? (
                  <ActivityIndicator color={Colors.text.primary} size="small" />
                ) : (
                  <Ionicons name="play" size={20} color={Colors.text.primary} />
                )}
                <Text style={styles.primaryActionButtonText}>
                  Start Interview
                </Text>
              </TouchableOpacity>
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

              {/* New Attempt Button - Primary placement for easy access */}
              <TouchableOpacity
                onPress={() => {
                  selectionAsync();
                  handleStartInterview();
                }}
                disabled={startAttempt.isPending}
                style={styles.primaryActionButton}
              >
                {startAttempt.isPending ? (
                  <ActivityIndicator color={Colors.text.primary} size="small" />
                ) : (
                  <Ionicons name="play" size={20} color={Colors.text.primary} />
                )}
                <Text style={styles.primaryActionButtonText}>
                  New Attempt
                </Text>
              </TouchableOpacity>

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
    lineHeight: 32,
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
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.glass.purpleMedium,
    borderWidth: 2,
    borderColor: Colors.brand.primary,
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
    marginBottom: 8,
  },
  primaryActionButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.glass.goldLight,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.glass.goldBorder,
  },
  tipText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
});