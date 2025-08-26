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
import { GlassStyles, GlassTextColors } from '../../../../../../constants/GlassStyles';
import { getInterviewTypeConfig } from '../../../../../../config/interviewTypeConfigs';
import { InterviewType } from '../../../../../../_api/interviews/feedback';

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
    const interviewConfig = data?.interview_type ? getInterviewTypeConfig(data.interview_type) : null;
    
    return (
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Interview Type Badge */}
        {interviewConfig && (
          <View style={styles.interviewTypeBadge}>
            <LinearGradient
              colors={[interviewConfig.primaryColor, interviewConfig.secondaryColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.interviewTypeBadgeGradient}
            >
              <Ionicons name={interviewConfig.icon as any} size={20} color="#fff" />
              <Text style={styles.interviewTypeBadgeText}>{interviewConfig.displayName}</Text>
            </LinearGradient>
            <Text style={styles.interviewTypeDescription}>{interviewConfig.description}</Text>
          </View>
        )}
        
        <View style={styles.overallScoreCard}>
        <Text style={styles.sectionTitle}>Overall Performance</Text>
        <View style={styles.scoreRow}>
          <View style={styles.scoreLeft}>
            <Text style={[styles.overallScore, { color: getScoreColor(data?.overall_score || 0) }]}>
              {data?.overall_score}
            </Text>
            <Text style={styles.scoreOutOf}>out of 100</Text>
          </View>
          <View style={styles.scoreRight}>
            <Text style={[styles.scoreLabel, { color: getScoreColor(data?.overall_score || 0) }]}>
              {getScoreLabel(data?.overall_score || 0)}
            </Text>
            <Text style={styles.performanceLevel}>Performance Level</Text>
          </View>
        </View>
        <View style={styles.overallProgressBar}>
          <View style={[styles.overallProgress, { backgroundColor: getScoreColor(data?.overall_score || 0), width: `${data?.overall_score || 0}%` }]} />
        </View>
      </View>

      <BlurredSection 
        isBlurred={feedbackAccess.shouldBlur} 
        onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
        showPaywall={isPaywallEnabled}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Performance Breakdown</Text>
          {(() => {
            const interviewConfig = data?.interview_type ? getInterviewTypeConfig(data.interview_type) : null;
            const rubricScores = data?.rubric_scores || {};
            
            return Object.entries(rubricScores).map(([category, score]) => {
              const categoryConfig = interviewConfig?.rubricCategories.find(cat => cat.key === category);
              const displayName = categoryConfig?.displayName || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              
              return (
                <View key={category} style={styles.rubricItem}>
                  <View style={styles.rubricHeader}>
                    <View>
                      <Text style={styles.rubricCategory}>{displayName}</Text>
                      {categoryConfig?.description && (
                        <Text style={styles.rubricDescription}>{categoryConfig.description}</Text>
                      )}
                    </View>
                    <Text style={[styles.rubricScore, { color: getScoreColor(score) }]}>{score}/100</Text>
                  </View>
                  <View style={styles.rubricBar}>
                    <View style={[styles.rubricProgress, { backgroundColor: getScoreColor(score), width: `${score}%` }]} />
                  </View>
                </View>
              );
            });
          })()}
        </View>
      </BlurredSection>

      <BlurredSection 
        isBlurred={feedbackAccess.shouldBlur} 
        onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
        showPaywall={isPaywallEnabled}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Strengths</Text>
          </View>
          {data?.strengths.map((s, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>{s}</Text>
            </View>
          ))}
        </View>
      </BlurredSection>

      <BlurredSection 
        isBlurred={feedbackAccess.shouldBlur} 
        onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
        showPaywall={isPaywallEnabled}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Areas to Improve</Text>
          </View>
          {data?.improvement_areas.map((s, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={[styles.bulletPoint, { color: '#f97316' }]}>•</Text>
              <Text style={styles.listText}>{s}</Text>
            </View>
          ))}
        </View>
      </BlurredSection>

      <BlurredSection 
        isBlurred={feedbackAccess.shouldBlur} 
        onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
        showPaywall={isPaywallEnabled}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Detailed Feedback</Text>
          </View>
          <Text style={styles.detailedFeedback}>{data?.detailed_feedback}</Text>
        </View>
      </BlurredSection>

        {/* View Transcript Section */}
        <TouchableOpacity 
        style={[styles.transcriptCard, !data && styles.transcriptCardDisabled]}
        onPress={() => {
          if (data) {
            // Light impact for viewing transcript - secondary action
            impactAsync(ImpactFeedbackStyle.Light);
            router.push({ 
              pathname: '/interviews/[id]/attempts/[attemptId]/transcript', 
              params: { id, attemptId, is_from_interview: 'false' } 
            });
          }
        }}
        disabled={!data}
      >
        <View style={styles.transcriptCardContent}>
          <View style={styles.transcriptCardLeft}>
            <View style={styles.transcriptIconContainer}>
              <Ionicons name="document-text-outline" size={24} color={data ? "#F59E0B" : "#6B7280"} />
            </View>
            <View style={styles.transcriptTextContainer}>
              <Text style={[styles.transcriptTitle, !data && styles.transcriptTitleDisabled]}>
                View Interview Transcript
              </Text>
              <Text style={[styles.transcriptSubtitle, !data && styles.transcriptSubtitleDisabled]}>
                Review the full conversation and your responses
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={data ? "#F59E0B" : "#6B7280"} />
        </View>
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
              style={styles.backButton} 
              onPress={() => {
                // Light impact for navigation back - minor action
                impactAsync(ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Interview Feedback</Text>
          {data?.interview_type && (
            <View style={styles.headerBadge}>
              <Ionicons 
                name={getInterviewTypeConfig(data.interview_type).icon as any} 
                size={20} 
                color={getInterviewTypeConfig(data.interview_type).primaryColor} 
              />
            </View>
          )}
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
            <LinearGradient
              colors={["#A855F7", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.primaryButtonOuter, !data && styles.primaryButtonOuterDisabled]}
            >
              <TouchableOpacity
                style={[styles.primaryButtonInner, !data && styles.primaryButtonInnerDisabled]}
                onPress={() => {
                  if (data) {
                    impactAsync(ImpactFeedbackStyle.Medium);
                    router.replace('/(app)/(tabs)/home');
                  }
                }}
                activeOpacity={0.9}
                disabled={!data}
              >
                <Ionicons name="refresh-circle" size={24} color={data ? "#fff" : "#6B7280"} />
                <Text style={[styles.practiceAgainText, !data && styles.practiceAgainTextDisabled]}>Practice Again & Improve</Text>
                <Ionicons name="arrow-forward" size={20} color={data ? "#fff" : "#6B7280"} />
              </TouchableOpacity>
            </LinearGradient>
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
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold', 
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 24,
  },
  footer: { 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  // Transcript Card Styles
  transcriptCard: {
    ...GlassStyles.container,
    padding: 20,
    marginBottom: 16,
  },
  transcriptCardDisabled: {
    ...GlassStyles.containerSecondary,
  },
  transcriptCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transcriptCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transcriptIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transcriptTextContainer: {
    flex: 1,
  },
  transcriptTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transcriptTitleDisabled: {
    color: '#6B7280',
  },
  transcriptSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 18,
  },
  transcriptSubtitleDisabled: {
    color: '#6B7280',
  },

  // Practice Again Button Styles
  primaryButtonOuter: {
    borderRadius: 28,
    padding: 2,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#A855F7',
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  primaryButtonOuterDisabled: {
    opacity: 0.6,
  },
  primaryButtonInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    height: 52,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryButtonInnerDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  practiceAgainText: {
    color: GlassTextColors.primary,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  practiceAgainTextDisabled: {
    color: '#6B7280',
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  
  // Loading states
  loadingCard: {
    ...GlassStyles.card,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    marginHorizontal: 20,
  },
  loadingTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
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
    ...GlassStyles.card,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    marginHorizontal: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Feedback content
  overallScoreCard: {
    ...GlassStyles.card,
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    color: GlassTextColors.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
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

  card: { 
    ...GlassStyles.card, 
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  rubricItem: {
    marginBottom: 16,
  },
  rubricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rubricCategory: {
    color: GlassTextColors.primary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  rubricDescription: {
    color: GlassTextColors.muted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  rubricScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  rubricBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rubricProgress: {
    height: '100%',
    borderRadius: 3,
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
    color: GlassTextColors.muted,
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  detailedFeedback: {
    color: GlassTextColors.muted,
    lineHeight: 22,
    fontSize: 15,
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  interviewTypeDescription: {
    color: GlassTextColors.muted,
    fontSize: 13,
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