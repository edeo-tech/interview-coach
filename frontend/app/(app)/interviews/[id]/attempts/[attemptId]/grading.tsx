import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../../../../../components/ChatGPTBackground';
import { useAttemptFeedback } from '../../../../../../_queries/interviews/feedback';
import usePosthogSafely from '../../../../../../hooks/posthog/usePosthogSafely';
import useHapticsSafely from '../../../../../../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';
import { useFeedbackCheck } from '../../../../../../hooks/premium/usePremiumCheck';
import { getInterviewTypeConfig } from '../../../../../../config/interviewTypeConfigs';
import { InterviewType } from '../../../../../../_api/interviews/feedback';
import { TYPOGRAPHY } from '../../../../../../constants/Typography';

const BlurredSection = ({ 
  children, 
  isBlurred, 
  onUpgradePress,
  showPaywall 
}: { 
  children: React.ReactNode; 
  isBlurred: boolean; 
  onUpgradePress?: () => void;
  showPaywall?: boolean;
}) => {
  if (!isBlurred) {
    return <>{children}</>;
  }

  return (
    <View style={blurredStyles.blurredContainer}>
      <View style={blurredStyles.contentContainer}>
        {children}
      </View>
      {showPaywall && (
        <BlurView intensity={30} tint="dark" style={blurredStyles.blurOverlay}>
          <View style={blurredStyles.upgradeOverlay}>
            <Ionicons name="diamond" size={32} color="#f59e0b" />
            <Text style={blurredStyles.upgradeTitle}>Premium Feature</Text>
            <Text style={blurredStyles.upgradeMessage}>
              Upgrade to Premium to see detailed feedback and scores
            </Text>
            <TouchableOpacity onPress={() => {
              // Heavy impact for upgrade action - critical premium action
              useHapticsSafely().impactAsync(ImpactFeedbackStyle.Heavy);
              onUpgradePress?.();
            }} style={blurredStyles.upgradeButton}>
              <Text style={blurredStyles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      )}
    </View>
  );
};

const blurredStyles = StyleSheet.create({
  blurredContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  contentContainer: {
    borderRadius: 16,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  upgradeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  upgradeTitle: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  upgradeMessage: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default function AttemptGradingScreen() {
  const { id, attemptId, is_from_interview } = useLocalSearchParams<{ id: string; attemptId: string; is_from_interview?: string }>();
  const { data, isLoading, isFetching, refetch } = useAttemptFeedback(attemptId);
  const { posthogScreen } = usePosthogSafely();
  const { impactAsync } = useHapticsSafely();
  const { canViewDetailedFeedback, isPaywallEnabled } = useFeedbackCheck();

  const [pollCount, setPollCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interview_grading');
    }, [posthogScreen])
  );

  // Polling mechanism - check for feedback every 2 seconds
  useEffect(() => {
    if (data) {
      console.log('✅ [GRADING] Feedback received, stopping polling');
      return;
    }

    console.log(`🔄 [GRADING] Starting polling attempt #${pollCount + 1}`);
    
    const pollInterval = setInterval(() => {
      console.log('🔄 [GRADING] Polling for feedback...');
      refetch();
      setPollCount(prev => prev + 1);
    }, 2000);

    return () => {
      console.log('🛑 [GRADING] Cleaning up polling interval');
      clearInterval(pollInterval);
    };
  }, [data, refetch, pollCount]);

  const loading = isLoading || !data;
  const feedbackAccess = canViewDetailedFeedback();

  const renderLoadingState = () => {
    return (
      <View style={styles.center}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#A855F7" />
          <Text style={styles.loadingTitle}>Generating Feedback</Text>
          <Text style={styles.loadingSubtitle}>
            Our AI is analyzing your interview performance to provide personalized feedback.
          </Text>
        </View>
      </View>
    );
  };

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

  const renderFeedback = () => {
    return (
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Score Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Performance</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreDisplay}>
              <Text style={[styles.scoreNumber, { color: getScoreColor(data?.overall_score || 0) }]}>
                {data?.overall_score}
              </Text>
              <Text style={styles.scoreLabel}>
                {getScoreLabel(data?.overall_score || 0)}
              </Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: getScoreColor(data?.overall_score || 0), 
                    width: `${data?.overall_score || 0}%` 
                  }
                ]} />
              </View>
              <Text style={styles.progressText}>
                {data?.overall_score}/100
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Breakdown */}
        <BlurredSection 
          isBlurred={feedbackAccess.shouldBlur} 
          onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
          showPaywall={isPaywallEnabled}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Breakdown</Text>
            <View style={styles.rubricContainer}>
            {(() => {
              const interviewConfig = data?.interview_type ? getInterviewTypeConfig(data.interview_type) : null;
              const rubricScores = data?.rubric_scores || {};
              
              return Object.entries(rubricScores).map(([category, score]) => {
                const scoreValue = score as number;
                const categoryConfig = interviewConfig?.rubricCategories.find(cat => cat.key === category);
                const displayName = categoryConfig?.displayName || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                return (
                  <View key={category} style={styles.rubricItem}>
                    <View style={styles.rubricHeader}>
                      <Text style={styles.rubricCategory}>{displayName}</Text>
                      <Text style={[styles.rubricScore, { color: getScoreColor(scoreValue) }]}>{scoreValue}</Text>
                    </View>
                    <View style={styles.rubricBar}>
                      <View style={[styles.rubricProgress, { backgroundColor: getScoreColor(scoreValue), width: `${scoreValue}%` }]} />
                    </View>
                  </View>
                );
              });
            })()}
            </View>
          </View>
        </BlurredSection>

        {/* Strengths */}
        <BlurredSection 
          isBlurred={feedbackAccess.shouldBlur} 
          onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
          showPaywall={isPaywallEnabled}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Strengths</Text>
            </View>
            {data?.strengths.map((strength, i) => (
              <View key={i} style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{strength}</Text>
              </View>
            ))}
          </View>
        </BlurredSection>

        {/* Areas to Improve */}
        <BlurredSection 
          isBlurred={feedbackAccess.shouldBlur} 
          onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
          showPaywall={isPaywallEnabled}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up" size={20} color="#A855F7" />
              <Text style={styles.sectionTitle}>Areas to Improve</Text>
            </View>
            {data?.improvement_areas.map((area, i) => (
              <View key={i} style={styles.bulletItem}>
                <View style={[styles.bullet, { backgroundColor: '#A855F7' }]} />
                <Text style={styles.bulletText}>{area}</Text>
              </View>
            ))}
          </View>
        </BlurredSection>

        {/* Detailed Feedback */}
        <BlurredSection 
          isBlurred={feedbackAccess.shouldBlur} 
          onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
          showPaywall={isPaywallEnabled}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#A855F7" />
              <Text style={styles.sectionTitle}>Detailed Feedback</Text>
            </View>
            <Text style={styles.feedbackText}>{data?.detailed_feedback}</Text>
          </View>
        </BlurredSection>

        {/* View Transcript */}
        <TouchableOpacity 
          style={styles.transcriptButton}
          onPress={() => {
            if (data) {
              impactAsync(ImpactFeedbackStyle.Light);
              router.push({ 
                pathname: '/interviews/[id]/attempts/[attemptId]/transcript', 
                params: { id, attemptId, is_from_interview: 'false' } 
              });
            }
          }}
          disabled={!data}
        >
          <Ionicons name="document-text" size={20} color={data ? "#A855F7" : "#6B7280"} />
          <Text style={[styles.transcriptButtonText, !data && { color: "#6B7280" }]}>
            View Transcript
          </Text>
          <Ionicons name="chevron-forward" size={16} color={data ? "rgba(255, 255, 255, 0.5)" : "#6B7280"} />
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.header}>
          {/* Only show back button if coming from details (not from interview) */}
          {is_from_interview !== 'true' && (
            <TouchableOpacity 
              onPress={() => {
                impactAsync(ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Interview Feedback</Text>
        </View>
        
        {loading ? renderLoadingState() : data ? renderFeedback() : (
          <View style={styles.center}>
            <View style={styles.emptyCard}>
              <Ionicons name="document-text" size={48} color="#6B7280" />
              <Text style={styles.emptyTitle}>No Feedback Available</Text>
              <Text style={styles.emptySubtitle}>
                Your interview feedback will appear here once it's ready.
              </Text>
            </View>
          </View>
        )}
        
        {/* Only show footer button if coming from interview */}
        {is_from_interview === 'true' && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.primaryButton, 
                !data && styles.primaryButtonDisabled
              ]} 
              onPress={() => {
                if (data) {
                  impactAsync(ImpactFeedbackStyle.Medium);
                  router.replace('/(app)/(tabs)/home');
                }
              }}
              disabled={!data}
              activeOpacity={0.8}
            >
              <Text style={[styles.primaryButtonText, !data && styles.primaryButtonTextDisabled]}>Practice Again & Improve</Text>
              <Ionicons name="arrow-forward" size={20} color={data ? "#ffffff" : "#6B7280"} />
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    gap: 16,
  },
  headerTitle: { 
    ...TYPOGRAPHY.pageTitle,
    color: '#FFFFFF',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreLabel: {
    ...TYPOGRAPHY.itemTitle,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.70)',
    textAlign: 'center',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 12,
    marginTop: 7,
  },
  bulletText: {
    ...TYPOGRAPHY.bodyMedium,
    color: 'rgba(255, 255, 255, 0.85)',
    flex: 1,
    lineHeight: 20,
  },
  feedbackText: {
    ...TYPOGRAPHY.bodyMedium,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
  },
  // Transcript Button Styles
  transcriptButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transcriptButtonText: {
    ...TYPOGRAPHY.itemTitle,
    color: '#FFFFFF',
    flex: 1,
  },

  // Practice Again Button Styles (matching onboarding)
  primaryButton: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgb(169, 85, 247)',
  },
  primaryButtonDisabled: {
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    borderColor: 'rgba(169, 85, 247, 0.3)',
    shadowOpacity: 0,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: '#FFFFFF',
    marginRight: 8,
  },
  primaryButtonTextDisabled: {
    color: '#6B7280',
  },
  footer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  
  // Loading states
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    marginHorizontal: 20,
  },
  loadingTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: 'rgba(255, 255, 255, 0.70)',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: '#10B981',
  },
  disconnected: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },

  // Empty state
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    marginHorizontal: 20,
  },
  emptyTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: 'rgba(255, 255, 255, 0.70)',
    textAlign: 'center',
  },

  // Feedback content
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreLeft: {
    alignItems: 'flex-start',
  },
  scoreRight: {
    alignItems: 'flex-end',
  },
  overallScore: { 
    fontSize: 48, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreOutOf: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  performanceLevel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  overallProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  overallProgress: {
    height: '100%',
    borderRadius: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  rubricContainer: {
    marginTop: 20,
  },
  rubricItem: {
    marginBottom: 20,
  },
  rubricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rubricCategory: {
    ...TYPOGRAPHY.itemTitle,
    color: '#FFFFFF',
  },
  rubricScore: {
    ...TYPOGRAPHY.itemTitle,
    fontWeight: '600',
  },
  rubricBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  rubricProgress: {
    height: '100%',
    borderRadius: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    color: '#10b981',
    marginRight: 12,
    fontSize: 16,
    lineHeight: 20,
  },
  listText: {
    ...TYPOGRAPHY.bodyMedium,
    color: 'rgba(255, 255, 255, 0.85)',
    flex: 1,
  },
  
  // Interview Type Badge Styles
  interviewTypeBadge: {
    marginBottom: 16,
    alignItems: 'center',
  },
  interviewTypeBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  interviewTypeBadgeText: {
    ...TYPOGRAPHY.labelMedium,
    color: '#FFFFFF',
  },
  interviewTypeDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.70)',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  headerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});