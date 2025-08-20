import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAttemptFeedback } from '../../../../_queries/interviews/feedback';
import usePosthogSafely from '../../../../hooks/posthog/usePosthogSafely';
import { useFeedbackCheck } from '../../../../hooks/premium/usePremiumCheck';

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
    <View style={styles.blurredContainer}>
      <BlurView intensity={20} tint="dark" style={styles.blurredContent}>
        {children}
      </BlurView>
      {showPaywall && (
        <View style={styles.upgradeOverlay}>
          <Ionicons name="diamond" size={32} color="#f59e0b" />
          <Text style={styles.upgradeTitle}>Premium Feature</Text>
          <Text style={styles.upgradeMessage}>
            Upgrade to Premium to see detailed feedback and scores
          </Text>
          <TouchableOpacity onPress={onUpgradePress} style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const InterviewResults = () => {
  const { id, attemptId } = useLocalSearchParams<{ id: string; attemptId: string }>();
  const { data: feedback, isLoading, error } = useAttemptFeedback(attemptId);
  const { posthogScreen } = usePosthogSafely();
  const { canViewDetailedFeedback, isPaywallEnabled } = useFeedbackCheck();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;
      posthogScreen('interview_results');
    }, [posthogScreen])
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#f97316';
    return '#ef4444';
  };

  const getScoreBackgroundStyle = (score: number) => {
    if (score >= 90) return { backgroundColor: 'rgba(5, 46, 22, 0.15)', borderColor: 'rgba(34, 197, 94, 0.25)' };
    if (score >= 80) return { backgroundColor: 'rgba(30, 58, 138, 0.15)', borderColor: 'rgba(59, 130, 246, 0.25)' };
    if (score >= 70) return { backgroundColor: 'rgba(146, 64, 14, 0.15)', borderColor: 'rgba(245, 158, 11, 0.25)' };
    if (score >= 60) return { backgroundColor: 'rgba(154, 52, 18, 0.15)', borderColor: 'rgba(249, 115, 22, 0.25)' };
    return { backgroundColor: 'rgba(127, 29, 29, 0.15)', borderColor: 'rgba(239, 68, 68, 0.25)' };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Work';
    return 'Poor';
  };

  const RubricScore = ({ category, score }: { category: string; score: number }) => (
    <View style={styles.rubricItem}>
      <Text style={styles.rubricCategory}>{category.replace('_', ' ')}</Text>
      <View style={styles.rubricRight}>
        <Text style={[styles.rubricScore, { color: getScoreColor(score) }]}>
          {score}/100
        </Text>
        <View style={styles.progressBarContainer}>
          <View 
            style={[styles.progressBar, { backgroundColor: getScoreColor(score), width: `${score}%` }]}
          />
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <View style={styles.spinner} />
            <Text style={styles.loadingTitle}>Analyzing your interview...</Text>
            <Text style={styles.loadingSubtitle}>This may take a few moments</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error || !feedback) {
    return (
      <LinearGradient
        colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text style={styles.errorTitle}>Analysis Failed</Text>
            <Text style={styles.errorSubtitle}>
              We couldn't analyze your interview. Please try again.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.errorButton}
            >
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const feedbackAccess = canViewDetailedFeedback();

  return (
    <LinearGradient
      colors={["#0B1023", "#0E2B3A", "#2C7A91"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/interviews/index' as any)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Interview Results</Text>
          </View>

          {/* Overall Score */}
          <View style={[styles.scoreCard, getScoreBackgroundStyle(feedback.overall_score)]}>
            <Text style={styles.sectionTitle}>Overall Performance</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreLeft}>
                <Text style={[styles.overallScore, { color: getScoreColor(feedback.overall_score) }]}>
                  {feedback.overall_score}
                </Text>
                <Text style={styles.scoreOutOf}>out of 100</Text>
              </View>
              <View style={styles.scoreRight}>
                <Text style={[styles.scoreLabel, { color: getScoreColor(feedback.overall_score) }]}>
                  {getScoreLabel(feedback.overall_score)}
                </Text>
                <Text style={styles.performanceLevel}>Performance Level</Text>
              </View>
            </View>
          </View>

          {/* Rubric Breakdown */}
          <BlurredSection 
            isBlurred={feedbackAccess.shouldBlur} 
            onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
            showPaywall={isPaywallEnabled}
          >
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Detailed Scores</Text>
              {Object.entries(feedback.rubric_scores).map(([category, score]) => (
                <RubricScore key={category} category={category} score={score} />
              ))}
            </View>
          </BlurredSection>

          {/* Strengths */}
          <BlurredSection 
            isBlurred={feedbackAccess.shouldBlur} 
            onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
            showPaywall={isPaywallEnabled}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.sectionTitle}>Strengths</Text>
              </View>
              {feedback.strengths.map((strength, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listText}>{strength}</Text>
                </View>
              ))}
            </View>
          </BlurredSection>

          {/* Areas for Improvement */}
          <BlurredSection 
            isBlurred={feedbackAccess.shouldBlur} 
            onUpgradePress={() => isPaywallEnabled && router.push('/paywall?source=feedback' as any)}
            showPaywall={isPaywallEnabled}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="trending-up" size={20} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Areas for Improvement</Text>
              </View>
              {feedback.improvement_areas.map((area, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={[styles.bulletPoint, { color: '#f97316' }]}>•</Text>
                  <Text style={styles.listText}>{area}</Text>
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
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Detailed Feedback</Text>
              <Text style={styles.detailedText}>{feedback.detailed_feedback}</Text>
            </View>
          </BlurredSection>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => router.push('/interviews/setup')}
              style={[styles.actionButton, styles.primaryButton]}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.actionButtonText}>Practice Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/interviews/${id}/details`)}
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <Ionicons name="list" size={20} color="white" />
              <Text style={styles.actionButtonText}>View All Attempts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/interviews/index' as any)}
              style={[styles.actionButton, styles.tertiaryButton]}
            >
              <Ionicons name="home" size={20} color="white" />
              <Text style={styles.actionButtonText}>Back to Interviews</Text>
            </TouchableOpacity>
          </View>

          {/* Tips for Improvement */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Next Steps</Text>
            <Text style={styles.tipText}>• Review the areas for improvement above</Text>
            <Text style={styles.tipText}>• Practice common questions for similar roles</Text>
            <Text style={styles.tipText}>• Work on specific technical concepts mentioned</Text>
            <Text style={styles.tipText}>• Try another practice interview to track progress</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

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
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  spinner: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderTopColor: 'transparent',
    borderRadius: 24,
    marginBottom: 16,
  },
  loadingTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  errorSubtitle: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  errorButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  errorButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
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
  scoreCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: '#9ca3af',
    fontSize: 14,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  performanceLevel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rubricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  rubricCategory: {
    color: '#ffffff',
    fontSize: 15,
    textTransform: 'capitalize',
    flex: 1,
  },
  rubricRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rubricScore: {
    fontWeight: 'bold',
    marginRight: 12,
    fontSize: 14,
  },
  progressBarContainer: {
    width: 64,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
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
    color: '#d1d5db',
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  detailedText: {
    color: '#d1d5db',
    fontSize: 15,
    lineHeight: 22,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tertiaryButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    color: '#bfdbfe',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  blurredContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  blurredContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  upgradeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
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

export default InterviewResults;