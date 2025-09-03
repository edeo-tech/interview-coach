import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../../../../components/ChatGPTBackground';
import BrandfetchLogo from '../../../../../../components/BrandfetchLogo';
import { useInterview, useStartAttempt, useInterviewAttemptsCount, useInterviewAttempts } from '../../../../../../_queries/interviews/interviews';
import usePosthogSafely from '../../../../../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../../../../../hooks/haptics/useHapticsSafely';
import { useInterviewRetryCheck } from '../../../../../../hooks/premium/usePremiumCheck';
import { InterviewType } from '../../../../../../_interfaces/interviews/interview-types';
import { useToast } from '../../../../../../components/Toast';
import { TYPOGRAPHY } from '../../../../../../constants/Typography';
import Colors from '../../../../../../constants/Colors';
import * as Haptics from 'expo-haptics';

const getScoreColor = (score: number | null | undefined): string => {
  if (!score) return Colors.gray[500];
  if (score < 40) return Colors.semantic.error;
  if (score < 70) return Colors.semantic.warning;
  return Colors.semantic.successAlt;
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

const GENERAL_INTERVIEW_TIPS = [
  'Research the company culture, values, and recent news',
  'Practice the STAR method for behavioral questions',
  'Prepare specific examples from your experience',
  'Have thoughtful questions ready about the role and team',
  'Review the job description and align your skills',
  'Practice explaining technical concepts clearly',
  'Be ready to discuss your career goals and motivations'
];

export default function InterviewDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: interviewData, isLoading, error } = useInterview(id);
  const { data: attemptsCount } = useInterviewAttemptsCount(id);
  const { data: attemptsData } = useInterviewAttempts(id, 5);
  const startAttempt = useStartAttempt();
  const { posthogScreen, posthogCapture } = usePosthogSafely();
  const { impactAsync } = useHapticsSafely();
  const { canRetryInterview } = useInterviewRetryCheck();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (Platform.OS === 'web') return;
    posthogScreen('interview_details');
  }, [posthogScreen]);

  const handleStartInterview = async () => {
    if (!interviewData?.interview) return;

    const hasAttempts = attemptsCount?.has_attempts;
    
    if (hasAttempts && !canRetryInterview(hasAttempts)) {
      Alert.alert(
        'Premium Feature',
        'Multiple interview attempts require a premium subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/(app)/paywall') }
        ]
      );
      return;
    }

    try {
      impactAsync(Haptics.ImpactFeedbackStyle.Light);
      posthogCapture('start_interview_attempt', {
        interview_id: id,
        interview_type: interviewData.interview.interview_type,
        company: interviewData.interview.company,
        role: interviewData.interview.role_title,
        has_previous_attempts: hasAttempts
      });

      const response = await startAttempt.mutateAsync(id);
      
      // Navigate to mock-interview with proper parameters for ElevenLabs conversation
      router.push({
        pathname: '/mock-interview',
        params: {
          interviewId: id,
          role: interviewData.interview.role_title,
          companyName: interviewData.interview.company,
          difficulty: interviewData.interview.difficulty || 'mid',
          topics: JSON.stringify([]), // No specific topics for general interviews
          interviewType: interviewData.interview.interview_type,
          callState: 'incoming'
        }
      } as any);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to start interview', 'error');
    }
  };

  const handleAttemptPress = (attemptId: string) => {
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
    posthogCapture('view_attempt_details', {
      interview_id: id,
      attempt_id: attemptId,
      source: 'interview_details'
    });
    router.push(`/interviews/${id}/attempts/${attemptId}/grading` as any);
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ChatGPTBackground>
    );
  }

  const { interview } = interviewData;
  const attempts = attemptsData?.pages.flatMap(page => page.attempts) || [];
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
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Interview Details</Text>
          </View>

          {/* Interview Info */}
          <View style={styles.interviewHeader}>
            <BrandfetchLogo
              identifierType={interview.brandfetch_identifier_type}
              identifierValue={interview.brandfetch_identifier_value}
              fallbackUrl={interview.company_logo_url}
              size={56}
              style={styles.companyLogoContainer}
              fallbackIconColor={Colors.text.primary}
              fallbackIconName="briefcase-outline"
            />
            <View style={styles.interviewHeaderText}>
              <Text style={styles.roleTitle}>{interview.role_title}</Text>
              <Text style={styles.company}>Company: {interview.company}</Text>
            </View>
          </View>
          
          <View style={styles.interviewMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={Colors.text.tertiary} />
              <Text style={styles.metaText}>{interview.location || 'Remote'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={16} color={Colors.text.tertiary} />
              <Text style={styles.metaText}>{interview.experience_level}</Text>
            </View>
          </View>

          {/* Start Interview Button */}
          <TouchableOpacity
            onPress={handleStartInterview}
            style={styles.startButton}
            disabled={startAttempt.isPending}
          >
            {startAttempt.isPending ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="play" size={24} color={Colors.white} />
                <Text style={styles.startButtonText}>
                  {hasAttempts ? 'Retry Interview' : 'Start Interview'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Interview Stats */}
          {hasAttempts && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Performance</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{interview.total_attempts}</Text>
                  <Text style={styles.statLabel}>Attempts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: getScoreColor(interview.best_score) }]}>
                    {interview.best_score}%
                  </Text>
                  <Text style={styles.statLabel}>Best Score</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: getScoreColor(interview.average_score) }]}>
                    {interview.average_score ? `${Math.round(interview.average_score)}%` : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Average Score</Text>
                </View>
              </View>
            </View>
          )}

          {/* Previous Attempts */}
          {hasAttempts ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Previous Attempts</Text>
              <View style={styles.attemptsContainer}>
                {attempts.map((attempt, index) => (
                  <TouchableOpacity
                    key={attempt._id}
                    onPress={() => handleAttemptPress(attempt._id)}
                    style={styles.attemptCard}
                  >
                    <View style={styles.attemptHeader}>
                      <Text style={styles.attemptTitle}>Attempt #{attempts.length - index}</Text>
                      {attempt.score && (
                        <Text style={[styles.attemptScore, { color: getScoreColor(attempt.score) }]}>
                          {attempt.score}%
                        </Text>
                      )}
                    </View>
                    <Text style={styles.attemptDate}>
                      {formatDate(attempt.created_at)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.text.disabled} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            // Interview Tips for first attempt
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Interview Preparation Tips</Text>
              <View style={styles.tipsList}>
                {GENERAL_INTERVIEW_TIPS.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <View style={styles.tipBullet} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
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
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  headerTitle: {
    ...TYPOGRAPHY.pageTitle,
    color: Colors.text.primary,
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    ...TYPOGRAPHY.heading2,
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.purple,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  backButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  interviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
  },
  companyLogoContainer: {
    marginRight: 16,
  },
  interviewHeaderText: {
    flex: 1,
  },
  roleTitle: {
    ...TYPOGRAPHY.heading3,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  company: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary,
  },
  interviewMeta: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
    textTransform: 'capitalize',
  },
  startButton: {
    backgroundColor: Colors.glass.purple,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.glass.purpleTint,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 32,
  },
  startButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: Colors.white,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.glass.background,
    borderRadius: 16,
    padding: 20,
    gap: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.heading2,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  attemptsContainer: {
    gap: 12,
  },
  attemptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass.background,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  attemptHeader: {
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
    ...TYPOGRAPHY.labelMedium,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  tipsContainer: {
    backgroundColor: Colors.glass.background,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  tipsTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  tipsList: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand.primary,
    marginTop: 8,
    flexShrink: 0,
  },
  tipText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
});